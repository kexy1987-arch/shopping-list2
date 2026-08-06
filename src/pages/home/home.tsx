import { useState } from 'react'
import CreateNewProduct from '../../components/createNewProduct/createNewProduct';
import GlobalList from '../../components/createNewProduct/globalList/globalList';
import styles from './home.module.css'

function Home() {
  const [ activePanel, setActivePanel ] = useState<string | null>(null)

  function handlePanelToggle(panelName: string){
    if ( activePanel === panelName ) {
      setActivePanel(null);
    } else {
      setActivePanel(panelName)
    }
  }

  return (
    <>
      <button className={`${styles["new-product-btn"]} ${styles.btn}`} onClick={() => handlePanelToggle("create")}>{activePanel === "create" ? "X": "+"}</button>
      {activePanel === "create" && <CreateNewProduct />}
      <button className={`${styles["global-list-btn"]} ${styles.btn}`} onClick={() => handlePanelToggle("global-list")}>{activePanel === "global-list" ? "X" : <img src="/Internet.svg"/>}</button>
      {activePanel === "global-list" && <GlobalList/>}
    </>
  )
}

export default Home