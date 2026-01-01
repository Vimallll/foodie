import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const { getCartItemCount } = useContext(CartContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        !event.target.closest('.hamburger-menu')
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isDropdownOpen || isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen, isMobileMenuOpen]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsDropdownOpen(false);
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          Foodie
        </Link>

        {/* Desktop Menu */}
        <div 
          ref={mobileMenuRef}
          className={`navbar-menu ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}
        >
          <Link 
            to="/foods" 
            className={`navbar-link ${isActive('/foods') ? 'active' : ''}`}
          >
            Foods
          </Link>

          {isAuthenticated ? (
            <>
              <Link 
                to="/cart" 
                className={`navbar-link cart-link ${isActive('/cart') ? 'active' : ''}`}
              >
                <span className="cart-icon">🛒</span>
                {getCartItemCount() > 0 && (
                  <span className="cart-badge">{getCartItemCount()}</span>
                )}
              </Link>

              {/* User Avatar Dropdown */}
              <div className="user-dropdown" ref={dropdownRef}>
                <button
                  className="user-avatar-button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  aria-label="User menu"
                >
                  <div className="user-avatar">
                    {getInitials(user?.name)}
                  </div>
                  <span className="user-name">{user?.name?.split(' ')[0]}</span>
                  <span className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}>▼</span>
                </button>

                {isDropdownOpen && (
                  <div className="dropdown-menu">
                    <div className="dropdown-header">
                      <div className="dropdown-avatar">{getInitials(user?.name)}</div>
                      <div className="dropdown-user-info">
                        <div className="dropdown-user-name">{user?.name}</div>
                        <div className="dropdown-user-email">{user?.email}</div>
                      </div>
                    </div>
                    <div className="dropdown-divider"></div>
                    <Link 
                      to="/profile" 
                      className="dropdown-item"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <span className="dropdown-icon">👤</span>
                      Profile
                    </Link>
                    <Link 
                      to="/orders" 
                      className="dropdown-item"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <span className="dropdown-icon">📦</span>
                      Orders
                    </Link>
                    {user?.role === 'admin' && (
                      <Link 
                        to="/admin/dashboard" 
                        className="dropdown-item"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <span className="dropdown-icon">⚙️</span>
                        Admin Dashboard
                      </Link>
                    )}
                    {user?.role === 'restaurant_admin' && (
                      <Link 
                        to="/restaurant-admin/dashboard" 
                        className="dropdown-item"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <span className="dropdown-icon">🏪</span>
                        Restaurant Dashboard
                      </Link>
                    )}
                    {user?.role === 'delivery' && (
                      <Link 
                        to="/delivery/dashboard" 
                        className="dropdown-item"
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        <span className="dropdown-icon">🚚</span>
                        Delivery Dashboard
                      </Link>
                    )}
                    <div className="dropdown-divider"></div>
                    <button 
                      className="dropdown-item dropdown-item-danger"
                      onClick={handleLogout}
                    >
                      <span className="dropdown-icon">🚪</span>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link 
                to="/login" 
                className={`navbar-link ${isActive('/login') ? 'active' : ''}`}
              >
                Login
              </Link>
              <Link to="/signup" className="navbar-button">
                Sign Up
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Menu */}
        <button
          className="hamburger-menu"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
          <span className={`hamburger-line ${isMobileMenuOpen ? 'open' : ''}`}></span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
