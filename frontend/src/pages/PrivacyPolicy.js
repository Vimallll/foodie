import React from 'react';
import { Link } from 'react-router-dom';
import './LegalPages.css';

const PrivacyPolicy = () => {
  return (
    <div className="legal-page">
      <div className="container">
        <div className="legal-content">
          <h1>Privacy Policy</h1>
          <p className="last-updated">Last Updated: {new Date().toLocaleDateString()}</p>

          <section>
            <h2>1. Introduction</h2>
            <p>
              At Foodie, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our food delivery platform.
            </p>
          </section>

          <section>
            <h2>2. Information We Collect</h2>
            <h3>2.1 Personal Information</h3>
            <ul>
              <li>Name, email address, phone number</li>
              <li>Delivery addresses</li>
              <li>Payment information (processed securely through third-party processors)</li>
              <li>Profile photo (optional)</li>
            </ul>

            <h3>2.2 Usage Information</h3>
            <ul>
              <li>Order history and preferences</li>
              <li>Device information (IP address, browser type, device type)</li>
              <li>Location data (with your permission, for delivery services)</li>
              <li>Cookies and tracking technologies</li>
            </ul>
          </section>

          <section>
            <h2>3. How We Use Your Information</h2>
            <p>We use collected information to:</p>
            <ul>
              <li>Process and deliver your orders</li>
              <li>Communicate with you about orders and promotions</li>
              <li>Improve our services and user experience</li>
              <li>Send marketing communications (with your consent)</li>
              <li>Detect and prevent fraud</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2>4. Information Sharing</h2>
            <p>We may share your information with:</p>
            <ul>
              <li><strong>Restaurants:</strong> Order details to fulfill your orders</li>
              <li><strong>Delivery Partners:</strong> Delivery address and contact information</li>
              <li><strong>Payment Processors:</strong> To process payments securely</li>
              <li><strong>Service Providers:</strong> Third-party services that help us operate our platform</li>
              <li><strong>Legal Authorities:</strong> When required by law or to protect our rights</li>
            </ul>
          </section>

          <section>
            <h2>5. Data Security</h2>
            <p>
              We implement industry-standard security measures to protect your information, including:
            </p>
            <ul>
              <li>SSL encryption for data transmission</li>
              <li>Secure storage of personal information</li>
              <li>Regular security audits and updates</li>
              <li>Access controls and authentication</li>
            </ul>
            <p>
              However, no method of transmission over the Internet is 100% secure. While we strive to protect your data, we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2>6. Cookies and Tracking</h2>
            <p>
              We use cookies and similar tracking technologies to:
            </p>
            <ul>
              <li>Remember your preferences</li>
              <li>Analyze website traffic</li>
              <li>Personalize your experience</li>
              <li>Show relevant advertisements</li>
            </ul>
            <p>You can control cookies through your browser settings.</p>
          </section>

          <section>
            <h2>7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your account</li>
              <li>Opt-out of marketing communications</li>
              <li>Withdraw consent for data processing</li>
              <li>Data portability</li>
            </ul>
          </section>

          <section>
            <h2>8. Data Retention</h2>
            <p>
              We retain your personal information for as long as necessary to provide our services and comply with legal obligations. When you delete your account, we will delete or anonymize your data within 30 days, except where we are required to retain it by law.
            </p>
          </section>

          <section>
            <h2>9. Third-Party Links</h2>
            <p>
              Our platform may contain links to third-party websites. We are not responsible for the privacy practices of these external sites. We encourage you to review their privacy policies.
            </p>
          </section>

          <section>
            <h2>10. Children's Privacy</h2>
            <p>
              Our Service is not intended for users under 18 years of age. We do not knowingly collect personal information from children. If we become aware that we have collected information from a child, we will delete it immediately.
            </p>
          </section>

          <section>
            <h2>11. Changes to Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of significant changes via email or through our platform. Your continued use after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2>12. Contact Us</h2>
            <p>
              For privacy-related questions or concerns, please contact us:
              <br />
              Email: privacy@foodie.com
              <br />
              Phone: +91-1800-123-4567
              <br />
              Address: Foodie Privacy Team, 123 Food Street, Mumbai, Maharashtra 400001
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

export default PrivacyPolicy;

