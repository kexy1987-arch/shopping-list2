import { useState } from 'react'
import CreateNewProduct from './components/createNewProduct/createNewProduct'

function App() {
  const [showCreateNewProduct, setShowCreateNewProduct] = useState<boolean>(false);

  return (
    <>
      <button onClick={() => setShowCreateNewProduct(true)}>+</button>
      {showCreateNewProduct && <CreateNewProduct setShowCreateNewProduct={setShowCreateNewProduct}/>}
    </>
  )
}

export default App
