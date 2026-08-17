import { useState, useEffect } from 'react'
import CreateNewProduct from '../../components/createNewProduct/createNewProduct';
import GlobalList from '../../components/globalList/globalList';
import MyList from '../../components/myList/myList';
import styles from './home.module.css'
import type { user, ListItem, DbProduct } from '../../utils/types';

type HomeProps = {
  user: user
}

function Home({user}:HomeProps) {
  const API = import.meta.env.VITE_WORKER_API;
  const [ activePanel, setActivePanel ] = useState<string | null>(null)
  const [myList, setMyList] = useState<ListItem[]>([]);
  const [favs, setFavs] = useState<DbProduct[] | null>(null);

  async function getFavs(userId: number) {
    const req = await fetch(`${API}/getFavoriteProducts`, {
      method: "POST",
      body: JSON.stringify(userId)
    })

    const res = await req.json();

    if(res.ok){
      const { results } = res;
      setFavs(results);
    }
  }

  async function delFav(userId: number, productId: number) {
    const req = await fetch(`${API}/removeFavorite`, {
      method: "POST",
      body: JSON.stringify({
        userId,
        productId
      })
    })

    const res = await req.json();

    if(res.ok){
      console.log(res.message);
      getFavs(userId);
    }
  }

  async function getMyList(){
    const req = await fetch(`${API}/my-list`, {
      method: "POST",
      body: JSON.stringify(user.id)
    })

    const res = await req.json();

    if(res.ok){
      console.log("MYLIST")
      const list = JSON.parse(res.data.list)
      if(!list)return
      setMyList(list);
      return;
    }
    if(!res.ok){
      console.log("MY_LIST", res.message)
    }
  }

  async function updateList(userId: number, myList: ListItem[]) {
    if(!Array.isArray(myList)) return;
    try{
      const req = await fetch(`${API}/update-list`, {
        method: "POST",
        body: JSON.stringify({
          list: myList,
          user_id: userId
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

  function handlePanelToggle(panelName: string){
    if ( activePanel === panelName ) {
      setActivePanel(null);
    } else {
      setActivePanel(panelName)
    }
  }

  useEffect(() => { getMyList();}, [])


  return (
    <>
      <h1>Shopping List</h1>
      <button className={`${styles["new-product-btn"]} ${styles.btn}`} onClick={() => handlePanelToggle("create")}>{activePanel === "create" ? "X": "+"}</button>
      {activePanel === "create" && <CreateNewProduct />}
      <button className={`${styles["global-list-btn"]} ${styles.btn}`} onClick={() => handlePanelToggle("global-list")}>{activePanel === "global-list" ? "X" : <img src="/Internet.svg"/>}</button>
      {activePanel === "global-list" && <GlobalList myList={myList} setMyList={setMyList} updateList={updateList} userId={user.id} getFavs={getFavs} favs={favs} delFav={delFav}/>}
      <MyList myList={myList} setMyList={setMyList} updateList={updateList} userId={user.id} />
    </>
  )
}

export default Home