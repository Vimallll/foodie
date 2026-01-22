import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import './Auth.css';

const DeliverySignup = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    vehicleType: 'bike',
    vehicleNumber: '',
    drivingLicenseNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/delivery/auth/register', {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        email: formData.email || undefined,
        password: formData.password,
        vehicleType: formData.vehicleType,
        vehicleNumber: formData.vehicleNumber,
        drivingLicenseNumber: formData.drivingLicenseNumber,
      });

      toast.success('Registration successful! Please verify your account.');
      
      // In development, show OTP if provided
      if (response.data.data?.otp) {
        toast.info(`Your OTP is: ${response.data.data.otp} (Development mode)`, { autoClose: 10000 });
      }
      
      // Navigate to OTP verification with phone number
      navigate('/delivery/verify-otp', {
        state: {
          phoneNumber: formData.phoneNumber,
        },
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '540px' }}>
        <div className="auth-header">
          <div className="auth-icon delivery-icon">🚚</div>
          <h2>Delivery Partner Signup</h2>
          <p className="auth-subtitle">Join our delivery team and start earning</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="fullName">👤 Full Name *</label>
            <input
              id="fullName"
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phoneNumber">📱 Phone Number *</label>
            <input
              id="phoneNumber"
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="Enter your phone number"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">📧 Email (Optional)</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email (optional)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">🔒 Password *</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password (min 6 characters)"
              required
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">🔒 Confirm Password *</label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="vehicleType">🚲 Vehicle Type *</label>
            <select
              id="vehicleType"
              name="vehicleType"
              value={formData.vehicleType}
              onChange={handleChange}
              required
            >
              <option value="bike">🛵 Bike</option>
              <option value="cycle">🚴 Cycle</option>
              <option value="scooter">🛴 Scooter</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="vehicleNumber">🔢 Vehicle Number *</label>
            <input
              id="vehicleNumber"
              type="text"
              name="vehicleNumber"
              value={formData.vehicleNumber}
              onChange={handleChange}
              placeholder="Enter vehicle registration number"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="drivingLicenseNumber">🪪 Driving License Number *</label>
            <input
              id="drivingLicenseNumber"
              type="text"
              name="drivingLicenseNumber"
              value={formData.drivingLicenseNumber}
              onChange={handleChange}
              placeholder="Enter your driving license number"
              required
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? (
              <>
                <span className="button-loader"></span>
                Registering...
              </>
            ) : (
              'Register as Delivery Partner'
            )}
          </button>
        </form>
        <p className="auth-link">
          Already have an account? <Link to="/delivery/login">Login here</Link>
        </p>
      </div>
    </div>
  );
};

export default DeliverySignup;

