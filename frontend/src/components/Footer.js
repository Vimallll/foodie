import React from 'react';
import { Link } from 'react-router-dom';
import { FacebookIcon, InstagramIcon, TwitterIcon, LinkedInIcon } from './SocialIcons';
import { AppStoreIcon, GooglePlayIcon } from './AppStoreIcons';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          {/* Brand Section */}
          <div className="footer-section">
            <div className="footer-brand">
              <Link to="/" className="footer-logo">
                <span className="footer-logo-icon">🍔</span>
                <span className="footer-logo-text">Foodie</span>
              </Link>
              <p className="footer-description">
                Order delicious food from your favorite restaurants and get it delivered fresh to your doorstep.
              </p>
              <div className="footer-social">
                <a 
                  href="https://facebook.com/foodieapp" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="social-link" 
                  aria-label="Facebook"
                >
                  <FacebookIcon />
                </a>
                <a 
                  href="https://instagram.com/foodieapp" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="social-link" 
                  aria-label="Instagram"
                >
                  <InstagramIcon />
                </a>
                <a 
                  href="https://twitter.com/foodieapp" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="social-link" 
                  aria-label="Twitter"
                >
                  <TwitterIcon />
                </a>
                <a 
                  href="https://linkedin.com/company/foodieapp" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="social-link" 
                  aria-label="LinkedIn"
                >
                  <LinkedInIcon />
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li>
                <Link to="/foods">Browse Foods</Link>
              </li>
              <li>
                <Link to="/orders">My Orders</Link>
              </li>
              <li>
                <Link to="/profile">My Profile</Link>
              </li>
              <li>
                <Link to="/cart">My Cart</Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="footer-section">
            <h4 className="footer-heading">Company</h4>
            <ul className="footer-links">
              <li>
                <Link to="/about">About Us</Link>
              </li>
              <li>
                <Link to="/contact">Contact Us</Link>
              </li>
              <li>
                <Link to="/careers">Careers</Link>
              </li>
              <li>
                <Link to="/blog">Blog</Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="footer-section">
            <h4 className="footer-heading">Legal</h4>
            <ul className="footer-links">
              <li>
                <Link to="/terms">Terms & Conditions</Link>
              </li>
              <li>
                <Link to="/privacy">Privacy Policy</Link>
              </li>
              <li>
                <Link to="/refund">Refund Policy</Link>
              </li>
              <li>
                <Link to="/faq">FAQ</Link>
              </li>
            </ul>
          </div>

          {/* Download App */}
          <div className="footer-section">
            <h4 className="footer-heading">Download App</h4>
            <p className="footer-app-text">Get the app for the best experience</p>
            <div className="footer-app-buttons">
              <a 
                href="https://apps.apple.com/app/foodie" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="app-button app-store-button" 
                aria-label="Download on App Store"
              >
                <div className="app-icon-wrapper">
                  <AppStoreIcon />
                </div>
                <div className="app-text">
                  <span className="app-label">Download on the</span>
                  <span className="app-store">App Store</span>
                </div>
              </a>
              <a 
                href="https://play.google.com/store/apps/details?id=com.foodie" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="app-button google-play-button" 
                aria-label="Get it on Google Play"
              >
                <div className="app-icon-wrapper">
                  <GooglePlayIcon />
                </div>
                <div className="app-text">
                  <span className="app-label">GET IT ON</span>
                  <span className="app-store">Google Play</span>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="footer-copyright">
            <p>&copy; {currentYear} Foodie. All rights reserved.</p>
          </div>
          <div className="footer-payment">
            <span className="payment-text">We Accept:</span>
            <div className="payment-icons">
              <span className="payment-icon" title="Visa">💳</span>
              <span className="payment-icon" title="Mastercard">💳</span>
              <span className="payment-icon" title="UPI">📱</span>
              <span className="payment-icon" title="Cash">💵</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

