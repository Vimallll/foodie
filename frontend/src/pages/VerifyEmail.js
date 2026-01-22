import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import './Auth.css';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('Verifying your email...');

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else {
      setStatus('error');
      setMessage('Invalid verification link');
    }
  }, [token]);

  const verifyEmail = async (verificationToken) => {
    try {
      const response = await api.get(`/delivery/auth/verify-email/${verificationToken}`);
      setStatus('success');
      setMessage(response.data.message || 'Email verified successfully!');
      toast.success('Email verified successfully!');
      setTimeout(() => {
        navigate('/delivery/login');
      }, 2000);
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.message || 'Email verification failed');
      toast.error(error.response?.data?.message || 'Email verification failed');
    }
  };

  const handleResendVerification = async () => {
    // Prompt for email
    const email = prompt('Enter your email address:');
    if (!email) return;

    try {
      await api.post('/delivery/auth/resend-email-verification', { email });
      toast.success('Verification email sent! Check your inbox.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend verification email');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '500px' }}>
        <h2>📧 Email Verification</h2>
        
        {status === 'verifying' && (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div className="spinner" style={{ margin: '0 auto' }}></div>
            <p style={{ marginTop: '1rem', color: '#686b78' }}>{message}</p>
          </div>
        )}

        {status === 'success' && (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✅</div>
            <p style={{ color: '#48c479', fontSize: '1.1rem', fontWeight: '600' }}>{message}</p>
            <p style={{ color: '#686b78', marginTop: '1rem' }}>Redirecting to login...</p>
          </div>
        )}

        {status === 'error' && (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>❌</div>
            <p style={{ color: '#E23744', fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem' }}>
              {message}
            </p>
            <button
              onClick={handleResendVerification}
              className="auth-button"
              style={{ marginTop: '1rem', width: 'auto', padding: '0.75rem 2rem' }}
            >
              Resend Verification Email
            </button>
          </div>
        )}

        <p className="auth-link">
          <Link to="/delivery/login">Back to Login</Link>
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;

