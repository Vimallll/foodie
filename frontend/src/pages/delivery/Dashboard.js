import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import '../admin/Admin.css';

const DeliveryDashboard = () => {
  const [stats, setStats] = useState(null);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, availableRes, myOrdersRes] = await Promise.all([
        api.get('/delivery/stats'),
        api.get('/delivery/orders/available'),
        api.get('/delivery/orders'),
      ]);
      setStats(statsRes.data.stats);
      setAvailableOrders(availableRes.data.orders);
      setMyOrders(myOrdersRes.data.orders);
      setIsAvailable(statsRes.data.stats.isAvailable);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const acceptOrder = async (orderId) => {
    try {
      await api.post(`/delivery/orders/${orderId}/accept`);
      toast.success('Order accepted');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error accepting order');
    }
  };

  const deliverOrder = async (orderId) => {
    try {
      await api.put(`/delivery/orders/${orderId}/deliver`);
      toast.success('Order marked as delivered');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating order');
    }
  };

  const toggleAvailability = async () => {
    try {
      await api.put('/delivery/availability', { isAvailable: !isAvailable });
      setIsAvailable(!isAvailable);
      toast.success(`You are now ${!isAvailable ? 'available' : 'unavailable'}`);
    } catch (error) {
      toast.error('Error updating availability');
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-header">
          <h1>Delivery Dashboard</h1>
          <button
            onClick={toggleAvailability}
            className={isAvailable ? 'btn-primary' : 'btn-secondary'}
          >
            {isAvailable ? 'Available' : 'Unavailable'}
          </button>
        </div>

        {stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Orders</h3>
              <p className="stat-number">{stats.totalOrders}</p>
            </div>
            <div className="stat-card">
              <h3>Delivered</h3>
              <p className="stat-number">{stats.deliveredOrders}</p>
            </div>
            <div className="stat-card">
              <h3>In Progress</h3>
              <p className="stat-number">{stats.inProgressOrders}</p>
            </div>
            <div className="stat-card">
              <h3>Total Earnings</h3>
              <p className="stat-number">${stats.totalEarnings.toFixed(2)}</p>
            </div>
          </div>
        )}

        <div style={{ marginTop: '2rem' }}>
          <h2>Available Orders</h2>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Restaurant</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {availableOrders.map((order) => (
                  <tr key={order._id}>
                    <td>{order._id.slice(-6)}</td>
                    <td>{order.restaurant?.name}</td>
                    <td>{order.user?.name}</td>
                    <td>${order.totalAmount.toFixed(2)}</td>
                    <td>
                      <button
                        onClick={() => acceptOrder(order._id)}
                        className="btn-primary"
                        disabled={!isAvailable}
                      >
                        Accept
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <h2>My Orders</h2>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Restaurant</th>
                  <th>Customer</th>
                  <th>Address</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {myOrders.map((order) => (
                  <tr key={order._id}>
                    <td>{order._id.slice(-6)}</td>
                    <td>{order.restaurant?.name}</td>
                    <td>{order.user?.name}</td>
                    <td>
                      {order.deliveryAddress.street}, {order.deliveryAddress.city}
                    </td>
                    <td>
                      <span className="status-badge">{order.status.replace('_', ' ').toUpperCase()}</span>
                    </td>
                    <td>
                      {order.status === 'out_for_delivery' && (
                        <button
                          onClick={() => deliverOrder(order._id)}
                          className="btn-primary"
                        >
                          Mark Delivered
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryDashboard;

