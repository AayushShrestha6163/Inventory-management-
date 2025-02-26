import { useState, useEffect } from 'react';
import { FaBell } from 'react-icons/fa'; // Import Bell Icon
import '../assets/css/AdminDashboard.css';


import DashboardContent from './DashboardContent';
import SettingsContent from './SettingsContent';
import UserListContent from './user/List';
import ProductListContent from './product/List';
import OrderListContent from './order/List';

function AdminDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeLink, setActiveLink] = useState('dashboard'); // Default active link
  const [username, setUsername] = useState('');
  const [lowStockProducts, setLowStockProducts] = useState([]); // Store low-stock products
  const [showModal, setShowModal] = useState(false); // Show Modal on Bell Click


  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    window.location.href = '/login';
  };

  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };


  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }

    fetchLowStockProducts();
  }, []);

 
  const fetchLowStockProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_URL}/low-stock`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token,
        },
      });
      const data = await response.json();

      if (response.ok) {
        setLowStockProducts(data.products || []); // Store low-stock products
      } else {
        console.error('Error fetching low stock:', data.message);
      }
    } catch (error) {
      console.error('Error fetching low stock:', error);
    }
  };

  
  const handleLinkClick = (link) => {
    setActiveLink(link);
  };

  
  const toggleModal = () => {
    setShowModal(!showModal);
  };

  
  const renderContent = () => {
    switch (activeLink) {
      case 'dashboard':
        return <DashboardContent />;
      case 'settings':
        return <SettingsContent />;
      case 'users':
        return <UserListContent />;
      case 'products':
        return <ProductListContent />;
      case 'orders':
        return <OrderListContent />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <h2>
          {localStorage.getItem('username')}
          <span>({localStorage.getItem('email')})</span>
        </h2>
        <ul>
          <li className={activeLink === 'dashboard' ? 'active' : ''} onClick={() => handleLinkClick('dashboard')}>
            Dashboard
          </li>
          <li className={activeLink === 'users' ? 'active' : ''} onClick={() => handleLinkClick('users')}>
            Users
          </li>
          <li className={activeLink === 'products' ? 'active' : ''} onClick={() => handleLinkClick('products')}>
            Products
          </li>
          <li className={activeLink === 'orders' ? 'active' : ''} onClick={() => handleLinkClick('orders')}>
            Orders
          </li>
          <li>
            <div className="notification-bell" onClick={toggleModal}>
              <FaBell size={24} />
              {lowStockProducts.length > 0 && <span className="notification-badge">{lowStockProducts.length}</span>}
            </div>
          </li>
        </ul>
        <button onClick={handleLogout}>Logout</button>
      </div>

      {/* Hamburger menu icon (for mobile) */}
      <div className="hamburger" onClick={toggleSidebar}>
        <span className="bar"></span>
        <span className="bar"></span>
        <span className="bar"></span>
      </div>

      {/* Modal for Low Stock Notification */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h4>⚠️ Low Stock Products</h4>
              <button className="close" onClick={toggleModal}>X</button>
            </div>
            <div className="modal-body">
              {lowStockProducts.length > 0 ? (
                <ul>
                  {lowStockProducts.map((product) => (
                    <li key={product.id}>
                      {product.productName} - Only {product.stock} left!
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No low stock products at the moment.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="content">
        {renderContent()} {/* Render content dynamically */}
      </div>
    </div>
  );
}

export default AdminDashboard;
