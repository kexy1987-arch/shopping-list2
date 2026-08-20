import styles from './countrySelect.module.css'
import { countries }from '../../utils/countries'
import { useRef, useState, useEffect } from 'react'
import { titleCase } from '../../utils/functions';

type CountrySelectProps = {
    setCountry: (value: string) => void;
    reset?: boolean;
}

export default function CountrySelect({setCountry, reset= true}: CountrySelectProps){
    const countryRef = useRef<HTMLInputElement>(null);
    const [ results, setResults ] = useState<string[] | null>(null);

    useEffect(() => {
        countryRef.current!.value = "";
        countryRef.current!.style.removeProperty("border");
    },[reset])

    function handleCountry(e: React.ChangeEvent<HTMLInputElement>){
        const input = titleCase(e.currentTarget.value)
        const userCountry = countries.filter(c => c.includes(input!));
        
        setResults(userCountry);        
    }

    function handleEnter(e: React.KeyboardEvent<HTMLInputElement>) {
        const input = titleCase(e.currentTarget.value) || ""
        const userCountry = countries.filter(c => c.includes(input!));

        if (e.key === "Enter" && input) {
            setCountry(userCountry[0]);
            setResults(null)
            countryRef.current!.value = userCountry[0];
            e.currentTarget.style.borderColor = "yellowgreen";
            return;
        }
        e.currentTarget.style.borderColor = "red";
    }

    function handleSelect(res: string){
        countryRef.current!.value = res;
        countryRef.current!.style.border = "1px solid yellowgreen";
        setResults(null);
        setCountry(res);
    }

    return(
        <div className={styles.wrapper}>
            <input className={styles.input} ref={countryRef} onKeyDown={(e) => handleEnter(e)} onChange={(e) => handleCountry(e)} type="text" />
            <div className={styles.res}>
                {results?.map(res => (
                    <p key={res} onClick={() => handleSelect(res)}>{res}</p>
                ))}
            </div>
            
        </div>
    )
}