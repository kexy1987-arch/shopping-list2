import { useState, useEffect, useRef } from 'react'
import CreateNewProduct from '../../components/createNewProduct/createNewProduct';
import GlobalList from '../../components/globalList/globalList';
import MyList from '../../components/myList/myList';
import Favorites from '../../components/favorites/favorites';
import styles from './home.module.css'
import type { user, ListItem, DbProduct } from '../../utils/types';
import ChangeCountry from '../../components/changeCountry/changeCountry';
import { loadTheme } from '../../utils/functions';
import NotifBar from '../../components/notifbar/notifbar';


type HomeProps = {
  user: user
}

function Home({user}:HomeProps) {
  const API = import.meta.env.VITE_WORKER_API;
  const [ activePanel, setActivePanel ] = useState<string | null>(null)
  const [ myList, setMyList ] = useState<ListItem[]>([]);
  const [ favs, setFavs ] = useState<DbProduct[] | null>(null);
  const [ country, setCountry ] = useState<string>(user.country);
  const [ showSettings, setShowSetting ] = useState<boolean>(false);
  const [ message, setMessage ] = useState<string>("");

  const btnRef = useRef<HTMLButtonElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(`${API}/ws/my-list/ws?userId=${user.id}`);

    wsRef.current = ws;

    ws.addEventListener("open", () => {
      console.log("Ws connected");
      ws.send(JSON.stringify(user.id))
    })
    
    ws.addEventListener("message", (event: MessageEvent) => {
      const { data } = JSON.parse(event.data);
      const list = JSON.parse(data);
      console.log("ws:", list)
      setMyList(list);
    });

    ws.addEventListener("close", () => {
      console.log("Ws closed");
    })
  }, [user.id])

  

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        !settingsRef.current?.contains(e.target as Node) &&
        settingsRef.current &&
        showSettings &&
        btnRef.current &&
        !btnRef.current.contains(e.target as Node)
      ) {
        setShowSetting(false);
      }
    }
    const settings = settingsRef.current;

    if (!settings) return;

    if (showSettings) {
      settings.style.transform = "translate(15%, -13.5%)"
    } else {
      settings.style.transform = "translate(-150%, -13.5%)"
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [showSettings]);

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

  
  async function getMyList(userId: number){
    const req = await fetch(`${API}/my-list`, {
      method: "POST",
      body: JSON.stringify(userId)
    })

    const res = await req.json();

    if(res.ok){
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
        wsRef.current?.send(String(userId));
      }
    } catch (error){
      console.log("UPDATE_LIST", error)
    }  
  }  

  function handlePanelToggle(e: React.MouseEvent<HTMLButtonElement>, panelName: string){
    console.log(panelName)
    if ( activePanel === panelName ) {
      setActivePanel(null);
    } else {
      setActivePanel(panelName)
    }
    const btns = document.querySelectorAll(`.${styles.btn}`)
    btns.forEach(btn => {
      btn.classList.remove(styles.selected)
    })

    if(activePanel === panelName) return;
    const selected = e.currentTarget;
    selected.classList.add(`${styles.selected}`)
  }



  async function setTheme(e: React.ChangeEvent<HTMLSelectElement>){
    e.stopPropagation();
    const num = Number(e.currentTarget.value);
    if(!num) return;

    const req = await fetch(`${API}/set-theme`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        userId: user.id,
        theme: num
      })
    })

    const res = await req.json();
    
    if(res.ok){
      loadTheme(num);
    }
  }

  function handleSettingsBtn(){
    setShowSetting(!showSettings);    
  }


  return (
    <>
      <NotifBar message={message} />
      <h1>Shopping List</h1>
      <div className={styles.settings}>
        <button ref={btnRef} onClick={handleSettingsBtn}>setting</button>
        <div ref={settingsRef} className={styles["settings-container"]}>
          <label>Country:
            <ChangeCountry user={user} country={country} setCountry={setCountry} />
          </label>          
          <label>Theme: 
            <select className={styles["theme-sel"]} onChange={(e) => setTheme(e)}>
              <option value={0}></option>
              <option className={styles.theme1} value={1}>Theme 1</option>
              <option className={styles.theme2} value={2}>Theme 2</option>
            </select>
          </label>
        </div>
      </div>            
      {<MyList setMessage={setMessage} wsRef={wsRef} getMyList={getMyList} favs={favs} getFavs={getFavs} delFav={delFav} myList={myList} updateList={updateList} userId={user.id} />}
      {activePanel === "create" && <CreateNewProduct />}
      {activePanel === "global-list" && <GlobalList setMessage={setMessage} myList={myList} setMyList={setMyList} updateList={updateList} userId={user.id} getFavs={getFavs} favs={favs} delFav={delFav} country={country} />}
      {activePanel === "favorites" && <Favorites setMessage={setMessage} favs={favs} delFav={delFav} userId={user.id} myList={myList} setMyList={setMyList} updateList={updateList} getFavs={getFavs} />}
      
      <div className={styles["btn-container"]}>
        <button className={`${styles["new-product-btn"]} ${styles.btn}`} onClick={(e) => handlePanelToggle(e, "create")}>{activePanel === "create" ? "x": "New Product"}</button>        

        <button className={`${styles["global-list-btn"]} ${styles.btn}`} onClick={(e) => handlePanelToggle(e, "global-list")}>{activePanel === "global-list" ? "x" : <img src="/shop.svg"/>}</button>
      
        <button className={`${styles["favorites-btn"]} ${styles.btn}`} onClick={(e) => handlePanelToggle(e, "favorites")}>{activePanel === "favorites" ? "x" : <img src="/FavoriteFilled.svg" />}</button>
      </div>
      
    </>
  )
}

export default Home