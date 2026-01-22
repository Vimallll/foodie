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
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error(error.response?.data?.message || 'Error fetching orders');
    } finally {
      setLoading(false);
    }
  };

  const acceptOrder = async (orderId) => {
    try {
      await api.post(`/restaurant-admin/orders/${orderId}/accept`);
      toast.success('Order accepted successfully');
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error accepting order');
    }
  };

  const rejectOrder = async (orderId) => {
    const reason = window.prompt('Enter rejection reason (optional):');
    try {
      await api.post(`/restaurant-admin/orders/${orderId}/reject`, { reason: reason || '' });
      toast.success('Order rejected');
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error rejecting order');
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
      case 'PLACED':
        return '#ff9800';
      case 'ACCEPTED':
        return '#2196f3';
      case 'PREPARING':
        return '#2196f3';
      case 'READY_FOR_PICKUP':
        return '#4caf50';
      case 'OUT_FOR_DELIVERY':
        return '#9c27b0';
      case 'DELIVERED':
        return '#8bc34a';
      case 'REJECTED':
      case 'CANCELLED':
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
        {orders.length === 0 ? (
          <div className="no-orders">
            <p>No orders found</p>
          </div>
        ) : (
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
                    <td>#{order._id.toString().slice(-6)}</td>
                    <td>
                      <div>{order.user?.name}</div>
                      <small>{order.user?.email}</small>
                    </td>
                    <td>
                      {order.items?.map((item, idx) => (
                        <div key={idx}>
                          {item.food?.name || item.name} x{item.quantity}
                        </div>
                      ))}
                    </td>
                    <td>₹{order.totalAmount?.toFixed(2) || '0.00'}</td>
                    <td>
                      <span
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(order.status) }}
                      >
                        {order.status?.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>
                      {order.deliveryPerson ? order.deliveryPerson.name : 'Not assigned'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {order.status === 'PLACED' && (
                          <>
                            <button
                              onClick={() => acceptOrder(order._id)}
                              className="btn-primary"
                              style={{ backgroundColor: '#4caf50' }}
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => rejectOrder(order._id)}
                              className="btn-primary"
                              style={{ backgroundColor: '#f44336' }}
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {(order.status === 'PREPARING' || order.status?.toUpperCase() === 'PREPARING') && (
                          <button
                            onClick={() => updateStatus(order._id, 'READY_FOR_PICKUP')}
                            className="btn-primary"
                          >
                            Mark Ready
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantAdminOrders;
