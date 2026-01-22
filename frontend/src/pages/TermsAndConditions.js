import React from 'react';
import { Link } from 'react-router-dom';
import './LegalPages.css';

const TermsAndConditions = () => {
  return (
    <div className="legal-page">
      <div className="container">
        <div className="legal-content">
          <h1>Terms & Conditions</h1>
          <p className="last-updated">Last Updated: {new Date().toLocaleDateString()}</p>

          <section>
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing and using the Foodie food delivery platform ("Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h2>2. Service Description</h2>
            <p>
              Foodie is an online food delivery platform that connects customers with restaurants and delivery partners. We facilitate the ordering and delivery of food items from various restaurants to your specified delivery address.
            </p>
          </section>

          <section>
            <h2>3. User Accounts</h2>
            <p>To use our Service, you must:</p>
            <ul>
              <li>Be at least 18 years old or have parental consent</li>
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain and promptly update your account information</li>
              <li>Maintain the security of your password and identification</li>
              <li>Accept responsibility for all activities that occur under your account</li>
            </ul>
          </section>

          <section>
            <h2>4. Orders and Payment</h2>
            <ul>
              <li>All orders are subject to acceptance by the restaurant</li>
              <li>Prices displayed are in INR and include applicable taxes</li>
              <li>We accept various payment methods including credit/debit cards, UPI, and cash on delivery</li>
              <li>Once an order is placed, cancellation is subject to restaurant policies</li>
              <li>Delivery charges apply based on distance and order value</li>
            </ul>
          </section>

          <section>
            <h2>5. Delivery</h2>
            <ul>
              <li>Estimated delivery times are provided by restaurants and are approximate</li>
              <li>We are not responsible for delays caused by external factors (weather, traffic, etc.)</li>
              <li>You must provide accurate delivery address</li>
              <li>If you are unavailable at the delivery address, the order may be rescheduled or cancelled</li>
              <li>Contactless delivery options are available for your safety</li>
            </ul>
          </section>

          <section>
            <h2>6. Cancellation and Refunds</h2>
            <ul>
              <li>Cancellations before restaurant acceptance are fully refundable</li>
              <li>After acceptance, cancellation is subject to restaurant policies</li>
              <li>Refunds are processed within 5-7 business days</li>
              <li>Refund amount will be credited to the original payment method</li>
            </ul>
          </section>

          <section>
            <h2>7. User Conduct</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Use the Service for any illegal purpose</li>
              <li>Violate any laws in your jurisdiction</li>
              <li>Infringe upon the rights of others</li>
              <li>Upload or transmit viruses or any malicious code</li>
              <li>Interfere with or disrupt the Service</li>
            </ul>
          </section>

          <section>
            <h2>8. Limitation of Liability</h2>
            <p>
              Foodie acts as an intermediary between restaurants and customers. We are not responsible for the quality, safety, or legality of food items prepared by restaurants. We are also not liable for any damages arising from the use or inability to use our Service.
            </p>
          </section>

          <section>
            <h2>9. Intellectual Property</h2>
            <p>
              All content on the Foodie platform, including logos, text, graphics, and software, is the property of Foodie and protected by copyright and trademark laws.
            </p>
          </section>

          <section>
            <h2>10. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Your continued use of the Service constitutes acceptance of modified terms.
            </p>
          </section>

          <section>
            <h2>11. Contact Information</h2>
            <p>
              For questions about these Terms & Conditions, please contact us at:
              <br />
              Email: legal@foodie.com
              <br />
              Phone: +91-1800-123-4567
            </p>
          </section>

          <div className="legal-actions">
            <Link to="/" className="btn-primary">Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;

