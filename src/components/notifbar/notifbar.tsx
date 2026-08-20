import styles from './notifbar.module.css'
import { useState, useEffect, useRef } from 'react'

type NotifBarProps = {
    message: string;
}

export default function NotifBar({message}: NotifBarProps){
    const [ toRender, setToRender ] = useState<string>("");
    const notifRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setToRender(message);
        if (message){
            setTimeout(() => {
                if (notifRef.current) notifRef.current.style.opacity = "1";
            }, 100)

            setTimeout(() => {
                if (notifRef.current) notifRef.current.style.opacity = "0";
            }, 5000)
        }
        
        
    }, [message])

    return(
        <>
            <div ref={notifRef} className={styles.notifbar}>
                {toRender}
            </div>
        </>
        
    )
}