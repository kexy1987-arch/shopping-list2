import styles from './myList.module.css'
import type { DbProduct, ListItem, Stores } from '../../utils/types'
import { useState, useEffect } from 'react';
import currencyMap, { titleCase } from '../../utils/functions';
import NotifBar from '../notifbar/notifbar';

type MyListProps = {
    myList: ListItem[],
    setMyList: React.Dispatch<React.SetStateAction<ListItem[]>>,
    updateList: (userId: number, myList: ListItem[]) => void,
    userId: number,
    getFavs: (value: number) => void;
    favs: DbProduct[] | null;
    delFav: (userId: number, productId: number) => void;
}

export default function MyList({ myList, setMyList, updateList, userId, favs, getFavs, delFav}:MyListProps) {
    const API = import.meta.env.VITE_WORKER_API;
    const [myListItems, setMyListItems] = useState<DbProduct[]>([])
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

    function increaseAmount( e: React.MouseEvent<HTMLButtonElement>, itemRef: ListItem ){
        e.stopPropagation();
        if( !itemRef )return;
        const updated = myList.map(item => item.id === itemRef.id ? {...item, amount: item.amount + 1} : item)
        setMyList(updated)
    }

    function decreseAmount(e: React.MouseEvent<HTMLButtonElement>, itemRef: ListItem ){
        e.stopPropagation()
        if (!itemRef || itemRef.amount === 0) return;
        const updated = myList.map(item => item.id === itemRef.id ? { ...item, amount: item.amount - 1 } : item)
        setMyList(updated)
    }

    function deleteItem(e: React.MouseEvent<HTMLButtonElement>, product: DbProduct){
        e.stopPropagation();
        const updated = myList.filter(item => item.id !== product.id);
        setMyList(updated);
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

    function buy(item: ListItem) {
        const el = document.getElementById(`item-${item.id}`)
        if (el) {
            el.classList.add("hide")
        }

        setTimeout(() => {
            setMyList(prev => {
                const updated = prev.map(prevItem =>
                    prevItem.id === item.id
                        ? { ...prevItem, bought: !prevItem.bought }
                        : prevItem
                );
                return updated.sort((a, b) => Number(a.bought) - Number(b.bought));
            });
        }, 201)        
        
        if (el) {
                       

            setTimeout(() => {                
                el.classList.toggle("notbought");
            }
            
            , 202)
            setTimeout(() => {
                el.classList.toggle("bought")
            }, 203)
            
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

    async function addToFavorites(e: React.MouseEvent<HTMLButtonElement>, userId: number, product: product) {
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
    
    return(
        <div>
            <NotifBar message={notif} />
            <div className={styles.filter}>
                <label>Filter by store:
                    <select onChange={(e) => setCurrentStore(e.target.value)} name="filter-select" autoComplete='off'>
                        <option value="all">All</option>
                        {stores.map(store => (
                            <option key={store.store} value={store.store}>{store.store.toLocaleUpperCase()}</option>
                        ))}
                    </select>
                </label>
                <p>Total: {price.toFixed(2)}{myListItems[0] ? myListItems[0].currency : ""}</p>
            </div>
            <div className="list-container">
                {myListItems && myList.map((item) => {
                    const product = myListItems.find(p => p.id === item.id)
                    if (!product) return null;
                    return (
                        <div key={item.id} id={`item-${item.id}`} className="my-product-card notbought" onClick={() => buy(item!)}>
                            <h2 className={styles["product-name"]}>{titleCase(product.name)}</h2>
                            <div className={styles["product-info-container"]}>
                                <div className={styles["img-container"]}>
                                    <img src={product.image_url ? product.image_url : "/unknown_item.png"} alt={`Photo of ${product.name}`} />
                                </div>
                                <div className={styles["product-info"]}>                                    
                                    <div className={styles["info-lines"]}><p>Store:</p> <span>{product.store.toLocaleUpperCase()}</span></div>
                                    <div className={styles["info-lines"]}><p>Category: </p> <span>{titleCase(product.category)}</span></div>
                                    <div className={styles["info-lines"]}><p>Unit Price: </p><span>{product.price} {currencyMap(product.country)}</span></div>                                    
                                    <p>Total price: {(product.price * item.amount!).toFixed(2)} {product.currency}</p>
                                </div>
                                <div>
                                    {item && <button onClick={(e) => deleteItem(e, product)}>Remove</button>}
                                    {!favs?.find(fav => fav.id === product.id) ? <button className="fav-btn" onClick={(e) => addToFavorites(e, userId, product)}><img src="/Favorite.svg" /></button> : <button className="fav-btn" onClick={(e) => delFavorite(e, product)}><img src="/FavoriteFilled.svg" /></button>}
                                    <div>Amount: <br></br>{item && <span><button onClick={(e) => increaseAmount(e, item)}>+</button>{item.amount} pcs<button onClick={((e) => decreseAmount(e, item))}>-</button></span>}</div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>                       
        </div>
    )
}