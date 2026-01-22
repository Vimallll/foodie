import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import './ContactUs.css';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    category: 'general',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate form submission (replace with actual API call)
    setTimeout(() => {
      toast.success('Thank you for contacting us! We will get back to you within 24 hours.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        category: 'general',
      });
      setLoading(false);
    }, 1000);
  };

  const contactMethods = [
    {
      icon: '📧',
      title: 'Email',
      info: 'support@foodie.com',
      description: 'Send us an email anytime!',
      link: 'mailto:support@foodie.com',
    },
    {
      icon: '📞',
      title: 'Phone',
      info: '+91-1800-123-4567',
      description: 'Mon-Sat, 9AM-9PM IST',
      link: 'tel:+9118001234567',
    },
    {
      icon: '💬',
      title: 'Live Chat',
      info: 'Available 24/7',
      description: 'Chat with our support team',
      link: '#',
    },
    {
      icon: '📍',
      title: 'Address',
      info: '123 Food Street, Mumbai',
      description: 'Maharashtra 400001, India',
      link: '#',
    },
  ];

  return (
    <div className="contact-page">
      <div className="contact-hero">
        <div className="container">
          <h1>Contact Us</h1>
          <p className="hero-subtitle">We're here to help! Get in touch with us</p>
        </div>
      </div>

      <div className="container">
        <div className="contact-content">
          <div className="contact-methods">
            <h2>Get in Touch</h2>
            <p className="contact-intro">
              Have a question, feedback, or need assistance? Choose the best way to reach us.
            </p>

            <div className="contact-cards">
              {contactMethods.map((method, index) => (
                <div key={index} className="contact-card">
                  <div className="contact-icon">{method.icon}</div>
                  <h3>{method.title}</h3>
                  <p className="contact-info">{method.info}</p>
                  <p className="contact-desc">{method.description}</p>
                  {method.link !== '#' && (
                    <a href={method.link} className="contact-link">
                      {method.title === 'Email' ? 'Send Email' : method.title === 'Phone' ? 'Call Now' : 'Visit'}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="contact-form-section">
            <h2>Send us a Message</h2>
            <form onSubmit={handleSubmit} className="contact-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Your full name"
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91-9876543210"
                  />
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="general">General Inquiry</option>
                    <option value="order">Order Related</option>
                    <option value="refund">Refund/Return</option>
                    <option value="technical">Technical Issue</option>
                    <option value="partnership">Restaurant Partnership</option>
                    <option value="delivery">Delivery Partner</option>
                    <option value="feedback">Feedback</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Subject *</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  placeholder="Brief subject line"
                />
              </div>

              <div className="form-group">
                <label>Message *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows="6"
                  placeholder="Tell us more about your inquiry..."
                ></textarea>
              </div>

              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>

        <section className="faq-section">
          <h2>Quick Links</h2>
          <div className="quick-links">
            <Link to="/faq" className="quick-link-item">
              <span className="quick-link-icon">❓</span>
              <div>
                <h4>FAQ</h4>
                <p>Find answers to common questions</p>
              </div>
            </Link>
            <Link to="/refund" className="quick-link-item">
              <span className="quick-link-icon">💰</span>
              <div>
                <h4>Refund Policy</h4>
                <p>Learn about our refund process</p>
              </div>
            </Link>
            <Link to="/terms" className="quick-link-item">
              <span className="quick-link-icon">📋</span>
              <div>
                <h4>Terms & Conditions</h4>
                <p>Read our terms of service</p>
              </div>
            </Link>
          </div>
        </section>

        <div className="back-home">
          <Link to="/" className="btn-primary">Back to Home</Link>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;

