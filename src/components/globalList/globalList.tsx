import { useEffect, useState } from 'react'
import type { product } from '../../utils/types';
import styles from './globalList.module.css'
import { titleCase } from '../../utils/functions';

export default function GlobalList(){
    const API = import.meta.env.VITE_WORKER_API
    const [list, setList] = useState<product[] | null>(null);

    async function getProducts() {
        const res = await fetch(`${API}/get-products`)
        const data = await res.json()
        console.log(data.list.results)

        if ( data.ok ) setList(data.list.results)

    }

    useEffect(() => {
        getProducts()        
    }, [])

    async function addToMyList(){
        alert("added")
    }

    return(



        <>
            <header className="header">
                <h2>Global Product List</h2>
            </header>
                {list ? list.map(product => (
                    <div key={product.id} className={styles["product-card"]}>                        
                        <div className={styles["card-img-container"]}>
                            <img className={styles["card-img"]} src={product.image_url} alt={`Photo of ${product.name}`} />
                        </div>
                        <div>
                            <h3>{titleCase(product.name)}</h3>
                            <p>{titleCase(product.store)}</p>
                            <p>Price: €{product.price}</p>
                            <p>Category: {titleCase(product.category)}</p>
                        </div>
                        <div>
                            <button onClick={() => addToMyList()}>Add to my list</button>
                        </div>
                    </div>
                ))
                : ""
                }
            
            
        </>
    )
}