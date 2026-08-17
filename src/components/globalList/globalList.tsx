import { useEffect, useState } from 'react'
import styles from './globalList.module.css'
import { titleCase, creatList } from '../../utils/functions';
import type { DbProduct, ListItem, product} from '../../utils/types';
import Scanner from '../createNewProduct/scanner';
import ItemFound from './itemFound';

type GlobalListProps = {
    myList: ListItem[],
    setMyList: React.Dispatch<React.SetStateAction<ListItem[]>>,
    userId: number,
    getFavs: (value: number) => void;
    favs: DbProduct[] | null;
    delFav: (userId: number, productId: number) => void;
    updateList: (userId: number, myList: ListItem[]) => void
}

export default function GlobalList({myList, setMyList, updateList, userId, getFavs, favs, delFav}:GlobalListProps){
    const API = import.meta.env.VITE_WORKER_API
    const [list, setList] = useState<product[] | null>(null);
    const [itemFound, setItemFound] = useState<product[] | null>(null);
    const [showScanner, setShowScanner] = useState<boolean>(false);
    const [barcode, setBarcode] = useState<string | null>("");
    const [itemDescription, setItemDescription] = useState<product | null>(null);
    const [find, setFind] = useState<product[] | undefined>(undefined);

    async function getProducts() {
        const res = await fetch(`${API}/get-products`)
        const data = await res.json()

        if ( data.ok ) {
            setList(data.list)
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
        getProducts();
        getFavs(userId);       
    }, [])

    function addToMyList(e: React.MouseEvent<HTMLButtonElement>, productId: number){
        e.stopPropagation();        
        setMyList(prev => creatList(prev, myList, productId));
        updateList(userId, creatList(myList, myList, productId));
    }

    async function addToFavorites(e: React.MouseEvent<HTMLButtonElement>, productId: number) {
        e.stopPropagation();
        const req = await fetch(`${API}/addToFavorites`, {
            method: "POST",
            body: JSON.stringify({
                userId: userId,
                productId: productId
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

    function delFavorite (e: React.MouseEvent<HTMLButtonElement>, productId: number) {
        e.stopPropagation();
        delFav(userId, productId);
    }

    function search(e: React.ChangeEvent<HTMLInputElement>, list: product[]){
        if(e.target.value === ""){
            setFind(undefined);
            return;
        }
        const toFind = e.target.value.toLowerCase();
        const filter = list?.filter(product => product.name.includes(toFind))
        setFind(filter)
    }

    return(
        <div className='z-index'>
            <header className="header">
                <h2 className='fixed'>Global Product List</h2>
            </header>
            
            <div className={styles.search}>
                <div>
                    <input placeholder='Find by name' type="text" onChange={(e) => search(e, list!)} />
                    <div className={styles.found}>
                        {find ? find.map(product => (
                        <div key={product.id} className={styles["product-card"]} onClick={() => { setItemDescription(product); console.log(product) }}>
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
                                {!favs?.find(fav => fav.id === product.id) ? <button className="fav-btn" onClick={(e) => addToFavorites(e, product.id)}><img src="/Favorite.svg" /></button> : <button className="fav-btn" onClick={(e) => delFavorite(e, product.id)}><img src="/FavoriteFilled.svg" /></button>}
                            </div>
                        </div>
                        ))
                        : ""
                        }
                    </div>
                </div>                
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
                        {!favs?.find(fav => fav.id === product.id) ? <button className="fav-btn" onClick={(e) => addToFavorites(e, product.id)}><img src="/Favorite.svg" /></button> : <button className="fav-btn" onClick={(e) => delFavorite(e, product.id)}><img src="/FavoriteFilled.svg" /></button>}
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