import styles from './myList.module.css'
import type { DbProduct, ListItem, Stores } from '../../utils/types'
import { useState, useEffect } from 'react';
import { titleCase } from '../../utils/functions';

type MyListProps = {
    myList: ListItem[],
    setMyList: (value: ListItem[]) => void,
}

export default function MyList({myList, setMyList}:MyListProps) {
    const API = import.meta.env.VITE_WORKER_API;
    const [myListItems, setMyListItems] = useState<DbProduct[]>([])
    const [currentStore, setCurrentStore] = useState<string>("all")
    const [stores, setStores] = useState<Stores[]>([]);
    const [price, setPrice] = useState<number>(0);


    async function getMyListItems(myList: ListItem[]) {        
        const idList = myList.map(item => item.id)
        const req = await fetch(`${API}/get-my-list-items`, {
            method: "POST",
            body: JSON.stringify({idList, currentStore})
        });

        const res = await req.json();

        if ( res.ok ) {
            setMyListItems(res.data);
        }

        if ( !res.ok ) {
            console.log( res )
        }
    }

    async function getStoreList() {
        const req = await fetch(`${API}/getstores`)
        const res = await req.json();

        if(!res.ok)console.log(res.error);
        console.log(res)
        setStores(res.stores)
    }

    function increaseAmount( itemRef: ListItem ){
        if( !itemRef )return;
        const updated = myList.map(item => item.id === itemRef.id ? {...item, amount: item.amount + 1} : item)
        setMyList(updated)
    }

    function decreseAmount( itemRef: ListItem ){
        if (!itemRef || itemRef.amount === 0) return;
        const updated = myList.map(item => item.id === itemRef.id ? { ...item, amount: item.amount - 1 } : item)
        setMyList(updated)
    }

    function deleteItem(id: number){
        const updated = myList.filter(item => item.id !== id);
        console.log(updated)
        setMyList(updated);
    }

    function calcPrice(){
        if(myListItems.length === 0)return;
        let price = 0;

        myListItems.forEach((item) => {
            const itemRef: ListItem | undefined = myList.find(itemRef => item.id === itemRef.id);
            const amount = itemRef?.amount;
            if(!amount) return;
            price += item.price * amount;
        })
        setPrice(price)
    }

    useEffect(() => {
        getStoreList();
    }, [])

    useEffect(() => {
        getMyListItems(myList)
        calcPrice();
    }, [myList, currentStore])
    
    return(
        <div className={styles["my-list"]}>
            <div className={styles.filter}>
                <label>Filter by store:
                    <select onChange={(e) => setCurrentStore(e.target.value)} name="filter-select" autoComplete='off'>
                        <option value="all">All</option>
                        {stores.map(store => (
                            <option key={store.store} value={store.store}>{store.store.toLocaleUpperCase()}</option>
                        ))}
                    </select>
                </label>
                <p>Total: €{price}</p>
            </div>
            {myListItems.map(( item, i ) => {
                const itemRef: ListItem | undefined = myList.find(itemRef => item.id === itemRef.id);
                const amount = itemRef?.amount;
                return(
                    <div key={item.id + i} className={styles["my-product-card"]}>                        
                        <div className={styles["product-info-container"]}>
                            <div className={styles["img-container"]}>
                                <img src={item.image_url} alt={`Photo of ${item.name}`} />
                            </div>
                            <div className={styles["product-info"]}>
                                <h2 className={styles["product-name"]}>{titleCase(item.name)}</h2>
                                <div className={styles["info-lines"]}><p>Store:</p> {item.store.toLocaleUpperCase()}</div>
                                <div className={styles["info-lines"]}><p>Category: </p> {titleCase(item.category)}</div>
                                <div className={styles["info-lines"]}><p>Price: </p>€{item.price}</div>
                                <div>Amount: <br></br>{itemRef && <span><button onClick={() => increaseAmount(itemRef)}>+</button>{amount} pcs<button onClick={(() => decreseAmount(itemRef))}>-</button></span>}</div>
                                <p>Price: €{(item.price * amount!).toFixed(2)}</p>
                            </div>
                            <div>
                                {itemRef && <button onClick={() => deleteItem(itemRef.id)}>Remove</button>}
                            </div>
                        </div>
                    </div>
                )}
            )}
        </div>
    )
}