import type { DbProduct } from "../../utils/types"
import styles from './scannerRes.module.css'
import { titleCase } from "../../utils/functions"

type ScannerResProps = {
    items: DbProduct[];
    setSelectedItem: (value: DbProduct | null) => void;
    setShow: (value: boolean) => void;
}

export default function ScannerRes({items, setSelectedItem, setShow}: ScannerResProps){

    return(
        <div className={styles["modal"]}>
            <button onClick={(() => {setSelectedItem(null); setShow(false)})}>Close List</button>
            {items.map(item => (
                <div key={item.id} className={styles["product-card"]}>
                    <div className={styles["card-img-container"]}>
                        <img className={styles["card-img"]} src={item.image_url} alt={`Photo of ${item.name}`} />
                    </div>
                    <div>
                        <h3>{titleCase(item.name)}</h3>
                        <p>{titleCase(item.store)}</p>
                        <p>Price: €{item.price}</p>
                        <p>Category: {titleCase(item.category)}</p>
                    </div>
                    <div>
                        <button onClick={() => {setSelectedItem(item); setShow(false)}}>Choose</button>
                    </div>
                </div>
            ))}
        </div>
    )
}