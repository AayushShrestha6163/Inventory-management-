// src/pages/OrderConfirmation.js

import React from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation
import '../assets/css/OrderConfirmation.css'; // Import CSS for styling

const OrderConfirmation = () => {
  return (
    <div className="order-confirmation-container">
      <h1>Thank you for your order!</h1>
      <p>Your order has been placed successfully. You will receive a confirmation email shortly.</p>
      <Link to="/"><button>Back to Home</button></Link>
    </div>
  );
};

export default OrderConfirmation;
