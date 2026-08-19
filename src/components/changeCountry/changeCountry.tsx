import { useState, useEffect } from "react";
import CountrySelect from "../countrySelect/countrySelect";
import styles from './changeCountry.module.css'
import type { user } from "../../utils/types";

type ChangeCountryProps = {
    user: user
}

export default function ChangeCountry({user}: ChangeCountryProps){
    const [ country, setCountry] = useState<string>(user.country);
    const [showSelect, setShowSelect] = useState<boolean>(false);
    const API = import.meta.env.VITE_WORKER_API;

    async function updateCountry(user: user){
        if(user.country === country)return;

        const req = await fetch(`${API}/updateCountry`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userId: user.id,
                country
            })
        })

        const res = await req.json();

        if(res.ok){
            alert(`Country changed to ${country}`)
        }
        setShowSelect(false)
    }

    useEffect(() => {
        updateCountry(user)
    }, [country]);

    return(
        <>
            <button className={styles.country} onClick={() => setShowSelect(!showSelect)}>{user.country}</button>
            {showSelect && 
                <div className={styles.modal}>
                    <h2>Change country</h2>
                    <CountrySelect setCountry={setCountry} />
                    <button onClick={() => setShowSelect(false)}>Cancel</button>
                </div>
            }            
        </>
    )
}