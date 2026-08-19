import styles from './createNewProduct.module.css'
import React, { useEffect, useState, useRef } from "react"
import Scanner from './scanner';
import type { DbProduct } from '../../utils/types';
import ScannerRes from '../ScannerResults/scannerRes';
import CountrySelect from '../../components/countrySelect/countrySelect';



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
    const descriptionRef = useRef<HTMLTextAreaElement>(null);
    const [ country, setCountry ] = useState<string>("");
    const [ showExistingItems, setShowExistingItems] = useState<boolean>(false);
    const [ existingList, setExistingList] = useState<DbProduct[]>([]);
    const [ selectedItem, setSelectedItem] = useState<DbProduct | null>(null);

    function resetForm(e: React.MouseEvent<HTMLButtonElement>){
        e.preventDefault();
        nameRef.current!.value = "";
        priceRef.current!.value = "";
        categoryRef.current!.value = "";
        storeRef.current!.value = "";
        descriptionRef.current!.value = "";
        setFormData({
            name: "",
            price: "",
            category: "",
            store: "",
            description: "",
        })
        setCountry("");
        setImage(null);
        setBarcode(null);
        
        
    }

    function handleInputs(e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>){
        setFormData({
            ...formData,
            [e.target.name]: e.target.value.toLocaleLowerCase()
        })
    }

    async function handleSubmit(e: React.MouseEvent<HTMLButtonElement>){
        e.preventDefault();
        if ( !country || !nameRef || ! priceRef || !categoryRef || !descriptionRef || !storeRef || !barcode ){
            alert("Please fill all the fields!")
            return;
        }
        const data = new FormData();
        data.append("name", formData.name);
        data.append("price", formData.price);
        data.append("category", formData.category);
        data.append("store", formData.store);
        data.append("description", formData.description);
        data.append("country", country);
        if ( barcode ) data.append("barcode", barcode!);
        if ( image ) data.append("image", image!);
        
        const req = await fetch(`${API}/update-product`, {
            method: "POST",
            body: data
        })

        const res = await req.json();

        if ( res.ok ){
            alert("New Product added to the global list.")
        } else {
            console.log(res.message)
        }
    }

    async function getItemByBarcode(barcode: string | null){
        if(!barcode)return;
        const req = await fetch(`${API}/getitembybarcode`, {
            method: "POST",
            body: barcode
        })

        const res = await req.json();

        if(res.ok && res.items){
            setShowExistingItems(true);
            const items: DbProduct[] = res.items;
            setExistingList(items);
            
        }
    }

    useEffect(() => {
        getItemByBarcode(barcode);
    }, [barcode])

    useEffect(() => {
        if(!selectedItem)return;
        nameRef.current!.value = selectedItem.name;
        priceRef.current!.value = String(selectedItem.price);
        categoryRef.current!.value = selectedItem.category;
        storeRef.current!.value = selectedItem.store;
        descriptionRef.current!.value = selectedItem.description;
        if (selectedItem) setCountry(selectedItem.country);
        if (selectedItem.barcode) setBarcode(selectedItem.barcode);

        const newFormData = {
            id: selectedItem.id,
            name: selectedItem.name,
            price: String(selectedItem.price),
            category: selectedItem.category,
            store: selectedItem.store,
            description: selectedItem.description,
            country: selectedItem.country
        }
        setFormData(newFormData);
    }, [selectedItem])

    return(
        <div className='z-index'>
            <header className="header">
                <h2 className='fixed'>Create / Update product</h2>
            </header>
            {showExistingItems && <ScannerRes items={existingList} setSelectedItem={setSelectedItem} setShow={setShowExistingItems}/>}
            {showScanner && <Scanner setData={setBarcode} setShowScanner={setShowScanner}/>}
            <form onKeyDown={(e) => {
                if (e.key === "Enter") {
                    e.preventDefault();
                }
            }}>
                <button type="button" onClick={() => setShowScanner(true)}>Barcode Scanner</button>
                <p>Barcode: {barcode}</p>
                
                <div className={styles["input-container"]}>
                    <label>Country: </label>
                    <CountrySelect setCountry={setCountry}/>
                </div>
                <div className={styles["input-container"]}>
                    <label htmlFor="name">Product name:</label>
                    <input ref={nameRef} type="text" id="name" name="name" autoComplete="off" onChange={(e) => handleInputs(e)}/>
                </div>
                <div className={styles["input-container"]}>
                    <label htmlFor="price">Product price in €:</label>
                    <input ref={priceRef} type="text" id="price" name="price" autoComplete="off" onChange={(e) => handleInputs(e)} />
                </div>
                <div className={styles["input-container"]}>
                    <label htmlFor="category">Product category:</label>
                    <input ref={categoryRef} type="text" id="category" name="category" autoComplete="off" onChange={(e) => handleInputs(e)} />
                </div>
                <div className={styles["input-container"]}>
                    <label htmlFor="description">Product description:</label>
                    <textarea ref={descriptionRef} rows={5} id="description" name="description" autoComplete="off" onChange={(e) => handleInputs(e)} />
                </div>
                <div className={styles["input-container"]}>
                    <label htmlFor="store">Store:</label>
                    <input ref={storeRef} type="text" id="store" name="store" autoComplete="off" onChange={(e) => handleInputs(e)} />
                </div>
                <div className={styles["input-container"]}>
                    <label htmlFor="image">Image:</label>
                    <input type="file" id="image" name="image" autoComplete="off" accept="image/*" onChange={(e) => setImage(e.target.files![0])} />
                </div>
                <button onClick={(e) => handleSubmit(e)}>{selectedItem ? "Update" : "Create New"}</button>
                <button onClick={(e) => resetForm(e)}>Reset</button>
            </form>
        </div>
    )
}

/*


            */