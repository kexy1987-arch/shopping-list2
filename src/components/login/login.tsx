import styles from './login.module.css'
import { Link } from 'react-router-dom'
import { useRef } from 'react'
import type { user } from '../../utils/types'

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
            body: JSON.stringify({
                email: email,
                password: password
            })
        })

        const res = await req.json();

        if(res.ok){
            setUser(res.user)
            setToken(res.token)
            localStorage.setItem("shopping-list", res.token)
            return;
        }

        if(!res.ok){
            alert(res.error)
            return;
        }
    }

    return(
        <>
            <form>
                <fieldset className={styles.login}>
                    <legend>Login</legend>
                    <label htmlFor="email">Email</label>
                    <input ref={ emailRef } id="email" type="text" required/>
                    <label htmlFor="password">Password</label>
                    <input ref={ passwordRef }id="password" type="password" required />
                </fieldset>
                <p><Link to="/newaccount">New Account</Link></p>
                <button onClick={(e) => handleLogin(e)} type="submit">Log in</button>
            </form>
        </>
    )
}