import type { DbProduct, ListItem } from '../../utils/types'
import styles from '../globalList/globalList.module.css'
import style from './favorites.module.css'
import { titleCase } from '../../utils/functions'
import { creatList } from '../../utils/functions'
import { useEffect } from 'react'


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

    return(
        <div className='z-index vh'>
            <header className="header">
                <h2 className='fixed'>Favorites</h2>
            </header>
            
            {favs && favs.length !== 0 ? favs.map(product => (
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