// src/components/AuthMiddleware.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const AuthMiddleware = ({ children }) => {
    const token = localStorage.getItem('token');

    // If no token is found, redirect to login
    if (!token) {
        return <Navigate to="/" />;
    }

    // If token exists, render the children (the protected component)
    return children;
};

export default AuthMiddleware;