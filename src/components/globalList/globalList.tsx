import { useEffect, useState } from 'react'
import styles from './globalList.module.css'
import { titleCase, creatList } from '../../utils/functions';
import type { DbProduct, ListItem, product} from '../../utils/types';
import Scanner from '../createNewProduct/scanner';
import ItemFound from './itemFound';
import Modal from '../modal/modal';
import NotifBar from '../notifbar/notifbar';

type GlobalListProps = {
    myList: ListItem[],
    setMyList: React.Dispatch<React.SetStateAction<ListItem[]>>,
    userId: number,
    getFavs: (value: number) => void;
    favs: DbProduct[] | null;
    delFav: (userId: number, productId: number) => void;
    updateList: (userId: number, myList: ListItem[]) => void,
    country: string,
    setActivePanel: (value: string) => void
}

export default function GlobalList({myList, setActivePanel, setMyList, updateList, userId, getFavs, favs, delFav, country}:GlobalListProps){
    const API = import.meta.env.VITE_WORKER_API
    const [ list, setList ] = useState<product[] | null>(null);
    const [ itemFound, setItemFound ] = useState<product[] | null>(null);
    const [ showScanner, setShowScanner ] = useState<boolean>(false);
    const [ barcode, setBarcode ] = useState<string | null>("");
    const [ itemDescription, setItemDescription ] = useState<product | null>(null);
    const [ find, setFind ] = useState<product[] | undefined>(undefined);
    const [ message, setMessage ] = useState<string>("");

    async function getProducts() {
        const res = await fetch(`${API}/get-products`, {
            method: "POST",
            headers: {
                "Content-Type": "text/plain"
            },
            body: country
        })

        const data = await res.json()

        if ( data.ok ) {
            setList(data.list)
        } else {
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
        getProducts();
        getFavs(userId);       
    }, [])

    function addToMyList(e: React.MouseEvent<HTMLButtonElement>, product: product){
        e.stopPropagation();        
        setMyList(prev => creatList(prev, myList, product.id));
        updateList(userId, creatList(myList, myList, product.id));
        setMessage(`${titleCase(product.name)} added to your Shopping List`);
    }

    async function addToFavorites(e: React.MouseEvent<HTMLButtonElement>, product: product) {
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
            setMessage(`${titleCase(product.name)} added to Favorites`);
            console.log(res.message)
            getFavs(userId)
        } else {
            console.log(res.error)
        }
    }

    function delFavorite (e: React.MouseEvent<HTMLButtonElement>, product: product) {
        e.stopPropagation();
        delFav(userId, product.id);
        setMessage(`${titleCase(product.name)} removed from Favorites.`);
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

    async function deleteProduct(e:React.MouseEvent<HTMLButtonElement>,id:number){
        e.stopPropagation();
        const req = await fetch(`${API}/deletefromall`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({id: id})
        })

        const res = await req.json();

        if(res.ok){
            setMessage("Item permanently removed from global list.");
            getProducts();
        } else {
            console.log("Delete failed");
        }
    }

    useEffect(() => {console.log(list)}, [list])

    return(
        <div className='z-index'>
            <NotifBar message={message} />
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
                                    <img className={styles["card-img"]} src={product.image_url ? product.image_url : "/unknown_item.png"} alt={`Photo of ${product.name}`} />
                            </div>
                            <div>
                                <h3>{titleCase(product.name)}</h3>
                                <p>{titleCase(product.store)}</p>
                                <p>Price: {product.price} {product.currency}</p>
                                <p>Category: {titleCase(product.category)}</p>
                            </div>
                            <div>
                                <button onClick={(e) => addToMyList(e, product)}>Add to my list</button>
                                {!favs?.find(fav => fav.id === product.id) ? <button className="fav-btn" onClick={(e) => addToFavorites(e, product)}><img src="/Favorite.svg" /></button> : <button className="fav-btn" onClick={(e) => delFavorite(e, product)}><img src="/FavoriteFilled.svg" /></button>}
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
            {list && list.length > 0 ? list.map(product => (
                <div key={product.id} className={styles["product-card"]} onClick={() => {setItemDescription(product); console.log(product)}}>                        
                    <div className={styles["card-img-container"]}>
                        <img className={styles["card-img"]} src={product.image_url ? product.image_url : "/unknown_item.png"} alt={`Photo of ${product.name}`} />
                    </div>
                    <div>
                        <h3>{titleCase(product.name)}</h3>
                        <p>{titleCase(product.store)}</p>
                        <p>Price: {product.price} {product.currency}</p>
                        <p>Category: {titleCase(product.category)}</p>
                    </div>
                    <div>
                        <button onClick={(e) => addToMyList(e, product)}>Add to my list</button>
                        {!favs?.find(fav => fav.id === product.id) ? <button className="fav-btn" onClick={(e) => addToFavorites(e, product)}><img src="/Favorite.svg" /></button> : <button className="fav-btn" onClick={(e) => delFavorite(e, product)}><img src="/FavoriteFilled.svg" /></button>}
                        <button onClick={(e) => deleteProduct(e, product.id)}>Delete Product</button>
                    </div>
                </div>
            ))
            :
                <Modal message={<div>
                    <h2>Please create the first product!</h2>
                    <p>Click or tap the top right "+" button, to add a product to the global list.</p>
                </div>} />
                
            }
            {
            itemDescription && 
                <Modal message={<div className={styles["description-modal"]} onClick={() => setItemDescription(null)}>
                    <h2>{itemDescription.name.toUpperCase()}</h2>
                    <div className={styles["img-container"]}>
                        <img className={styles["card-img"]} src={itemDescription.image_url} alt={`Image of ${itemDescription.name}`} />
                    </div>
                    <p><strong>Store: </strong>{titleCase(itemDescription.store)}</p>
                    <p><strong>Price: </strong>{itemDescription.price} {itemDescription.currency}</p>
                    <p><strong>Category: </strong>{titleCase(itemDescription.category)}</p>
                    <div className={styles.desc}>
                        <strong>Description:</strong>
                        <p>{itemDescription.description}</p>
                    </div>
                    <p>Last update: {itemDescription.created_at}</p>
                </div>} />                
            }
        </div>
    )
}