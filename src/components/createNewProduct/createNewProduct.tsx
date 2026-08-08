import styles from './createNewProduct.module.css'
import { useEffect, useState } from "react"
import Scanner from './scanner';



export default function CreateNewProduct(){
    const API = import.meta.env.VITE_WORKER_API;
    const [showScanner, setShowScanner] = useState<boolean>(false);
    const [formData, setFormData] = useState({
        name: "",
        price: "",
        category: "",
        store: "",
        description: "",
    });
    const [image, setImage] = useState<File | null>(null);
    const [barcode, setBarcode] = useState<string | null>("");

    function handleInputs(e: React.ChangeEvent<HTMLInputElement>){
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    async function handleSubmit(e: React.MouseEvent<HTMLButtonElement>){
        e.preventDefault();
        const data = new FormData();
        data.append("name", formData.name);
        data.append("price", formData.price);
        data.append("category", formData.category);
        data.append("store", formData.store);
        data.append("description", formData.description);
        if ( barcode ) data.append("barcode", barcode!);
        if ( image ) data.append("image", image!);
        
        const req = await fetch(`${API}/new-product`, {
            method: "POST",
            body: data
        })

        const res = await req.json();

        if ( res.ok ) alert("New Product added to the global list.")
    }

    async function getItemByBarcode(barcode: string | null){
        if(!barcode)return;
        const req = await fetch(`${API}/getitembybarcode`, {
            method: "POST",
            body: barcode
        })

        const res = await req.json();

        if(res.ok){
            console.log("barcode");
        }
    }

    useEffect(() => {
        console.log("BARCODE: ", barcode)
        getItemByBarcode(barcode);
    }, [barcode])

    return(
        <div className='z-index'>
            <header className="header">
                <h2>Create new product</h2>
            </header>
            {showScanner && <Scanner setData={setBarcode} setShowScanner={setShowScanner}/>}
            <form>
                <button type="button" onClick={() => setShowScanner(true)}>Barcode Scanner</button>
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
                <button onClick={(e) => handleSubmit(e)}>Submit</button>
            </form>
        </div>
    )
}