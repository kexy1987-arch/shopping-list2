import styles from './countrySelect.module.css'
import { countries }from '../../utils/countries'
import { useRef, useState } from 'react'
import { titleCase } from '../../utils/functions';

type CountrySelectProps = {
    setCountry: (value: string) => void;
}

export default function CountrySelect({setCountry}: CountrySelectProps){
    const countryRef = useRef<HTMLInputElement>(null);
    const [ results, setResults ] = useState<string[] | null>(null);

    function handleCountry(e: React.ChangeEvent<HTMLInputElement>){
        const input = titleCase(e.currentTarget.value)
        const userCountry = countries.filter(c => c.includes(input!));
        
        setResults(userCountry);        
    }

    function handleEnter(e: React.KeyboardEvent<HTMLInputElement>) {
        const input = titleCase(e.currentTarget.value)
        const userCountry = countries.filter(c => c.includes(input!));

        if (e.key === "Enter") {
            setCountry(userCountry[0]);
            setResults(null)
            countryRef.current!.placeholder = userCountry[0];
            countryRef.current!.value = ""
        }
    }

    function handleSelect(res: string){        
        countryRef.current!.placeholder = res;
        setResults(null);
        setCountry(res);
    }

    return(
        <div className={styles.wrapper}>
            <input className={styles.input} ref={countryRef} onKeyDown={(e) => handleEnter(e)} onChange={(e) => handleCountry(e)} type="text" />
            <div className={styles.res}>
                {results?.map(res => (
                    <p onClick={() => handleSelect(res)}>{res}</p>
                ))}
            </div>
            
        </div>
    )
}