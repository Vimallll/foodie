import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, completed, cancelled

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!window.confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      await api.put(`/orders/${orderId}/cancel`, { reason: 'Cancelled by user' });
      toast.success('Order cancelled successfully');
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel order');
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toUpperCase()) {
      case 'PLACED':
        return '#FFA500';
      case 'ACCEPTED':
        return '#2196F3';
      case 'PREPARING':
        return '#2196F3';
      case 'READY_FOR_PICKUP':
        return '#9C27B0';
      case 'OUT_FOR_DELIVERY':
      case 'PICKED_UP':
      case 'ON_THE_WAY':
        return '#00BCD4';
      case 'DELIVERED':
        return '#4CAF50';
      case 'CANCELLED':
      case 'REJECTED':
        return '#F44336';
      default:
        return '#666';
    }
  };

  const getStatusLabel = (status) => {
    if (!status) return 'Unknown';
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getStatusIcon = (status) => {
    switch (status?.toUpperCase()) {
      case 'PLACED':
        return '📦';
      case 'ACCEPTED':
      case 'PREPARING':
        return '👨‍🍳';
      case 'READY_FOR_PICKUP':
        return '✅';
      case 'OUT_FOR_DELIVERY':
      case 'PICKED_UP':
      case 'ON_THE_WAY':
        return '🚚';
      case 'DELIVERED':
        return '✓';
      case 'CANCELLED':
      case 'REJECTED':
        return '❌';
      default:
        return '📋';
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'active') {
      return !['DELIVERED', 'CANCELLED', 'REJECTED'].includes(order.status?.toUpperCase());
    }
    if (filter === 'completed') {
      return order.status?.toUpperCase() === 'DELIVERED';
    }
    if (filter === 'cancelled') {
      return ['CANCELLED', 'REJECTED'].includes(order.status?.toUpperCase());
    }
    return true;
  });

  if (loading) {
    return (
      <div className="orders-page">
        <div className="container">
          <div className="loading">Loading your orders...</div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="orders-page">
        <div className="container">
          <h1>My Orders</h1>
          <div className="no-orders">
            <div className="no-orders-icon">📦</div>
            <p>You haven't placed any orders yet</p>
            <Link to="/foods" className="shop-button">
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="container">
        <h1>My Orders</h1>
        <p className="orders-subtitle">View and track all your orders</p>

        {/* Filter Tabs */}
        <div className="order-filters">
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({orders.length})
          </button>
          <button
            className={`filter-tab ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            Active ({orders.filter(o => !['DELIVERED', 'CANCELLED', 'REJECTED'].includes(o.status?.toUpperCase())).length})
          </button>
          <button
            className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed ({orders.filter(o => o.status?.toUpperCase() === 'DELIVERED').length})
          </button>
          <button
            className={`filter-tab ${filter === 'cancelled' ? 'active' : ''}`}
            onClick={() => setFilter('cancelled')}
          >
            Cancelled ({orders.filter(o => ['CANCELLED', 'REJECTED'].includes(o.status?.toUpperCase())).length})
          </button>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="no-orders-filtered">
            <p>No {filter === 'all' ? '' : filter} orders found</p>
          </div>
        ) : (
          <div className="orders-list">
            {filteredOrders.map((order) => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <div className="order-id-section">
                    <div className="order-id">
                      <span className="order-icon">{getStatusIcon(order.status)}</span>
                      <strong>Order #{order._id.slice(-6).toUpperCase()}</strong>
                    </div>
                    {order.restaurant && (
                      <div className="order-restaurant">
                        🏪 {order.restaurant.name}
                      </div>
                    )}
                  </div>
                  <div
                    className="order-status-badge"
                    style={{
                      backgroundColor: getStatusColor(order.status),
                      color: 'white'
                    }}
                  >
                    {getStatusLabel(order.status)}
                  </div>
                </div>

                <div className="order-items-preview">
                  {order.items && order.items.slice(0, 3).map((item, index) => (
                    <span key={index} className="order-item-name">
                      {item.name} {item.quantity > 1 && `(x${item.quantity})`}
                    </span>
                  ))}
                  {order.items && order.items.length > 3 && (
                    <span className="more-items">+{order.items.length - 3} more items</span>
                  )}
                </div>

                <div className="order-footer">
                  <div className="order-info">
                    <div className="order-date">
                      📅 {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    {order.deliveryPerson && (
                      <div className="delivery-info">
                        🚚 {order.deliveryPerson.name || order.deliveryPerson.fullName || 'Delivery Partner'}
                      </div>
                    )}
                  </div>
                  <div className="order-actions">
                    <div className="order-total">
                      Total: <strong>₹{order.totalAmount?.toFixed(2) || '0.00'}</strong>
                    </div>
                    {order.status?.toUpperCase() === 'PLACED' && (
                      <button
                        className="cancel-order-btn"
                        onClick={(e) => handleCancelOrder(order._id, e)}
                      >
                        Cancel Order
                      </button>
                    )}
                    <Link to={`/orders/${order._id}`} className="view-details-btn">
                      View Details →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;

