import Home from './pages/home/home';
import Login from './components/login/login';
import NewAccount from './pages/newAccount/newAccount';
import { useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

function App() {
  const [token, setToken] = useState<string>("");
  

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={token ? <Home /> : <Login setToken={setToken} />}></Route>
          <Route path="/newaccount" element={<NewAccount />}></Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
