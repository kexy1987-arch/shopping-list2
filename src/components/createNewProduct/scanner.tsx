import BarcodeScanner from "react-qr-barcode-scanner";
import { useState } from "react";
import styles from './createNewProduct.module.css'

type scannerProps = {
    setData: (value: string | null) => void,
    setShowScanner: (value: boolean) => void
}

export default function Scanner({ setData, setShowScanner }:scannerProps){
    const [ check, setCheck ] = useState<string | null>(null);

    return(
        <div className={styles.scanner}>
            <header className={styles.header}>
                <h2>Barcode Scanner</h2>
                <button onClick={() => setShowScanner(false)}>X</button>
            </header>
            <BarcodeScanner
                width={600}
                height={600}
                onUpdate={(err, result) => {
                    if(result) {
                        setData(result.getText());
                        setCheck(result.getText());
                        setShowScanner(false);
                    }
                    if(err){
                        return;
                    }
                }}
            />
            <p>Results: {check ?? "No barcode detected"}</p>
        </div>
    )
}