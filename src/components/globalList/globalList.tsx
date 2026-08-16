import { useEffect, useState } from 'react'
import type { product } from '../../utils/types';
import styles from './globalList.module.css'
import { titleCase } from '../../utils/functions';
import type { ListItem, DbProduct } from '../../utils/types';
import Scanner from '../createNewProduct/scanner';
import ItemFound from './itemFound';

type GlobalListProps = {
    myList: ListItem[],
    setMyList: ( value: ListItem[] | ( (prev: ListItem[]) => ListItem[]) ) => void,
    setFavorites: React.Dispatch<React.SetStateAction<DbProduct[]>>
}

export default function GlobalList({myList, setMyList, setFavorites}:GlobalListProps){
    const API = import.meta.env.VITE_WORKER_API
    const [list, setList] = useState<product[] | null>(null);
    const [itemFound, setItemFound] = useState<product[] | null>(null);
    const [showScanner, setShowScanner] = useState<boolean>(false);
    const [barcode, setBarcode] = useState<string | null>("");
    const [itemDescription, setItemDescription] = useState<product | null>(null);


    async function getProducts() {
        const res = await fetch(`${API}/get-products`)
        const data = await res.json()

        if ( data.ok ) {
            setList(data.list)
            console.log(data)
        }

    }

    function findByBarcode(barcode: string){
        const product = list?.filter(product => product.barcode === barcode)
        if(!product) return;
        setItemFound(product);
    }

    useEffect(() => {
        findByBarcode(barcode!);
    }, [barcode])

    useEffect(() => {
        getProducts()        
    }, [])

    function addToMyList(e: React.MouseEvent<HTMLButtonElement>, productId: number){
        e.stopPropagation();
        setMyList(prev => {
            const exist = myList.find(item => item.id === productId);

            if(exist) {
                return prev.map(item => item.id === productId ? {...item, amount: item.amount + 1 } : item)
            }

            return [...prev, {id: productId, amount: 1, bought: false}]
        })
    }

    return(
        <div className='z-index'>
            <header className="header">
                <h2>Global Product List</h2>
            </header>
            <div>
                <button onClick={() => setShowScanner(true)}>Find by Barcode</button>
            </div>
            {itemFound && <ItemFound products={itemFound} addToMyList={addToMyList} setItemFound={setItemFound}/>}
            {showScanner && <Scanner setData={setBarcode} setShowScanner={setShowScanner}/>}
            {list ? list.map(product => (
                <div key={product.id} className={styles["product-card"]} onClick={() => {setItemDescription(product); console.log(product)}}>                        
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
                        <button onClick={(e) => addToMyList(e, Number(product.id))}>Add to my list</button>
                        <button onClick={() => setFavorites(prev => [...prev, product])}>Add to Favorites</button>
                    </div>
                </div>
            ))
            : ""
            }
            {
            itemDescription && 
            <div className={styles["description-modal"]} onClick={() => setItemDescription(null)}>
                <h2>{itemDescription.name.toUpperCase()}</h2>
                <div className={styles["img-container"]}>
                    <img className={styles["card-img"]} src={itemDescription.image_url} alt={`Image of ${itemDescription.name}`}/> 
                </div>                               
                <p><strong>Store: </strong>{titleCase(itemDescription.store)}</p>
                <p><strong>Price: </strong>€{itemDescription.price}</p>
                <p><strong>Category: </strong>{titleCase(itemDescription.category)}</p>
                <div>
                    <strong>Description:</strong>
                    <p>{itemDescription.description}</p>
                </div>
                <p>Last update: {itemDescription.created_at}</p>
            </div>
            }
        </div>
    )
}