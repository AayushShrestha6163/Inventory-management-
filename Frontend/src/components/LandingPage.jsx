import React, { useState, useEffect } from "react";
import { ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../assets/css/LandingPage.css"; // Custom CSS
import { Link } from "react-router-dom";

const LandingPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);
  const [username, setUsername] = useState(null);
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    // Fetch products from the API
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/allproducts`);
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = await response.json();
        setItems(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

    // Check if the user is logged in and set the username
    const loggedInUsername = localStorage.getItem("username");
    if (loggedInUsername) {
      setUsername(loggedInUsername);
    }

    // Retrieve cart from localStorage (if any)
    const savedCart = JSON.parse(localStorage.getItem("cart"));
    if (savedCart) {
      setCart(savedCart);
    }
  }, []);

  const addToCart = (product) => {
    const existingProduct = cart.find(item => item.id === product.id);
    
    if (existingProduct) {
      // Check if adding this product exceeds the stock
      const totalQuantityInCart = existingProduct.quantity + 1;
      
      if (totalQuantityInCart <= product.stock) {
        const updatedCart = cart.map(item =>
          item.id === product.id
            ? { ...item, quantity: existingProduct.quantity + 1 }
            : item
        );
        setCart(updatedCart);
        localStorage.setItem("cart", JSON.stringify(updatedCart));
      } else {
        alert(`You can only add ${product.stock - existingProduct.quantity} more item(s) to your cart.`);
      }
    } else {
      // If product isn't in the cart, add it with quantity 1
      const updatedCart = [...cart, { ...product, quantity: 1 }];
      setCart(updatedCart);
      localStorage.setItem("cart", JSON.stringify(updatedCart));
    }
  };

  const removeFromCart = (productId) => {
    const updatedCart = cart.filter(item => item.id !== productId);
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleLogout = () => {
    localStorage.removeItem("username");
    setUsername(null);
    navigate("/"); // Redirect to the homepage or login page
  };

  const handleCartClick = () => {
    if (!username) {
      navigate("/Login");
    } else {
      navigate("/cart");
    }
  };

  // Render the stock message
  const renderStockMessage = (item) => {
    const itemInCart = cart.find(cartItem => cartItem.id === item.id);
    const itemStockLeft = item.stock - (itemInCart ? itemInCart.quantity : 0);

    if (itemStockLeft <= 2) {
      return <span className="out-of-stock">Out of Stock</span>;
    }

    return `Left: ${itemStockLeft}`;
  };
  // Render Add to Cart Button
  const renderAddToCartButton = (item) => {
    const itemInCart = cart.find(cartItem => cartItem.id === item.id);
    const itemStockLeft = item.stock - (itemInCart ? itemInCart.quantity : 0);

    if (itemStockLeft <= 2) {
      return (
        <button className="add-to-bag out-of-stock-button" disabled>
          Out of Stock
        </button>
      );
    }

    return (
      <button
        className="add-to-bag"
        onClick={() => addToCart(item)}
        disabled={itemStockLeft <= 2}
      >
        Add to Bag
      </button>
    );
  };
  return (
    <div className="landing-container">
      <nav className="navbar">
        <div className="nav-content">
          <div className="logo-container">
            <h1 className="logo-text">InventoryPro</h1>
          </div>
          <div className="nav-buttons">
            {username ? (
              <>
                <span className="username-display">Hello, {username}</span>
                <button className="btn btn-secondary" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/Login">
                  <button className="btn btn-secondary">Login</button>
                </Link>
                <Link to="/SignUp">
                  <button className="btn btn-primary">Sign Up</button>
                </Link>
              </>
            )}
            <div className="cart-icon-container">
              <button className="cart-icon" onClick={handleCartClick}>
                <ShoppingCart />
                {cartItemCount > 0 && (
                  <span className="cart-count">{cartItemCount}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="main-content">
        <div className="product-grid">
          {items.map((item) => (
            <div key={item.id} className="product-card">
              <img
                src={`${process.env.REACT_APP_APP_API_URL}/${item.image}`} 
                alt={item.name}
                className="product-image"
              />
              <div className="product-details">
                <h3 className="product-name">{item.name}</h3>
                <div className="product-info">
                  <p className="product-price">Rs.{item.price.toFixed(2)}</p>
                  <p className="product-stock">
                    {renderStockMessage(item)}
                  </p>
                </div>
                {renderAddToCartButton(item)}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
