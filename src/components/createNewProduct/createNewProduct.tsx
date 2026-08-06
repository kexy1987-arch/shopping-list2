import styles from './createNewProduct.module.css'
import { useState } from "react"
import Scanner from './scanner';

type CreateNewProductProps = {
    setShowCreateNewProduct: (value: boolean) => void,
}

export default function CreateNewProduct({setShowCreateNewProduct}: CreateNewProductProps){
    const [showScanner, setShowScanner] = useState<boolean>(false);
    const [formData, setFormData] = useState({
        name: "",
        price: "",
        category: "",
        store: "",
        description: "",
        image_url: "",
    });
    const [image, setImage] = useState<File | null>(null);
    const [barcode, setBarcode] = useState<string | null>("");

    function handleInputs(e: React.ChangeEvent<HTMLInputElement>){
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    function handleSubmit(e: React.MouseEvent<HTMLButtonElement>){
        e.preventDefault();
        const data = new FormData();
        data.append("name", formData.name)
        data.append("price", formData.price)
        data.append("category", formData.category)
        data.append("store", formData.store)
        data.append("description", formData.description)
        data.append("barcode", barcode!)
        if ( image ) data.append("image", image!)

        //fetch here
    }

    return(
        <>
            <header className={styles.header}>
                <h1>Create new product</h1>
                <button onClick={() => setShowCreateNewProduct(false)}>X</button>
            </header>
            {showScanner && <Scanner setData={setBarcode} setShowScanner={setShowScanner}/>}
            <form>
                <div className={styles["input-container"]}>
                    <label htmlFor="name">Product name:</label>
                    <input type="text" id="name" name="name" onChange={(e) => handleInputs(e)}/>
                </div>
                <div className={styles["input-container"]}>
                    <label htmlFor="price">Product price:</label>
                    <input type="text" id="price" name="price" onChange={(e) => handleInputs(e)} />
                </div>
                <div className={styles["input-container"]}>
                    <label htmlFor="category">Product category:</label>
                    <input type="text" id="category" name="category" onChange={(e) => handleInputs(e)} />
                </div>
                <div className={styles["input-container"]}>
                    <label htmlFor="description">Product description:</label>
                    <input type="text" id="description" name="description" onChange={(e) => handleInputs(e)} />
                </div>
                <div className={styles["input-container"]}>
                    <label htmlFor="store">Store:</label>
                    <input type="text" id="store" name="store" onChange={(e) => handleInputs(e)} />
                </div>
                <div className={styles["input-container"]}>
                    <label htmlFor="image">Image:</label>
                    <input type="file" id="image" name="image" accept="image/*" onChange={(e) => setImage(e.target.files![0])} />
                </div>
                <button type="button" onClick={() => setShowScanner(true)}>Barcode Scanner</button>
                <button onClick={(e) => handleSubmit(e)}>Submit</button>
                
                
                
                
            </form>
        </>
    )
}