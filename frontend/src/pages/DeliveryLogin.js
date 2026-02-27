import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import './Auth.css';

const DeliveryLogin = () => {
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const { deliveryLogin } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.identifier) {
      toast.error('Phone number or Email is required');
      setLoading(false);
      return;
    }

    const isEmail = formData.identifier.includes('@');
    const loginData = {
      password: formData.password,
    };

    if (isEmail) {
      loginData.email = formData.identifier;
    } else {
      loginData.phoneNumber = formData.identifier;
    }

    // Use deliveryLogin from context
    try {
      const result = await deliveryLogin(loginData);

      if (result.success) {
        toast.success('Login successful!');
        // Show warning as info if email is not verified (but don't block login)
        if (result.warning) {
          setTimeout(() => {
            toast.info(result.warning, { autoClose: 5000 });
          }, 1000);
        }
        navigate('/delivery/dashboard');
      } else {
        if (result.requiresVerification) {
          toast.error(result.message || 'Verification required');
          if (result.verificationType === 'phone') {
            navigate('/delivery/verify-otp', {
              state: {
                phoneNumber: result.phoneNumber || (isEmail ? '' : formData.identifier),
              },
            });
          }
        } else {
          toast.error(result.message || 'Login failed');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      // Always reset loading state
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon delivery-icon">🚚</div>
          <h2>Delivery Partner Login</h2>
          <p className="auth-subtitle">Sign in to start delivering orders</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="identifier">📱 Phone Number or 📧 Email</label>
            <input
              id="identifier"
              type="text"
              name="identifier"
              value={formData.identifier}
              onChange={handleChange}
              placeholder="Enter phone number or email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">🔒 Password</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? (
              <>
                <span className="button-loader"></span>
                Logging in...
              </>
            ) : (
              'Login as Delivery Partner'
            )}
          </button>
        </form>
        <p className="auth-link">
          Don't have an account? <Link to="/delivery/signup">Sign up as Delivery Partner</Link>
        </p>
        <p className="auth-link" style={{ marginTop: '0.5rem' }}>
          Regular customer? <Link to="/login">Customer Login</Link>
        </p>
      </div>
    </div>
  );
};

export default DeliveryLogin;

