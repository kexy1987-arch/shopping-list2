import styles from './modal.module.css'
import { useState, useEffect } from 'react'
import type { ReactNode } from 'react';

type ModalProps = {
    message: ReactNode
}

export default function Modal({message}: ModalProps) {
    const [ showModal, setShowModal ] = useState<boolean>(false);

    useEffect(() => {
        if(message) setShowModal(true)
    }, [message])


    return(
        <>
        {showModal && <div onClick={() => setShowModal(false)}className={styles.modal}>
        {message}
        </div>}
        </>
    )
}