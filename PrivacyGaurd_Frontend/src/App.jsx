import './App.css';
import { Sidebar } from './components/sidebar';
import { Application } from './components/Application';
import { Analysis } from './pages/Analysis';
import { History } from './pages/History';
import { Changes } from './pages/changes';
import { Register } from './components/Register';
import { Routes, Route, BrowserRouter, useLocation } from 'react-router-dom';
import { useState } from 'react';
import {Login} from './components/Login';
import { FaBars } from "react-icons/fa";
import { ForgetPassword } from './components/ForgetPassword';
import { ResetPassword } from './components/ResetPassword';
import AuthProvider from './components/AuthProvider';
import ProtectedRoute from './components/ProtectedRoute';

function MainLayout() {

  const [appId, setAppId] = useState();
  const [isSidebaropen,setIsSidebarOpen] = useState(false);
  const location = useLocation();

  function handleHamburger(){
    setIsSidebarOpen(prev => !prev);
  }

  function handleCloseSidebar() {
  setIsSidebarOpen(false);
}


  const hideSidebar =
    location.pathname === "/" ||
    location.pathname === "/login" ||
    location.pathname === "/forget-password" ||
    location.pathname.startsWith("/reset-password/");

  return (
    <div className="app">

      {!hideSidebar && <button onClick={handleHamburger} className='hamburger-btn'><FaBars /></button>}

      {!hideSidebar && <Sidebar appId={appId} isSidebaropen={isSidebaropen} onToggle={handleHamburger} onClose={handleCloseSidebar}/>}

      <Routes>

        <Route path='/' element={<Register />} />
        <Route path='/login' element={<Login />} />
        <Route path="/forget-password" element={<ForgetPassword/>}/>
        <Route path='/reset-password/:resetToken' element={<ResetPassword/>}/>

        <Route element={<ProtectedRoute/>}>

        <Route path="/application" element={<Application setAppId={setAppId} /> } />
        <Route path="/analysis" element={<Analysis />} />
        <Route path="/analysis/:app_id" element={<Analysis />} />
        <Route path="/history" element={<History />} />
        <Route path="/changes/:app_id" element={<Changes />} />

        </Route>
        

      </Routes>

    </div>
  );
}

function App() {

  return (
    <AuthProvider>

      <BrowserRouter>
      <MainLayout />
    </BrowserRouter>

    </AuthProvider>
    
  )
}

export default App;