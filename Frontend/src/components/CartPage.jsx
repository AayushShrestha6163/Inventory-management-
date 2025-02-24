import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../assets/css/CartPage.css"; // Optional: for custom styling

const CartPage = () => {
  const [cart, setCart] = useState([]); // State to hold the cart items
  const navigate = useNavigate();

  useEffect(() => {
    // Retrieve cart from localStorage
    const savedCart = JSON.parse(localStorage.getItem("cart"));
    if (savedCart) {
      setCart(savedCart);
    }
  }, []);

  const removeFromCart = (productId) => {
    const updatedCart = cart.filter(item => item.id !== productId);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);

  const handleProceedToCheckout = () => {
    // Check if the user is logged in
    const username = localStorage.getItem("username");
    if (!username) {
      // Redirect to the login page if not logged in
      navigate("/Login");
    } else {
      // Redirect to checkout page if logged in
      navigate("/checkout");
    }
  };

  return (
    <div className="cart-container">
      <h1>Your Cart</h1>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div>
          <table className="cart-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {cart.map(item => (
                <tr key={item.id} className="cart-item">
                  <td>{item.name}</td>
                  <td>Rs. {item.price.toFixed(2)}</td>
                  <td>{item.quantity}</td>
                  <td>Rs. {(item.price * item.quantity).toFixed(2)}</td>
                  <td>
                    <button className="remove-btn" onClick={() => removeFromCart(item.id)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="cart-total">
            <p>Total: Rs. {cartTotal}</p>
            <button className="btn btn-primary" onClick={handleProceedToCheckout}>
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
