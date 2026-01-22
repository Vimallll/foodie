import React from 'react';
import { Link } from 'react-router-dom';
import './LegalPages.css';

const RefundPolicy = () => {
  return (
    <div className="legal-page">
      <div className="container">
        <div className="legal-content">
          <h1>Refund Policy</h1>
          <p className="last-updated">Last Updated: {new Date().toLocaleDateString()}</p>

          <section>
            <h2>1. Overview</h2>
            <p>
              At Foodie, we strive to provide the best food delivery experience. This Refund Policy outlines the circumstances under which refunds will be processed and the procedure to request a refund.
            </p>
          </section>

          <section>
            <h2>2. Refund Eligibility</h2>
            <h3>2.1 Full Refund</h3>
            <p>You are eligible for a full refund in the following cases:</p>
            <ul>
              <li>Order cancelled before restaurant acceptance</li>
              <li>Restaurant rejected your order</li>
              <li>Restaurant unable to fulfill order</li>
              <li>Wrong items delivered (significant difference)</li>
              <li>Order not delivered within promised time (+30 minutes)</li>
              <li>Food quality issues (spoiled, contaminated, or unsafe food)</li>
              <li>Technical errors causing duplicate charges</li>
            </ul>

            <h3>2.2 Partial Refund</h3>
            <p>Partial refunds may be issued for:</p>
            <ul>
              <li>Minor item discrepancies</li>
              <li>Late delivery (less than 30 minutes)</li>
              <li>Missing items (minor)</li>
              <li>Packaging issues that don't affect food quality</li>
            </ul>

            <h3>2.3 No Refund</h3>
            <p>Refunds will not be issued for:</p>
            <ul>
              <li>Change of mind after order is prepared</li>
              <li>Not being available at delivery address</li>
              <li>Providing incorrect delivery address</li>
              <li>Not liking the taste of food (subjective preference)</li>
              <li>Order placed more than 48 hours ago</li>
            </ul>
          </section>

          <section>
            <h2>3. Refund Process</h2>
            <h3>Step 1: Request Refund</h3>
            <ul>
              <li>Log into your Foodie account</li>
              <li>Go to "My Orders" section</li>
              <li>Select the order you want refunded</li>
              <li>Click "Request Refund"</li>
              <li>Select reason and provide details</li>
            </ul>

            <h3>Step 2: Review Process</h3>
            <ul>
              <li>Our team reviews your request within 24 hours</li>
              <li>We may contact you or the restaurant for clarification</li>
              <li>Photos may be requested for quality issues</li>
            </ul>

            <h3>Step 3: Refund Approval</h3>
            <ul>
              <li>If approved, refund is processed immediately</li>
              <li>You receive confirmation email</li>
              <li>Refund credited to original payment method</li>
            </ul>
          </section>

          <section>
            <h2>4. Refund Timeline</h2>
            <ul>
              <li><strong>Review Time:</strong> 24-48 hours</li>
              <li><strong>Processing Time:</strong> 3-5 business days</li>
              <li><strong>Credit Card/Debit Card:</strong> 5-7 business days</li>
              <li><strong>UPI:</strong> 2-3 business days</li>
              <li><strong>Wallet:</strong> Instant to 24 hours</li>
              <li><strong>Cash on Delivery:</strong> Refunded to Foodie wallet</li>
            </ul>
          </section>

          <section>
            <h2>5. Cancellation Refunds</h2>
            <h3>5.1 Customer Cancellation</h3>
            <ul>
              <li><strong>Before Restaurant Acceptance:</strong> 100% refund</li>
              <li><strong>After Acceptance, Before Preparation:</strong> 80% refund</li>
              <li><strong>During Preparation:</strong> 50% refund (restaurant dependent)</li>
              <li><strong>After Preparation:</strong> No refund</li>
            </ul>

            <h3>5.2 Restaurant Cancellation</h3>
            <p>If restaurant cancels your order, you receive 100% refund automatically.</p>
          </section>

          <section>
            <h2>6. Food Quality Issues</h2>
            <p>For food quality complaints:</p>
            <ul>
              <li>Contact us immediately (within 1 hour of delivery)</li>
              <li>Take photos of the issue</li>
              <li>Do not consume if food appears unsafe</li>
              <li>We will investigate and provide appropriate resolution</li>
            </ul>
          </section>

          <section>
            <h2>7. Delivery Issues</h2>
            <h3>7.1 Late Delivery</h3>
            <ul>
              <li>If delivery is 30+ minutes late: Full refund or 50% discount on next order</li>
              <li>If delivery is 15-30 minutes late: 25% discount coupon</li>
            </ul>

            <h3>7.2 Wrong Address</h3>
            <p>If you provided wrong address, you can:</p>
            <ul>
              <li>Update address (if order not picked up): No charge</li>
              <li>Cancel and reorder: Refund processed</li>
            </ul>
          </section>

          <section>
            <h2>8. Payment Method Refunds</h2>
            <ul>
              <li><strong>Credit/Debit Card:</strong> Refunded to same card</li>
              <li><strong>UPI:</strong> Refunded to same UPI ID</li>
              <li><strong>Wallet:</strong> Refunded to wallet balance</li>
              <li><strong>Cash on Delivery:</strong> Refunded to Foodie wallet or bank account (your choice)</li>
            </ul>
          </section>

          <section>
            <h2>9. Disputes</h2>
            <p>
              If you are not satisfied with our refund decision, you can:
            </p>
            <ul>
              <li>Contact our customer support for escalation</li>
              <li>Provide additional evidence or documentation</li>
              <li>Request review by senior team member</li>
            </ul>
          </section>

          <section>
            <h2>10. Contact for Refunds</h2>
            <p>
              For refund-related queries, contact us:
              <br />
              Email: refunds@foodie.com
              <br />
              Phone: +91-1800-123-4567
              <br />
              In-App: Go to Order Details → Request Refund
              <br />
              Response Time: Within 24 hours
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

export default RefundPolicy;

