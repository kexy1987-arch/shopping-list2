import styles from './login.module.css'
import { Link } from 'react-router-dom'
import { useRef } from 'react'
import type { user } from '../../utils/types'
import { loadTheme } from '../../utils/functions'

type LoginProps = {
    setToken: (value: string) => void;
    setUser: (value: user) => void;
}

export default function Login({setToken, setUser}:LoginProps){
    const API = import.meta.env.VITE_WORKER_API;
    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);


    async function handleLogin(e: React.MouseEvent<HTMLButtonElement>){
        e.preventDefault();
        const email = emailRef.current?.value;
        const password = passwordRef.current?.value;

        if(!email || !password)return;

        const req = await fetch(`${API}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        })

        const res = await req.json();

        if(res.ok){
            setUser(res.user)
            setToken(res.token)
            loadTheme(res.user.theme)
            localStorage.setItem("shopping-list", res.token)
            return;
        }

        if(!res.ok){
            alert(res.error)
            return;
        }
    }

    return(
        <div className={styles.main}>
            <form className={styles.form}>
                <fieldset className={styles.login}>
                    <legend>Login</legend>
                    <label htmlFor="email">Email</label>
                    <input ref={ emailRef } id="email" type="text" name="email" autoComplete="email" required/>
                    <label htmlFor="password">Password</label>
                    <input ref={ passwordRef } id="password" type="password" name="password"  autoComplete='current-password' required />
                </fieldset>
                <p><Link to="/newaccount">New Account</Link></p>
                <button onClick={(e) => handleLogin(e)} type="submit">Log in</button>
            </form>
        </div>
    )
}