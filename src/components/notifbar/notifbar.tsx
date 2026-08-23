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
                if (notifRef.current) notifRef.current.style.transform = "translateY(0px)";
            }, 100)

            setTimeout(() => {
                if (notifRef.current) notifRef.current.style.transform = "translateY(-100px)";
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