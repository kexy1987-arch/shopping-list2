import { useRef, useState } from 'react'
import styles from './newAccount.module.css'
import { useNavigate } from 'react-router-dom';
import CountrySelect from '../../components/countrySelect/countrySelect';

export default function NewAccount() {
    const emailRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const password2Ref = useRef<HTMLInputElement>(null);
    const firstNameRef = useRef<HTMLInputElement>(null);
    const lastNameRef = useRef<HTMLInputElement>(null);
    const [ country, setCountry] = useState<string>("");
    const API = import.meta.env.VITE_WORKER_API;
    const navigate = useNavigate();

    async function handleSubmit(e: React.MouseEvent<HTMLButtonElement>) {
        
        e.preventDefault();
        const email = emailRef.current?.value;
        const firstName = firstNameRef.current?.value;
        const lastName = lastNameRef.current?.value;
        const password = passwordRef.current?.value;
        const password2 = password2Ref.current?.value;

        if (!email || !firstName || !lastName|| (!password || password.length < 8) || (!password2 || password2.length < 8) || !country){
            if(!firstName){
                firstNameRef.current!.style.borderColor = "red";
            }
            if (!lastName) {
                lastNameRef.current!.style.borderColor = "red";
            }
            if (!email) {
                emailRef.current!.style.borderColor = "red";
            }
            if (!password || password.length < 8) {
                passwordRef.current!.style.borderColor = "red";
            }
            if (!password2 || password2.length < 8) {
                password2Ref.current!.style.borderColor = "red";
            }
            return;
        }        
        
        if(password !== password2){
            alert("Passwords are not the same")
            return;
        };

        const req = await fetch(`${API}/newacc`, {
            method: "POST",
            body: JSON.stringify({
                email: email.toLocaleLowerCase(),
                password: password,
                first_name: firstName.toLocaleLowerCase(),
                last_name: lastName.toLocaleLowerCase(),
                country
            })
        })

        const res = await req.json();

        if(res.ok){
            alert(res.message);            
            navigate("/")
            return;
        }

        if(!res.ok){
            console.log(res.error);
            if(res.error === "USER_EXISTS"){
                alert("User already exists!")
                return;
            }
            alert("Something went wrong");
        }
    }

    function borderColorGreen(e: React.ChangeEvent<HTMLInputElement>){
        if(e.currentTarget.value.length !== 0 ){
            e.currentTarget.style.borderColor = "yellowgreen";
            return;
        }
        e.currentTarget.style.borderColor = "red";  
    }

    return (
        <form>
            <fieldset className={styles["new-account"]}>
                <legend>New Account</legend>
                <label htmlFor="email">Email</label>
                <input onChange={(e) => borderColorGreen(e)} ref={emailRef} id="email" type="text" required />
                <label>Country:</label>
                <CountrySelect setCountry={setCountry}/>
                <label htmlFor="first-name">First Name</label>
                <input onChange={(e) => borderColorGreen(e)} ref={firstNameRef} id="first-name" type="text" required />
                <label htmlFor="last-name">Last Name</label>
                <input onChange={(e) => borderColorGreen(e)} ref={lastNameRef} id="last-name" type="text" required />
                <label htmlFor="password">Password</label>
                <input onChange={(e) => borderColorGreen(e)} ref={passwordRef} id="password" type="password" autoComplete='off' required />
                <label htmlFor="password2">Re type Password</label>
                <input onChange={(e) => borderColorGreen(e)} ref={password2Ref} id="password2" type="password" autoComplete='off' required />
            </fieldset>
            <button type="submit" onClick={(e) => handleSubmit(e)}>Submit</button>
        </form>
    )
}