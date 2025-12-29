import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import '../admin/Admin.css';

const RestaurantAdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/restaurant-admin/orders');
      setOrders(response.data.orders);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, status) => {
    try {
      await api.put(`/restaurant-admin/orders/${orderId}/status`, { status });
      toast.success('Order status updated');
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#ff9800';
      case 'preparing':
        return '#2196f3';
      case 'ready':
        return '#4caf50';
      case 'out_for_delivery':
        return '#9c27b0';
      case 'delivered':
        return '#8bc34a';
      case 'cancelled':
        return '#f44336';
      default:
        return '#666';
    }
  };

  if (loading) {
    return <div className="loading">Loading orders...</div>;
  }

  return (
    <div className="admin-page">
      <div className="container">
        <h1>Restaurant Orders</h1>
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Delivery Person</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>{order._id.slice(-6)}</td>
                  <td>
                    <div>{order.user?.name}</div>
                    <small>{order.user?.email}</small>
                  </td>
                  <td>
                    {order.items.map((item, idx) => (
                      <div key={idx}>
                        {item.name} x{item.quantity}
                      </div>
                    ))}
                  </td>
                  <td>${order.totalAmount.toFixed(2)}</td>
                  <td>
                    <span
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {order.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td>
                    {order.deliveryPerson ? order.deliveryPerson.name : 'Not assigned'}
                  </td>
                  <td>
                    {order.status === 'pending' && (
                      <button
                        onClick={() => updateStatus(order._id, 'preparing')}
                        className="btn-primary"
                      >
                        Start Preparing
                      </button>
                    )}
                    {order.status === 'preparing' && (
                      <button
                        onClick={() => updateStatus(order._id, 'ready')}
                        className="btn-primary"
                      >
                        Mark Ready
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
  );
};

export default RestaurantAdminOrders;

