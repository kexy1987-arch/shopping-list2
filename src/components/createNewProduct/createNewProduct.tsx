import styles from './createNewProduct.module.css'
import { useEffect, useState, useRef } from "react"
import Scanner from './scanner';
import type { DbProduct } from '../../utils/types';



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
    const nameRef = useRef<HTMLInputElement>(null);
    const priceRef = useRef<HTMLInputElement>(null);
    const categoryRef = useRef<HTMLInputElement>(null);
    const storeRef = useRef<HTMLInputElement>(null);
    const descriptionRef = useRef<HTMLInputElement>(null);
    const [ existingItem, setExistingItem] = useState<boolean>(false);

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
        
        const req = await fetch(`${API}/update-product`, {
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

        if(res.ok && res.item){
            setExistingItem(true);
            const item: DbProduct = res.item;
            nameRef.current!.value = item.name;
            priceRef.current!.value = String(item.price);
            categoryRef.current!.value = item.category;
            storeRef.current!.value = item.store;
            descriptionRef.current!.value = item.description;
            if(item.barcode)setBarcode(item.barcode);

            const newFormData = {
                name: item.name,
                price: String(item.price),
                category: item.category,
                store: item.store,
                description: item.description,
            }
            setFormData(newFormData);
        }
    }

    useEffect(() => {
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
                    <input ref={nameRef} type="text" id="name" name="name" autoComplete="off" onChange={(e) => handleInputs(e)}/>
                </div>
                <div className={styles["input-container"]}>
                    <label htmlFor="price">Product price:</label>
                    <input ref={priceRef} type="text" id="price" name="price" autoComplete="off" onChange={(e) => handleInputs(e)} />
                </div>
                <div className={styles["input-container"]}>
                    <label htmlFor="category">Product category:</label>
                    <input ref={categoryRef} type="text" id="category" name="category" autoComplete="off" onChange={(e) => handleInputs(e)} />
                </div>
                <div className={styles["input-container"]}>
                    <label htmlFor="description">Product description:</label>
                    <input ref={descriptionRef} type="text" id="description" name="description" autoComplete="off" onChange={(e) => handleInputs(e)} />
                </div>
                <div className={styles["input-container"]}>
                    <label htmlFor="store">Store:</label>
                    <input ref={storeRef} type="text" id="store" name="store" autoComplete="off" onChange={(e) => handleInputs(e)} />
                </div>
                <div className={styles["input-container"]}>
                    <label htmlFor="image">Image:</label>
                    <input type="file" id="image" name="image" autoComplete="off" accept="image/*" onChange={(e) => setImage(e.target.files![0])} />
                </div>
                <button onClick={(e) => handleSubmit(e)}>{existingItem ? "Update" : "Create"}</button>
            </form>
        </div>
    )
}