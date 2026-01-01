import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { CartContext } from '../context/CartContext';
import './Cart.css';

const Cart = () => {
  const { cart, cartLoading, updateCartItem, removeFromCart } = useContext(CartContext);
  const navigate = useNavigate();

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      const result = await removeFromCart(itemId);
      if (result.success) {
        toast.success('Item removed from cart');
      }
    } else {
      await updateCartItem(itemId, newQuantity);
    }
  };

  const handleRemove = async (itemId) => {
    const result = await removeFromCart(itemId);
    if (result.success) {
      toast.success('Item removed from cart');
    }
  };

  if (cartLoading) {
    return <div className="loading">Loading cart...</div>;
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <h1>Your Cart</h1>
          <div className="empty-cart">
            <p>Your cart is empty</p>
            <Link to="/foods" className="shop-button">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <h1>Your Cart</h1>

        <div className="cart-content">
          <div className="cart-items">
            {cart.items.map((item) => (
              <div key={item._id} className="cart-item">
                <div className="item-image">
                  {item.food?.image ? (
                    <img src={item.food.image} alt={item.food.name} />
                  ) : (
                    <div className="item-placeholder">🍽️</div>
                  )}
                </div>

                <div className="item-details">
                  <h3>{item.food?.name}</h3>
                  <p className="item-price">₹{item.price} each</p>
                </div>

                <div className="item-quantity">
                  <button
                    onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                    className="quantity-btn"
                  >
                    -
                  </button>
                  <span className="quantity">{item.quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                    className="quantity-btn"
                  >
                    +
                  </button>
                </div>

                <div className="item-total">
                  <strong>₹{(item.price * item.quantity).toFixed(2)}</strong>
                </div>

                <button
                  onClick={() => handleRemove(item._id)}
                  className="remove-btn"
                  title="Remove item"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h2>Order Summary</h2>
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>₹{cart.total?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="summary-row">
              <span>Delivery:</span>
              <span>Free</span>
            </div>
            <div className="summary-row total">
              <span>Total:</span>
              <span>₹{cart.total?.toFixed(2) || '0.00'}</span>
            </div>
            <Link to="/checkout" className="checkout-button">
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

