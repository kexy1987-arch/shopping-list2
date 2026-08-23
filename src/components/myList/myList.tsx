import styles from './myList.module.css'
import type { DbProduct, ListItem, Stores } from '../../utils/types'
import { useState, useEffect } from 'react';
import currencyMap, { titleCase } from '../../utils/functions';
import NotifBar from '../notifbar/notifbar';

type MyListProps = {
    myList: ListItem[],
   // setMyList: React.Dispatch<React.SetStateAction<ListItem[]>>,
    updateList: (userId: number, myList: ListItem[]) => void,
    userId: number,
    getFavs: (value: number) => void;
    favs: DbProduct[] | null;
    delFav: (userId: number, productId: number) => void;
    getMyList: (value: number) => void,
    wsRef: React.RefObject<WebSocket | null>
}

export default function MyList({ myList, wsRef, getMyList, updateList, userId, favs, getFavs, delFav}:MyListProps) {
    const API = import.meta.env.VITE_WORKER_API;
    const [myListItems, setMyListItems] = useState<DbProduct[]>([])
    const [grouped, setGrouped ] = useState<Record<string, DbProduct[] | undefined>>();
    const [currentStore, setCurrentStore] = useState<string>("all")
    const [stores, setStores] = useState<Stores[]>([]);
    const [price, setPrice] = useState<number>(0);
    const [notif, setNotif] = useState<string>("");


    async function getMyListItems(myList: ListItem[]) {
        const idList = myList.map(item => item.id)
        const req = await fetch(`${API}/get-my-list-items`, {
            method: "POST",
            body: JSON.stringify({idList, currentStore})
        });

        const res = await req.json();

        if ( res.ok ) {
            const grouped = res.data.reduce((acc:Record<string, DbProduct[]>, item: DbProduct) => {
                if (!acc[item.category]) acc[item.category] = [];
                acc[item.category].push(item);
                return acc;
            }, {});
            setGrouped(grouped);
            setMyListItems(res.data);
        }

        if ( !res.ok ) {
            console.log( res )
        }
    }

    async function getStoreList() {
        const req = await fetch(`${API}/getstores`)
        const res = await req.json();

        if(!res.ok){
            console.log(res.error);
            return;
        }
            
        setStores(res.stores)
    }

    async function updateAmount( e: React.MouseEvent<HTMLButtonElement>, listItem: ListItem, delta: number ){
        e.stopPropagation();

        const updated = myList.map(item => item.id === listItem.id ? { ...item, amount: item.amount + delta } : item)
        
        const req = await fetch(`${API}/increaseamount`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                listItem,
                userId,
                delta
            })
        })
        const res = await req.json();
        if ( res.ok ){
            wsRef.current?.send(JSON.stringify(userId))
        }
        if ( !res.ok ) {
            console.log(res.message);
        }
    }


    function deleteItem(e: React.MouseEvent<HTMLButtonElement>, product: DbProduct){
        e.stopPropagation();
        const updated = myList.filter(item => item.id !== product.id);
        wsRef.current?.send(JSON.stringify(userId))
        if(myList.length <= 1)setPrice(0);
        updateList(userId, updated);
        setNotif(`${titleCase(product.name)} removed from your list.`)
    }

    function calcPrice(){
        if(myListItems.length === 0)return;
        let price = 0;

        myListItems.forEach((item) => {
            const itemRef: ListItem | undefined = myList.find(itemRef => item.id === itemRef.id);
            const amount = itemRef?.amount || 0
            price += item.price * amount;
        })
        setPrice(price)
    }

    async function buy(item: ListItem) {
        const el = document.getElementById(`item-${item.id}`)
        if (el) {
            el.classList.add("hide")
        }

        const updated = myList.map(prevItem =>
            prevItem.id === item.id
                ? { ...prevItem, bought: !prevItem.bought }
                : prevItem
        );

        const sorted = updated.sort((a, b) => Number(a.bought) - Number(b.bought));
        console.log(sorted);

        const req = await fetch(`${API}/buy`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                myList: sorted,
                userId
             })
        })

        const res = await req.json();
        if(res.ok){
            wsRef.current?.send(JSON.stringify(userId))
            getMyList(userId);
        }
        if(!res.ok){
            console.log(res.error);
        }
        
        if (el) {
            setTimeout(() => {   
                el.classList.remove("hide")
            }, 304)
        }
        
        
    }

    



    useEffect(() => {
        getStoreList();
    }, [])

    useEffect(() => {
        getMyListItems(myList)
    }, [myList, currentStore])

    useEffect(() => {
        calcPrice()
    }, [myListItems])

    async function addToFavorites(e: React.MouseEvent<HTMLButtonElement>, userId: number, product: DbProduct) {
        e.stopPropagation();
        const req = await fetch(`${API}/addToFavorites`, {
            method: "POST",
            body: JSON.stringify({
                userId: userId,
                productId: product.id
            })
        })
        const res = await req.json();
        if (res.ok) {
            console.log(res.message)
            getFavs(userId)
        } else {
            console.log(res.error)
        }
    }

    function delFavorite (e: React.MouseEvent<HTMLButtonElement>, product: DbProduct) {
            e.stopPropagation();
            delFav(userId, product.id);
        }

    async function reset() {
        
        const notBought = myList.map(prevItem =>(
                { ...prevItem, bought: false }
            )
        );

        const req = await fetch(`${API}/buy`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                myList: notBought,
                userId
            })
        })

        const res = await req.json();
        if (res.ok) {
            wsRef.current?.send(JSON.stringify(userId))
            getMyList(userId)
        }
        if (!res.ok) {
            console.log(res.error);
        }
    }
    
    return(
        <div className={styles.main}>
            <NotifBar message={notif} />
            <div className={styles.filter}>
                <img className={styles.reset} src="/Reload.svg" alt="reset button" onClick={() => reset()} />
                <div>
                    <label>Filter by store:
                        <select onChange={(e) => setCurrentStore(e.target.value)} name="filter-select" autoComplete='off'>
                            <option value="all">All</option>
                            {stores.map(store => (
                                <option key={store.store} value={store.store}>{store.store.toLocaleUpperCase()}</option>
                            ))}
                        </select>
                    </label>
                    <p>Total: {price.toFixed(2)}{myListItems[0] ? currencyMap(myListItems[0].country) : ""}</p>
                </div>
                <div></div>
            </div>
            {<div>
                {grouped && Object.entries(grouped).map(([category, products]) => (
                    <div key={category}>
                        <h2 className={styles.category}>{titleCase(category)}</h2>
                        <div>
                            {products!.map(product => {
                                const item = myList.find(i => i.id === product.id);
                                if (!item) return null;

                                return (
                                    <div key={item.id} id={`item-${item.id}`} className={`my-product-card ${item.bought ? "bought" : "notbought"}`} onClick={() => buy(item!)}>
                                        <div className={styles["product-card"]}>
                                            <div className={styles.flex}>                                            
                                                {!favs?.find(fav => fav.id === product.id) ? <button className="fav-btn" onClick={(e) => addToFavorites(e, userId, product)}><img src="/Favorite.svg" /></button> : <button className="fav-btn" onClick={(e) => delFavorite(e, product)}><img src="/FavoriteFilled.svg" /></button>}
                                                <h2>{product.store.toLocaleUpperCase()} {titleCase(product.name)}</h2>
                                                <div className={styles.amount}>{item.amount}x</div>
                                            </div>                                            
                                            <div className={styles.flex}>
                                                <div>
                                                    {product.price} x {item.amount}
                                                </div>
                                                <div>
                                                    {(product.price * item.amount!).toFixed(2)}{currencyMap(product.country)}
                                                </div>
                                                <div>
                                                    {item && <span><button onClick={(e) => updateAmount(e, item, 1)}>+</button><button onClick={((e) => updateAmount(e, item, -1))}>-</button></span>}
                                                    {item && <button onClick={(e) => deleteItem(e, product)}>X</button>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    ))}
                </div>}                       
        </div>
    )
}