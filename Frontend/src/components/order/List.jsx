import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const OrderListPage = () => {
  const [orders, setOrders] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editOrder, setEditOrder] = useState(null);
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [users, setUsers] = useState({}); // Stores users by userId
  const token = localStorage.getItem('token');

  // Fetch Orders
  const fetchOrders = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/orders`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token,
        },
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setOrders(data);
        fetchUsers(data); // Fetch user details after fetching orders
      } else {
        console.error('Error fetching orders:', data);
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    }
  };

  // Fetch user details based on userId from orders
  const fetchUsers = async (orders) => {
    const userIds = [...new Set(orders.map(order => order.userId))];
    try {
      const responses = await Promise.all(userIds.map(userId =>
        fetch(`${process.env.REACT_APP_API_URL}/users/${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-access-token': token,
          },
        })
      ));
      
      const usersData = await Promise.all(responses.map(res => res.json()));
      const usersMap = usersData.reduce((acc, user) => {
        acc[user.id] = user.username;
        return acc;
      }, {});
      
      setUsers(usersMap);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchOrders(); // Fetch orders when token is available
    }
  }, [token]);

  // Handle Edit Order Status
  const handleEditOrder = async (e) => {
    e.preventDefault();

    const updatedOrder = {
      status: editOrder.status, // Only edit the status
    };

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/orders/${editOrder.id}`, {
        method: 'PUT',
        headers: {
          'x-access-token': token,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedOrder),
      });

      if (response.ok) {
        toast.success('Order updated successfully!');
        setEditOrder(null);
        setModalOpen(false);
        fetchOrders(); // Reload orders list
      } else {
        toast.error('Error editing order');
      }
    } catch (error) {
      console.error('Error editing order:', error);
      toast.error('Error editing order');
    }
  };

  // Handle Delete Order
  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/orders/${orderToDelete}`, {
        method: 'DELETE',
        headers: {
          'x-access-token': token,
        },
      });

      if (response.ok) {
        toast.success('Order deleted successfully!');
        setConfirmationModalOpen(false);
        setOrderToDelete(null);
        fetchOrders(); // Reload orders list after deletion
      } else {
        toast.error('Error deleting order');
      }
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Error deleting order');
    }
  };

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <h1>Orders</h1>
      </header>
      <div className="dashboard-content">
        {/* Table to display orders */}
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>User ID</th>
              <th>Username</th> {/* New column for username */}
              <th>Total</th>
              <th>Status</th>
              <th>Order Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.userId}</td>
                <td>{users[order.userId]}</td> {/* Displaying the username */}
                <td>{order.total}</td>
                <td>{order.status}</td>
                <td>{new Date(order.orderDate).toLocaleString()}</td>
                <td>
                  <button onClick={() => {
                    setEditOrder(order);
                    setModalOpen(true);
                  }}>Edit Status</button>
                  <button onClick={() => {
                    setOrderToDelete(order.id);
                    setConfirmationModalOpen(true);
                  }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Edit Order Modal */}
        {modalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Edit Order Status</h2>
              <form onSubmit={handleEditOrder}>
                <select
                  value={editOrder?.status || ''}
                  onChange={(e) => setEditOrder({ ...editOrder, status: e.target.value })}
                  required
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="shipped">Shipped</option>
                  <option value="canceled">Canceled</option>
                </select>
                <button type="submit">Update Status</button>
                <button type="button" onClick={() => setModalOpen(false)}>Cancel</button>
              </form>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {confirmationModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Are you sure you want to delete this order?</h2>
              <button onClick={handleDeleteOrder}>Yes, Delete</button>
              <button onClick={() => setConfirmationModalOpen(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
      {/* Toast notifications */}
      <ToastContainer />
    </div>
  );
};

export default OrderListPage;
