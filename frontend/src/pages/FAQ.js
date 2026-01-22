import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './FAQ.css';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      category: 'Ordering',
      questions: [
        {
          q: 'How do I place an order?',
          a: 'Simply browse restaurants, select your favorite dishes, add them to cart, and proceed to checkout. Enter your delivery address and payment details to complete the order.'
        },
        {
          q: 'Can I modify or cancel my order?',
          a: 'You can cancel your order before the restaurant accepts it for a full refund. After acceptance, cancellation depends on restaurant policies. You cannot modify items after ordering, but you can place a new order.'
        },
        {
          q: 'What payment methods do you accept?',
          a: 'We accept Credit/Debit Cards, UPI (PhonePe, Google Pay, Paytm), Net Banking, Wallets, and Cash on Delivery (COD) in select areas.'
        },
        {
          q: 'Is there a minimum order value?',
          a: 'Minimum order value varies by restaurant, typically ranging from ₹100 to ₹200. This information is displayed on each restaurant\'s page.'
        }
      ]
    },
    {
      category: 'Delivery',
      questions: [
        {
          q: 'How long does delivery take?',
          a: 'Delivery time varies based on restaurant preparation time and distance. Typical delivery times range from 30-45 minutes. Estimated time is shown during checkout.'
        },
        {
          q: 'Can I track my order?',
          a: 'Yes! Once your order is confirmed, you can track it in real-time through the "My Orders" section. You\'ll see order status updates from restaurant acceptance to delivery.'
        },
        {
          q: 'What if I\'m not available when delivery arrives?',
          a: 'Our delivery partner will call you. If you\'re unavailable, they may leave the order with a neighbor, security guard (with your permission), or reschedule. Contact us immediately if you missed delivery.'
        },
        {
          q: 'Do you deliver 24/7?',
          a: 'Delivery hours depend on restaurant operating hours. Most restaurants deliver until midnight. Check restaurant page for specific delivery hours.'
        }
      ]
    },
    {
      category: 'Account & Profile',
      questions: [
        {
          q: 'How do I create an account?',
          a: 'Click "Sign Up" on our website or app, enter your name, email/phone, and password. Verify your phone number/email to complete registration.'
        },
        {
          q: 'I forgot my password. How do I reset it?',
          a: 'Click "Forgot Password" on the login page, enter your registered email/phone, and follow the instructions sent to your email/SMS to reset your password.'
        },
        {
          q: 'How do I update my delivery address?',
          a: 'Go to "My Profile" → "Addresses" → "Add New Address" or edit existing addresses. You can save multiple addresses for quick checkout.'
        },
        {
          q: 'Can I delete my account?',
          a: 'Yes, go to Profile → Settings → Delete Account. Note: This action is permanent and all order history will be deleted.'
        }
      ]
    },
    {
      category: 'Refunds & Cancellations',
      questions: [
        {
          q: 'How do I request a refund?',
          a: 'Go to "My Orders" → Select the order → Click "Request Refund" → Select reason and submit. Our team will review within 24 hours.'
        },
        {
          q: 'How long does it take to receive a refund?',
          a: 'Refunds are processed within 3-5 business days. Credit/Debit card refunds take 5-7 business days, while UPI and wallet refunds are faster (2-3 days).'
        },
        {
          q: 'What if I receive wrong items?',
          a: 'Contact us immediately within 1 hour of delivery. Go to Order Details → Report Issue → Select "Wrong Items". We\'ll arrange replacement or refund.'
        },
        {
          q: 'Can I cancel an order after payment?',
          a: 'Yes, you can cancel before restaurant acceptance for full refund. After acceptance, cancellation depends on restaurant policy and may incur charges.'
        }
      ]
    },
    {
      category: 'Promotions & Offers',
      questions: [
        {
          q: 'How do I apply promo codes?',
          a: 'At checkout, enter your promo code in the "Promo Code" field and click "Apply". Discount will be reflected in the order total.'
        },
        {
          q: 'Where can I find available offers?',
          a: 'Check our homepage banner, restaurant pages, and notification center for current offers and promotions.'
        },
        {
          q: 'Why is my promo code not working?',
          a: 'Promo codes may have expiry dates, minimum order value requirements, or be restaurant-specific. Check code terms and conditions.'
        },
        {
          q: 'Do you have a loyalty program?',
          a: 'Yes! Earn points on every order. Points can be redeemed for discounts on future orders. Check "Rewards" section for details.'
        }
      ]
    },
    {
      category: 'Restaurant Partners',
      questions: [
        {
          q: 'How can my restaurant join Foodie?',
          a: 'Visit our restaurant partner page, fill out the registration form, and our team will contact you within 2-3 business days.'
        },
        {
          q: 'What are the commission rates?',
          a: 'Commission rates vary based on order volume and partnership type. Contact our business team at partners@foodie.com for detailed information.'
        },
        {
          q: 'How do restaurants receive orders?',
          a: 'Restaurants receive orders through our partner app/portal. Orders can be accepted, rejected, or marked as ready for pickup.'
        }
      ]
    },
    {
      category: 'Technical Issues',
      questions: [
        {
          q: 'The app/website is not loading. What should I do?',
          a: 'Check your internet connection, clear browser cache, update the app, or try using a different browser. If problem persists, contact support.'
        },
        {
          q: 'I was charged twice for the same order. What should I do?',
          a: 'Contact support immediately with order details. We\'ll investigate and refund the duplicate charge within 24 hours.'
        },
        {
          q: 'How do I report a bug?',
          a: 'Go to Settings → Help & Support → Report a Bug, or email us at support@foodie.com with details and screenshots.'
        }
      ]
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  let questionIndex = 0;

  return (
    <div className="faq-page">
      <div className="container">
        <div className="faq-header">
          <h1>Frequently Asked Questions</h1>
          <p className="faq-subtitle">Find answers to common questions about Foodie</p>
        </div>

        <div className="faq-content">
          {faqs.map((category, catIndex) => (
            <div key={catIndex} className="faq-category">
              <h2 className="category-title">{category.category}</h2>
              <div className="faq-list">
                {category.questions.map((faq, qIndex) => {
                  const currentIndex = questionIndex++;
                  return (
                    <div key={qIndex} className={`faq-item ${openIndex === currentIndex ? 'open' : ''}`}>
                      <button
                        className="faq-question"
                        onClick={() => toggleFAQ(currentIndex)}
                        aria-expanded={openIndex === currentIndex}
                      >
                        <span>{faq.q}</span>
                        <span className="faq-icon">{openIndex === currentIndex ? '−' : '+'}</span>
                      </button>
                      {openIndex === currentIndex && (
                        <div className="faq-answer">
                          <p>{faq.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="faq-footer">
          <div className="faq-contact-box">
            <h3>Still have questions?</h3>
            <p>Can't find what you're looking for? Our support team is here to help!</p>
            <div className="faq-contact-buttons">
              <Link to="/contact" className="btn-primary">Contact Us</Link>
              <a href="mailto:support@foodie.com" className="btn-secondary">Email Support</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;

