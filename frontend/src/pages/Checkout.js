import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import LocationPicker from '../components/LocationPicker';
import './Checkout.css';

const Checkout = () => {
  const { cart, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    street: user?.address?.street || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    zipCode: user?.address?.zipCode || '',
    latitude: user?.address?.latitude || null,
    longitude: user?.address?.longitude || null,
    paymentMethod: 'cash',
  });

  useEffect(() => {
    if (user?.address) {
      setFormData(prev => ({
        ...prev,
        street: user.address.street || prev.street,
        city: user.address.city || prev.city,
        state: user.address.state || prev.state,
        zipCode: user.address.zipCode || prev.zipCode,
        latitude: user.address.latitude || prev.latitude,
        longitude: user.address.longitude || prev.longitude,
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.street || !formData.city || !formData.state || !formData.zipCode) {
      toast.error('Please fill in all address fields');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/orders', {
        deliveryAddress: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          latitude: formData.latitude,
          longitude: formData.longitude,
        },
        paymentMethod: formData.paymentMethod,
      });

      toast.success('Order placed successfully!');
      await clearCart();
      navigate(`/orders/${response.data.order._id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="checkout-page">
        <div className="container">
          <h1>Checkout</h1>
          <div className="empty-cart">
            <p>Your cart is empty</p>
            <button onClick={() => navigate('/foods')} className="shop-button">
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <h1>Checkout</h1>

        <div className="checkout-content">
          <div className="checkout-form-section">
            <h2>Delivery Address</h2>
            <form onSubmit={handleSubmit}>
              {/* Google Maps Location Picker */}
              <LocationPicker
                onLocationSelect={(locationData) => {
                  setFormData({
                    ...formData,
                    street: locationData.street || formData.street,
                    city: locationData.city || formData.city,
                    state: locationData.state || formData.state,
                    zipCode: locationData.zipCode || formData.zipCode,
                    latitude: locationData.latitude,
                    longitude: locationData.longitude,
                  });
                }}
                initialLocation={
                  formData.latitude && formData.longitude
                    ? { latitude: formData.latitude, longitude: formData.longitude }
                    : null
                }
                height="350px"
                label="📍 Select Your Delivery Location on Map"
              />

              <div className="form-group">
                <label>Street Address</label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  placeholder="Or enter manually"
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Or enter manually"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="Or enter manually"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Zip Code</label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  placeholder="Or enter manually"
                  required
                />
              </div>

              <h2>Payment Method</h2>
              <div className="payment-methods">
                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={formData.paymentMethod === 'cash'}
                    onChange={handleChange}
                  />
                  <span>Cash on Delivery</span>
                </label>
                <label className="payment-option">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={formData.paymentMethod === 'card'}
                    onChange={handleChange}
                  />
                  <span>Card Payment</span>
                </label>
              </div>

              <button type="submit" className="place-order-button" disabled={loading}>
                {loading ? 'Placing Order...' : `Place Order - $${cart.total?.toFixed(2)}`}
              </button>
            </form>
          </div>

          <div className="order-summary">
            <h2>Order Summary</h2>
            <div className="order-items">
              {cart.items.map((item) => (
                <div key={item._id} className="order-item">
                  <div className="item-info">
                    <h4>{item.food?.name}</h4>
                    <p>Qty: {item.quantity} × ${item.price}</p>
                  </div>
                  <div className="item-total">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
            <div className="order-total">
              <div className="total-row">
                <span>Subtotal:</span>
                <span>${cart.total?.toFixed(2)}</span>
              </div>
              <div className="total-row">
                <span>Delivery:</span>
                <span>Free</span>
              </div>
              <div className="total-row final">
                <span>Total:</span>
                <span>${cart.total?.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

