import styles from './createNewProduct.module.css'
import React, { useEffect, useState, useRef } from "react"
import Scanner from './scanner';
import type { AzureOCRResponse, DbProduct } from '../../utils/types';
import ScannerRes from '../ScannerResults/scannerRes';
import CountrySelect from '../../components/countrySelect/countrySelect';
import currencyMap from '../../utils/functions';
import NotifBar from '../notifbar/notifbar';
import Modal from '../modal/modal';



export default function CreateNewProduct(){
    const API = import.meta.env.VITE_WORKER_API;
    const azureAPI = import.meta.env.VITE_AZURE_API;
    const azureKey = import.meta.env.VITE_AZURE_KEY;

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
    const [ message, setMessage ] = useState<string>("")
    const [ loading, setLoading ] = useState<boolean>(false);
    const [ reset, setReset ] = useState<boolean>(true);

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
        setReset(!reset);
        const inputs = document.querySelectorAll(`.${styles["input-container"]}`);
        inputs.forEach((i, index) => {
            if(index !== 0){
                i.classList.remove(styles.height)
                i.classList.remove(styles["textarea-height"])
            }
        })
    }

    function handleInputs(e: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>){
        setFormData({
            ...formData,
            [e.target.name]: e.target.value.toLocaleLowerCase()
        })
        const parent = e.currentTarget.parentElement;
        const nextEl = parent?.nextElementSibling as HTMLElement || null;
        
        if (nextEl ){
            const nextInput = nextEl.children[1] as HTMLInputElement || HTMLTextAreaElement;
            if(nextInput instanceof HTMLTextAreaElement){
                nextEl.classList.add(`${styles["textarea-height"]}`)
                return;
            }
            nextEl.classList.add(`${styles.height}`);
        }
    }

    function onEnter(e: React.KeyboardEvent<HTMLInputElement> | React.KeyboardEvent<HTMLTextAreaElement>){
        if (e.key !== "Enter")return;
        const parent = e.currentTarget.parentElement;
        const nextEl = parent?.nextElementSibling as HTMLElement || null;

        if (nextEl) {
            const nextInput = nextEl.children[1] as HTMLInputElement || HTMLTextAreaElement;
            nextInput.focus()
            if (nextInput instanceof HTMLTextAreaElement) {
                nextEl.classList.add(`${styles["textarea-height"]}`)
                return;
            }
            nextEl.classList.add(`${styles.height}`);
            
        }
    }

    useEffect(() => {
        const firstEl = document.querySelector(`.${styles["height"]}`) as HTMLElement || null;
        const nextEl = firstEl?.nextElementSibling as HTMLElement || null;

        if (country) {
            nextEl.classList.add(`${styles.height}`)
            const nextInput = nextEl.lastElementChild as HTMLInputElement
            if (nextInput) nextInput.focus()
        }
}, [country])

    async function handleSubmit(e: React.MouseEvent<HTMLButtonElement>){
        e.preventDefault();
        if ( !country || !nameRef || ! priceRef || !categoryRef || !descriptionRef || !storeRef || !barcode ){
            setMessage("Please fill all the fields!");
            return;
        }
        const data = new FormData();
        data.append("name", formData.name.toLocaleLowerCase());
        data.append("price", formData.price);
        data.append("category", formData.category.toLocaleLowerCase());
        data.append("store", formData.store.toLocaleLowerCase());
        data.append("description", formData.description.toLocaleLowerCase());
        data.append("country", country);
        if ( barcode ) data.append("barcode", barcode!);
        if ( image ) data.append("image", image!);
        
        const req = await fetch(`${API}/update-product`, {
            method: "POST",
            body: data
        })

        const res = await req.json();

        if ( res.ok ){
            setMessage("New Product added to the global list.");
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
        nameRef.current!.value = selectedItem.name.toLocaleLowerCase();
        priceRef.current!.value = String(selectedItem.price);
        categoryRef.current!.value = selectedItem.category.toLocaleLowerCase();
        storeRef.current!.value = selectedItem.store.toLocaleLowerCase();
        descriptionRef.current!.value = selectedItem.description.toLocaleLowerCase();
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

    async function translateImg(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.currentTarget.files) return;
        setLoading(true);

        const file = e.currentTarget.files[0];
        const formData = new FormData();
        formData.append("file", file);

        const azureocr = await fetch(`${API}/acureocr`, {
            method: "POST",
            body: formData
        })       
        
        const data = await azureocr.json();

        if(data.ok){
            const text = data.text;
            if (descriptionRef.current) {
                descriptionRef.current.value = text;

                handleInputs({
                    target: descriptionRef.current,
                    currentTarget: descriptionRef.current
                } as React.ChangeEvent<HTMLTextAreaElement>);
            }

            setLoading(false);
        }

        

        
    }


    return(
        <div className='z-index'>
            {loading && <Modal message={<h2>LOADING...</h2>}/>}
            <NotifBar message={message}/>
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
                <button type="button" onClick={() => setShowScanner(true)}>Scan the Barcode</button>
                <p>Barcode: {barcode}</p>
                
                <div className={`${styles["input-container"]} ${styles.country} ${styles.height}`}>
                    <label>Country: </label>
                    <CountrySelect setCountry={setCountry} reset={reset}/>
                </div>
                <div className={styles["input-container"]}>
                    <label htmlFor="name">Product name:</label>
                    <input onKeyDown={(e) => onEnter(e)} className={styles.input} ref={nameRef} type="text" id="name" name="name" autoComplete="off" onChange={(e) => handleInputs(e)}/>
                </div>
                <div className={styles["input-container"]}>
                    <label htmlFor="price">Product price in {currencyMap(country)}:</label>
                    <input onKeyDown={(e) => onEnter(e)} ref={priceRef} type="number" id="price" name="price" autoComplete="off" onChange={(e) => handleInputs(e)} />
                </div>
                <div className={styles["input-container"]}>
                    <label htmlFor="category">Product category:</label>
                    <input onKeyDown={(e) => onEnter(e)} ref={categoryRef} type="text" id="category" name="category" autoComplete="off" onChange={(e) => handleInputs(e)} />
                </div>
                <div className={styles["input-container"]}>
                    <label htmlFor="store">Store:</label>
                    <input onKeyDown={(e) => onEnter(e)} ref={storeRef} type="text" id="store" name="store" autoComplete="off" onChange={(e) => handleInputs(e)} />
                </div>
                <div className={styles["input-container"]}>
                    <label htmlFor="description">Product description:</label>
                    <textarea onKeyDown={(e) => onEnter(e)} ref={descriptionRef} rows={5} id="description" name="description" autoComplete="off" onChange={(e) => handleInputs(e)} />
                    <label className={styles["description-image-btn"]} htmlFor="image">Use Photo</label>
                    <input className={styles.hide} id="image" type="file" accept="image/*" onChange={(e) => translateImg(e)} />

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