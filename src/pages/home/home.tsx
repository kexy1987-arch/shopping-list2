import { useState, useEffect } from 'react'
import CreateNewProduct from '../../components/createNewProduct/createNewProduct';
import GlobalList from '../../components/globalList/globalList';
import MyList from '../../components/myList/myList';
import styles from './home.module.css'
import type { user, ListItem } from '../../utils/types';

type HomeProps = {
  user: user
}

function Home({user}:HomeProps) {
  const API = import.meta.env.VITE_WORKER_API;
  const [ activePanel, setActivePanel ] = useState<string | null>(null)
  const [myList, setMyList] = useState<ListItem[]>([]);

  async function getMyList(){
    const req = await fetch(`${API}/my-list`, {
      method: "POST",
      body: JSON.stringify(user.id)
    })

    const res = await req.json();

    if(res.ok){
      
      const list = JSON.parse(res.data.list)
    //  list.sort((a: ListItem, b: ListItem) => Number(a.bought) - Number(b.bought));
      setMyList(list);
      return;
    }
    if(!res.ok){
      console.log("MY_LIST", res.message)
    }
  }

  async function updateList() {
    if(!Array.isArray(myList)) return;
    try{
      const req = await fetch(`${API}/update-list`, {
        method: "POST",
        body: JSON.stringify({
          list: myList,
          user_id: user.id
        })
      })

      const res = await req.json()
      if (res.ok) {
        console.log(res.message)
      }
    } catch (error){
      console.log("UPDATE_LIST", error)
    }  
  }

  useEffect(() => { 
    updateList()
  }, [ myList ])

  function handlePanelToggle(panelName: string){
    if ( activePanel === panelName ) {
      setActivePanel(null);
    } else {
      setActivePanel(panelName)
    }
  }

  useEffect(() => {
    getMyList()
  }, [])

  return (
    <>
      <h1>Shopping List</h1>
      <button className={`${styles["new-product-btn"]} ${styles.btn}`} onClick={() => handlePanelToggle("create")}>{activePanel === "create" ? "X": "+"}</button>
      {activePanel === "create" && <CreateNewProduct />}
      <button className={`${styles["global-list-btn"]} ${styles.btn}`} onClick={() => handlePanelToggle("global-list")}>{activePanel === "global-list" ? "X" : <img src="/Internet.svg"/>}</button>
      {activePanel === "global-list" && <GlobalList myList={myList} setMyList={setMyList}/>}
      <MyList myList={myList} setMyList={setMyList}/>
    </>
  )
}

export default Home