import type { DbProduct, ListItem } from '../../utils/types'
import styles from '../globalList/globalList.module.css'
import currencyMap, { titleCase } from '../../utils/functions'
import { creatList } from '../../utils/functions'
import { useEffect, useState } from 'react'
import Modal from '../modal/modal'



type FavoritesProps = {
    myList: ListItem[],
    favs: DbProduct[] | null;
    delFav: (userId: number, productId: number) => void;
    userId: number,
    setMyList: React.Dispatch<React.SetStateAction<ListItem[]>>,
    updateList: (userId: number, myList: ListItem[]) => void,
    getFavs: (value: number) => void;
    setMessage: (val: string) => void;
}

export default function Favorites({favs, setMessage, delFav, userId, myList, setMyList, updateList, getFavs}: FavoritesProps){
    const [ find, setFind ] = useState<DbProduct[] | undefined>(undefined);
    const [ itemDescription, setItemDescription] = useState<DbProduct | null>(null);

    useEffect(() => {
        getFavs(userId)
    }, [])

    function delFavorite(e: React.MouseEvent<HTMLButtonElement>, product: DbProduct) {
        e.stopPropagation();
        delFav(userId, product.id);
        setMessage(`${titleCase(product.name)} removed from Favorites`);
    }

    function addToMyList(e: React.MouseEvent<HTMLButtonElement>, product: DbProduct){
            e.stopPropagation();        
            setMyList(prev => creatList(prev, myList, product.id));
            updateList(userId, creatList(myList, myList, product.id));
            setMessage(`${titleCase(product.name)} added to your Shopping List`);
        }

    function search(e: React.ChangeEvent<HTMLInputElement>, list: DbProduct[]){
            if(e.target.value === ""){
                setFind(undefined);
                return;
            }
            const toFind = e.target.value.toLowerCase();
            const filter = list?.filter(product => product.name.includes(toFind))
            setFind(filter)
        }

    return(
        <div className='z-index vh'>
            <header className="header">
                <h2 className='fixed'>Favorites</h2>
            </header>
            <div className={styles.search}>
                <div>
                    <input placeholder='Find by name' type="text" onChange={(e) => search(e, favs!)} />
                    <div className={styles.found}>
                        {find ? find.map(product => (
                            <div key={product.id} className={styles["product-card"]}>
                                <div className={styles["card-img-container"]}>
                                    <img className={styles["card-img"]} loading="lazy" src={product.image_url ? product.image_url : "/unknown_item.png"} alt={`Photo of ${product.name}`} />
                                </div>
                                <div>
                                    <h3>{titleCase(product.name)}</h3>
                                    <p>{titleCase(product.store)}</p>
                                    <p>Price: {product.price} {product.currency}</p>
                                    <p>Category: {titleCase(product.category)}</p>
                                </div>
                                <div>
                                    <button onClick={(e) => addToMyList(e, product)}>Add to my list</button>
                                </div>
                            </div>
                        ))
                            : ""
                        }
                    </div>
                </div>
            </div>
            
            {favs && favs.length !== 0 ? favs.map(product => (
                <div key={product.id} className={styles["product-card"]} onClick={() => setItemDescription(product)}>
                    <div className={styles["card-img-container"]}>
                        <img className={styles["card-img"]} src={product.image_url ? product.image_url : "/unknown_item.png"} alt={`Photo of ${product.name}`} />
                    </div>
                    <div>
                        <h3>{titleCase(product.name)}</h3>
                        <p>{titleCase(product.store)}</p>
                        <p>Price: {product.price} {currencyMap(product.country)}</p>
                        <p>Category: {titleCase(product.category)}</p>
                    </div>
                    <div>
                        <button onClick={(e) => addToMyList(e, product)}>Add to my list</button>
                        {!favs?.find(fav => fav.id === product.id) ? "" : <button className="fav-btn" onClick={(e) => delFavorite(e, product)}><img src="/FavoriteFilled.svg" /></button>}
                    </div>
                </div>
            ))
                : 
                <Modal message={<h2>No Favorites yet</h2>} />                
            }
            {itemDescription &&
                <Modal message={<div className={styles["description-modal"]} onClick={() => setItemDescription(null)}>
                    <h2>{itemDescription.name.toUpperCase()}</h2>
                    <div className={styles["img-container"]}>
                        <img className={styles["card-img"]} src={itemDescription.image_url} alt={`Image of ${itemDescription.name}`} />
                    </div>
                    <p><strong>Store: </strong>{titleCase(itemDescription.store)}</p>
                    <p><strong>Price: </strong>{itemDescription.price} {currencyMap(itemDescription.country)}</p>
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