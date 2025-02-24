import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import "../assets/css/CheckoutPage.css";

const CheckoutPage = () => {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [shippingAddress, setShippingAddress] = useState("");
  const [paymentInfo, setPaymentInfo] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Get cart from localStorage
    const savedCart = JSON.parse(localStorage.getItem("cart"));
    if (savedCart) {
      setCart(savedCart);
      setTotal(savedCart.reduce((acc, item) => acc + item.price * item.quantity, 0));
    } else {
      navigate("/"); // If no cart, redirect to the landing page
    }
  }, [navigate]);

  const handleCheckout = async () => {
    // Get the logged-in user's ID (you can change this based on your auth system)
    const userId = localStorage.getItem("userId") || "guest";

    // Prepare the order data
    const orderData = {
      userId,
      cart,
      shippingAddress,
      paymentInfo,
      total,
    };

    try {
      // Send the order details to the API
      const response = await fetch(`${process.env.REACT_APP_API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();
      if (response.ok) {
        // After successful checkout, clear the cart and redirect
        localStorage.removeItem("cart");
        navigate("/order-confirmation");
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      console.error("Error during checkout: ", err);
      alert("Something went wrong. Please try again later.");
    }
  };

  return (
    <div className="checkout-container">
      <h1>Checkout</h1>

      <div className="cart-items">
        <h2>Your Cart</h2>
        {cart.length === 0 ? (
          <p>No items in cart</p>
        ) : (
          <ul>
            {cart.map((item) => (
              <li key={item.id} className="cart-item">
                <span>{item.name}</span>
                <span>Rs. {item.price.toFixed(2)}</span>
                <span>Quantity: {item.quantity}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="checkout-details">
        <h3>Shipping Address</h3>
        <textarea
          value={shippingAddress}
          onChange={(e) => setShippingAddress(e.target.value)}
          placeholder="Enter your shipping address"
        ></textarea>

        <h3>Payment Information</h3>
        <input
          type="text"
          value={paymentInfo}
          onChange={(e) => setPaymentInfo(e.target.value)}
          placeholder="Enter payment details"
        />

        <div className="checkout-total">
          <h4>Total: Rs. {total.toFixed(2)}</h4>
        </div>

        <button className="btn btn-primary" onClick={handleCheckout}>
          Proceed with Checkout
        </button>
      </div>
    </div>
  );
};

export default CheckoutPage;
