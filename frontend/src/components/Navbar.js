import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const { getCartItemCount } = useContext(CartContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          🍔 Foodie
        </Link>

        <div className="navbar-menu">
          <Link to="/foods" className="navbar-link">
            Foods
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/cart" className="navbar-link cart-link">
                Cart
                {getCartItemCount() > 0 && (
                  <span className="cart-badge">{getCartItemCount()}</span>
                )}
              </Link>
              <Link to="/orders" className="navbar-link">
                Orders
              </Link>
              <Link to="/profile" className="navbar-link">
                Profile
              </Link>
              {user?.role === 'admin' && (
                <Link to="/admin/dashboard" className="navbar-link">
                  Admin
                </Link>
              )}
              {user?.role === 'restaurant_admin' && (
                <Link to="/restaurant-admin/dashboard" className="navbar-link">
                  Restaurant Dashboard
                </Link>
              )}
              {user?.role === 'delivery' && (
                <Link to="/delivery/dashboard" className="navbar-link">
                  Delivery
                </Link>
              )}
              <button onClick={handleLogout} className="navbar-button">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link">
                Login
              </Link>
              <Link to="/signup" className="navbar-button">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
