import { useEffect, useState } from 'react'
import type { product } from '../../utils/types';
import styles from './globalList.module.css'
import { titleCase } from '../../utils/functions';
import type { ListItem } from '../../utils/types';

type GlobalListProps = {
    myList: ListItem[],
    setMyList: ( value: ListItem[] | ( (prev: ListItem[]) => ListItem[]) ) => void,
}

export default function GlobalList({myList, setMyList}:GlobalListProps){
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

    function addToMyList(productId: number){
        setMyList(prev => {
            const exist = myList.find(item => item.id === productId);

            if(exist) {
                return prev.map(item => item.id === productId ? {...item, amount: item.amount + 1 } : item)
            }

            return [...prev, {id: productId, amount: 1}]
        })
    }

    return(



        <div className='z-index'>
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
                            <button onClick={() => addToMyList(Number(product.id))}>Add to my list</button>
                        </div>
                    </div>
                ))
                : ""
                }
        </div>
    )
}