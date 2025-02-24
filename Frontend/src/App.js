// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import SignUP from './components/SignUp';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import AuthMiddleware from './middleware/AuthMiddleware'; // Import the middleware
import LandingPage from './components/LandingPage';
import CheckoutPage from './components/CheckoutPage';
import OrderConfirmation from './components/OrderConfirmation';
import CartPage from './components/CartPage';
import OrderList from './components/order/List';

function App() {
    return (
        <Router>
            <Routes>
            <Route path="/" element={<LandingPage />} />
                <Route path="/signup" element={<SignUP />} />
                <Route path="/login" element={<Login />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-confirmation" element={<OrderConfirmation />} />
                <Route path="/orders" element={<OrderList />} />
                <Route 
                    path="/admin" 
                    element={
                        <AuthMiddleware>
                            <AdminDashboard />
                        </AuthMiddleware>
                    } 
                />
                <Route path="/" element={
                    <>
                        <h1>Welcome to the App</h1>
                        <Link to="/login">Login</Link>
                        <Link to="/signup">Sign Up</Link>
                    </>
                } />
            </Routes>
        </Router>
    );
}

export default App;