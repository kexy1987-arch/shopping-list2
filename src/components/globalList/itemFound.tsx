import type { product } from "../../utils/types";
import styles from './globalList.module.css'
import { titleCase } from "../../utils/functions";

type ItemFoundProps = {
    products: product[],
    addToMyList: (e: React.MouseEvent<HTMLButtonElement> ,productId: number) => void,
    setItemFound: (value: product[] | null) => void
}

export default function ItemFound({products, addToMyList, setItemFound}: ItemFoundProps){
    return(
        <div className={styles["modal"]}>
            {products.map(product => (
                <div>
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
                            <button onClick={() => setItemFound(null)}>Close</button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
        
        
    )
}