// client/src/App.jsx
import React from 'react';
import LoginButton from './components/LoginButton';
import { useEffect, useState } from 'react';
import AppNavbar from './components/Navbar';
import { Routes, Route, Navigate } from "react-router-dom";
import Login from './pages/Login.jsx';
import SignUp from './pages/SignUp.jsx';
import Home from './pages/Home.jsx';
import Store from './pages/Store.jsx';
import Admin from './pages/Admin.jsx';
import Cart from './pages/Cart.jsx';
import AdminAddProduct from './pages/AdminAddProduct.jsx';
import ProductCardDetailed from './pages/ProductCardDetailed.jsx';
import Checkout from './pages/Checkout.jsx';
import AdminAddSlider from './pages/AdminAddSlider.jsx';
import Book from './pages/Book.jsx';
import ThankYou from './pages/ThankYou.jsx';
import SearchPage from './pages/SearchPage.jsx';
import ThankYouBooking from './pages/ThankYouBooking.jsx';
import apiFetch  from './api/apiClient.jsx';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState(() =>
  JSON.parse(localStorage.getItem("cart") || "[]")
);

const API = import.meta.env.VITE_API_URL;





  useEffect(() => {
     apiFetch("/auth/user")
      .then((res) => {
        if (!res.ok) throw new Error('Not authenticated');
        return res.json();
      })
      .then((data) => {
        setUser(data);
      setLoading(false);
        console.log('User info:', data);
      })
      .catch((err) => {
        setLoading(false);
      console.log(err.message);
      });
  }, []);

  if (loading) {
  return <div>Loading...</div>;
}

  return (
    <div>
      
       <AppNavbar user={user} setUser={setUser} cart={cart}  />
       
       
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cart" element={<Cart cart = {cart} setCart={setCart}/>} />
        <Route path="/login" element={<Login setUser={setUser}/>} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/store" element={<Store />} />
        <Route path="/admin" element={user && user.isAdmin
      ? <Admin/>
      : <Navigate to="/login" />}/>
        <Route path="/search" element={<SearchPage />} />
        <Route path="/checkout" element={user && user.displayName ? <Checkout user = {user}/> : <Navigate to="/login" />} />
        <Route
  path="/admin/addproduct"
  element={
    user && user.isAdmin
      ? <AdminAddProduct />
      : <Navigate to="/login" />
      
  }

/>
<Route
  path="/admin/addslider"
  element={
    user && user.isAdmin
      ? <AdminAddSlider />
      : <Navigate to="/login" />
      
  }

/>

<Route path="/products/:slug" element={<ProductCardDetailed />} />
<Route path="/book" element={<Book user={user} />} />
  <Route path="/thank-you" element={<ThankYou />} />
  <Route path="/thank-you-booking" element={<ThankYouBooking />} />
      </Routes>
      {/* {user ? (
        <p>Hello, {user.displayName}!</p>
      ) : (
        <a href="http://localhost:5000/auth/google">
          <button>Login with Google</button>
        </a>
      )} */}
    </div>
  );
}

export default App;
