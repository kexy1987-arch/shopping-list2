import type { DbProduct, ListItem } from '../../utils/types'
import styles from '../globalList/globalList.module.css'
import style from './favorites.module.css'
import { titleCase } from '../../utils/functions'
import { creatList } from '../../utils/functions'
import { useEffect, useState } from 'react'


type FavoritesProps = {
    myList: ListItem[],
    favs: DbProduct[] | null;
    delFav: (userId: number, productId: number) => void;
    userId: number,
    setMyList: React.Dispatch<React.SetStateAction<ListItem[]>>,
    updateList: (userId: number, myList: ListItem[]) => void,
    getFavs: (value: number) => void;
}

export default function Favorites({favs, delFav, userId, myList, setMyList, updateList, getFavs}: FavoritesProps){
    const [find, setFind] = useState<DbProduct[] | undefined>(undefined);

    useEffect(() => {
        getFavs(userId)
    }, [])

    function delFavorite(e: React.MouseEvent<HTMLButtonElement>, productId: number) {
        e.stopPropagation();
        delFav(userId, productId);
    }

    function addToMyList(e: React.MouseEvent<HTMLButtonElement>, productId: number){
            e.stopPropagation();        
            setMyList(prev => creatList(prev, myList, productId));
            updateList(userId, creatList(myList, myList, productId));
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
                                    <img className={styles["card-img"]} src={product.image_url} alt={`Photo of ${product.name}`} />
                                </div>
                                <div>
                                    <h3>{titleCase(product.name)}</h3>
                                    <p>{titleCase(product.store)}</p>
                                    <p>Price: {product.price} {product.currency}</p>
                                    <p>Category: {titleCase(product.category)}</p>
                                </div>
                                <div>
                                    <button onClick={(e) => addToMyList(e, Number(product.id))}>Add to my list</button>
                                </div>
                            </div>
                        ))
                            : ""
                        }
                    </div>
                </div>
            </div>
            
            {favs && favs.length !== 0 ? favs.map(product => (
                <div key={product.id} className={styles["product-card"]}>
                    <div className={styles["card-img-container"]}>
                        <img className={styles["card-img"]} src={product.image_url} alt={`Photo of ${product.name}`} />
                    </div>
                    <div>
                        <h3>{titleCase(product.name)}</h3>
                        <p>{titleCase(product.store)}</p>
                        <p>Price: {product.price} {product.currency}</p>
                        <p>Category: {titleCase(product.category)}</p>
                    </div>
                    <div>
                        <button onClick={(e) => addToMyList(e, Number(product.id))}>Add to my list</button>
                        {!favs?.find(fav => fav.id === product.id) ? "" : <button className="fav-btn" onClick={(e) => delFavorite(e, product.id)}><img src="/FavoriteFilled.svg" /></button>}
                    </div>
                </div>
            ))
                : 
            <div className={style.modal}>
                <h2>No Favorites</h2>
            </div>
            }
        </div>
    )
}