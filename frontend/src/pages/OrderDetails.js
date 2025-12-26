import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './OrderDetails.css';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await api.get(`/orders/${id}`);
      setOrder(response.data.order);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#ffa500';
      case 'preparing':
        return '#2196f3';
      case 'delivered':
        return '#4caf50';
      case 'cancelled':
        return '#f44336';
      default:
        return '#666';
    }
  };

  if (loading) {
    return <div className="loading">Loading order details...</div>;
  }

  if (!order) {
    return (
      <div className="order-details-page">
        <div className="container">
          <p>Order not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="order-details-page">
      <div className="container">
        <button onClick={() => navigate(-1)} className="back-button">
          ← Back to Orders
        </button>

        <div className="order-details">
          <div className="order-header-section">
            <h1>Order Details</h1>
            <div
              className="order-status-badge"
              style={{ backgroundColor: getStatusColor(order.status) }}
            >
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </div>
          </div>

          <div className="order-info-grid">
            <div className="order-items-section">
              <h2>Order Items</h2>
              <div className="order-items-list">
                {order.items.map((item, index) => (
                  <div key={index} className="order-item-detail">
                    <div className="item-info">
                      <h4>{item.name}</h4>
                      <p>Quantity: {item.quantity}</p>
                    </div>
                    <div className="item-price">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="order-summary-section">
              <h2>Order Summary</h2>
              <div className="summary-info">
                <div className="info-row">
                  <span>Order ID:</span>
                  <span>#{order._id.slice(-6).toUpperCase()}</span>
                </div>
                <div className="info-row">
                  <span>Order Date:</span>
                  <span>{new Date(order.createdAt).toLocaleString()}</span>
                </div>
                <div className="info-row">
                  <span>Payment Method:</span>
                  <span>{order.paymentMethod}</span>
                </div>
                <div className="info-row">
                  <span>Payment Status:</span>
                  <span>{order.paymentStatus}</span>
                </div>
                <div className="info-row">
                  <span>Subtotal:</span>
                  <span>${order.totalAmount.toFixed(2)}</span>
                </div>
                <div className="info-row">
                  <span>Delivery:</span>
                  <span>Free</span>
                </div>
                <div className="info-row total">
                  <span>Total:</span>
                  <span>${order.totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="delivery-address">
                <h3>Delivery Address</h3>
                <p>
                  {order.deliveryAddress.street}
                  <br />
                  {order.deliveryAddress.city}, {order.deliveryAddress.state}{' '}
                  {order.deliveryAddress.zipCode}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;

