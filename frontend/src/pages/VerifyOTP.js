import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import './Auth.css';

const VerifyOTP = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Get phone number from location state or prompt
    const statePhone = location.state?.phoneNumber;
    if (statePhone) {
      setPhoneNumber(statePhone);
    }
  }, [location]);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    
    if (otpValue.length !== 6) {
      toast.error('Please enter complete 6-digit OTP');
      return;
    }

    if (!phoneNumber) {
      toast.error('Phone number is required');
      return;
    }

    setLoading(true);
    try {
      await api.post('/delivery/auth/verify-otp', {
        phoneNumber,
        otp: otpValue,
      });
      toast.success('Phone number verified successfully!');
      navigate('/delivery/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!phoneNumber) {
      toast.error('Phone number is required');
      return;
    }

    setResendLoading(true);
    try {
      const response = await api.post('/delivery/auth/resend-otp', {
        phoneNumber,
      });
      toast.success('OTP resent successfully!');
      if (response.data.otp) {
        toast.info(`OTP: ${response.data.otp} (Development mode)`);
      }
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-0')?.focus();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>📱 Verify Phone Number</h2>
        <p style={{ textAlign: 'center', color: '#686b78', marginBottom: '1.5rem' }}>
          Enter the 6-digit OTP sent to your phone number
        </p>

        <form onSubmit={handleVerify}>
          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter your phone number"
              required
              disabled={!!location.state?.phoneNumber}
            />
          </div>

          <div className="form-group">
            <label>Enter OTP</label>
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1rem' }}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value.replace(/[^0-9]/g, ''))}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  style={{
                    width: '50px',
                    height: '60px',
                    fontSize: '24px',
                    textAlign: 'center',
                    border: '2px solid #d4d5d9',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                  }}
                  autoFocus={index === 0}
                />
              ))}
            </div>
          </div>

          <button type="submit" className="auth-button" disabled={loading || otp.join('').length !== 6}>
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <button
            type="button"
            onClick={handleResendOTP}
            disabled={resendLoading || !phoneNumber}
            style={{
              background: 'none',
              border: 'none',
              color: '#FC8019',
              cursor: resendLoading || !phoneNumber ? 'not-allowed' : 'pointer',
              textDecoration: 'underline',
              fontSize: '0.9rem',
              opacity: resendLoading || !phoneNumber ? 0.5 : 1,
            }}
          >
            {resendLoading ? 'Sending...' : "Didn't receive OTP? Resend"}
          </button>
        </div>

        <p className="auth-link">
          <Link to="/delivery/login">Back to Login</Link>
        </p>
      </div>
    </div>
  );
};

export default VerifyOTP;

