import React from 'react';
import { Link } from 'react-router-dom';
import './AboutUs.css';

const AboutUs = () => {
  return (
    <div className="about-page">
      <div className="about-hero">
        <div className="container">
          <h1>About Foodie</h1>
          <p className="hero-subtitle">Delivering happiness, one meal at a time</p>
        </div>
      </div>

      <div className="container">
        <section className="about-section">
          <h2>Our Story</h2>
          <p>
            Founded in 2020, Foodie started with a simple mission: to make great food accessible to everyone, everywhere. 
            What began as a small local delivery service has grown into a trusted platform connecting thousands of customers 
            with their favorite restaurants across multiple cities.
          </p>
          <p>
            We believe that food brings people together and that everyone deserves access to delicious, quality meals. 
            Whether you're craving comfort food at midnight or planning a special dinner, Foodie is here to make it happen.
          </p>
        </section>

        <section className="about-section">
          <h2>Our Mission</h2>
          <p>
            To revolutionize food delivery by providing a seamless, fast, and reliable service that connects customers 
            with the best local restaurants, while supporting restaurant partners and creating employment opportunities 
            for delivery partners across the country.
          </p>
        </section>

        <section className="about-section">
          <h2>Our Values</h2>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">🚀</div>
              <h3>Innovation</h3>
              <p>Continuously improving our technology to provide the best user experience</p>
            </div>
            <div className="value-card">
              <div className="value-icon">❤️</div>
              <h3>Customer First</h3>
              <p>Your satisfaction is our top priority in everything we do</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🤝</div>
              <h3>Partnership</h3>
              <p>Building strong relationships with restaurants and delivery partners</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🌱</div>
              <h3>Sustainability</h3>
              <p>Committed to eco-friendly packaging and reducing our environmental impact</p>
            </div>
            <div className="value-card">
              <div className="value-icon">✨</div>
              <h3>Quality</h3>
              <p>Ensuring only the best food and service standards</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🎯</div>
              <h3>Reliability</h3>
              <p>Dependable service you can count on, every single time</p>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>What We Offer</h2>
          <div className="features-grid">
            <div className="feature-item">
              <h3>🍕 Wide Selection</h3>
              <p>Choose from hundreds of restaurants and thousands of dishes</p>
            </div>
            <div className="feature-item">
              <h3>⚡ Fast Delivery</h3>
              <p>Average delivery time of 30-45 minutes</p>
            </div>
            <div className="feature-item">
              <h3>🔒 Secure Payments</h3>
              <p>Multiple secure payment options including COD</p>
            </div>
            <div className="feature-item">
              <h3>📱 Easy Ordering</h3>
              <p>Simple, intuitive interface for seamless ordering</p>
            </div>
            <div className="feature-item">
              <h3>🎁 Great Deals</h3>
              <p>Regular promotions, discounts, and loyalty rewards</p>
            </div>
            <div className="feature-item">
              <h3>🛡️ Quality Assurance</h3>
              <p>Rigorous restaurant vetting and food safety standards</p>
            </div>
          </div>
        </section>

        <section className="about-section stats-section">
          <h2>Our Impact</h2>
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">100+</div>
              <div className="stat-label">Restaurant Partners</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">50,000+</div>
              <div className="stat-label">Happy Customers</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">500+</div>
              <div className="stat-label">Delivery Partners</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">5+</div>
              <div className="stat-label">Cities</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">1M+</div>
              <div className="stat-label">Orders Delivered</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">4.8★</div>
              <div className="stat-label">Average Rating</div>
            </div>
          </div>
        </section>

        <section className="about-section">
          <h2>Join Our Journey</h2>
          <p>
            We're always looking for passionate individuals to join our team. Whether you're interested in technology, 
            operations, marketing, or customer service, we'd love to hear from you.
          </p>
          <div className="cta-buttons">
            <Link to="/careers" className="btn-primary">View Careers</Link>
            <Link to="/contact" className="btn-secondary">Get in Touch</Link>
          </div>
        </section>

        <div className="back-home">
          <Link to="/" className="btn-primary">Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;

