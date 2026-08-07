import Home from './pages/home/home';
import Login from './components/login/login';
import NewAccount from './pages/newAccount/newAccount';
import { useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import type { user } from './utils/types';

function App() {
  const [token, setToken] = useState<string>("");
  const [user, setUser] = useState<user | null>(null);
  

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={token ? <Home user={user}/> : <Login setToken={setToken} setUser={setUser} />}></Route>
          <Route path="/newaccount" element={<NewAccount />}></Route>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
