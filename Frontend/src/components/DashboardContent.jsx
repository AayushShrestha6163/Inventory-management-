import React, { useState, useEffect } from 'react';

const DashboardContent = () => {
  const [counts, setCounts] = useState({
    products: 0,
    orders: 0,
  });

  useEffect(() => {
    // Fetch products and orders count from the API
    const fetchCounts = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.REACT_APP_API_URL}/products-and-orders-counts`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-access-token': token,
          },
        });
        const data = await response.json();

        if (response.ok) {
          // Update state with the fetched counts
          setCounts({
            products: data.products || 0,
            orders: data.orders || 0,
          });
        } else {
          console.error('Error fetching counts:', data.message);
        }
      } catch (error) {
        console.error('Error fetching counts:', error);
      }
    };

    fetchCounts();
  }, []); // Empty dependency array means it runs once when the component mounts

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
      </header>
      <div className="dashboard-content">
        <div className="dashboard-stats">
          <div className="stat-item">
            <h2>Products Count</h2>
            <p>{counts.products}</p>
          </div>
          <div className="stat-item">
            <h2>Orders Count</h2>
            <p>{counts.orders}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;
