import styles from './login.module.css'
import { Link } from 'react-router-dom'

type LoginProps = {
    setToken: (value: string) => void
}

export default function Login({setToken}:LoginProps){

    return(
        <>
            <form>
                <fieldset className={styles.login}>
                    <legend>Login</legend>
                    <label htmlFor="email">Email</label>
                    <input id="email" type="text" required/>
                    <label htmlFor="password">Password</label>
                    <input id="password" type="password" required />
                </fieldset>
                <p><Link to="/newaccount">New Account</Link></p>
                <button type="submit">Log in</button>
            </form>
        </>
    )
}