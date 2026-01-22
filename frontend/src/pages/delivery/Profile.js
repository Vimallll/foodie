import React, { useState, useEffect, useContext, useCallback } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import '../Profile.css';

const DeliveryProfile = () => {
  const { checkAuth } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
    },
  });

  const fetchProfile = useCallback(async () => {
    try {
      const response = await api.get('/delivery/auth/me');
      const profileData = response.data.data;
      setProfile(profileData);
      setFormData({
        fullName: profileData.fullName || profileData.name || '',
        phoneNumber: profileData.phoneNumber || profileData.phone || '',
        address: profileData.address || {
          street: '',
          city: '',
          state: '',
          zipCode: '',
        },
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error(error.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData({
        ...formData,
        address: {
          ...formData.address,
          [addressField]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      await api.put('/delivery/profile', formData);
      toast.success('Profile updated successfully!');
      fetchProfile();
      checkAuth();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  if (!profile) {
    return (
      <div className="profile-page">
        <div className="container">
          <p>Profile not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="container">
        <h1>🚚 Delivery Partner Profile</h1>

        <div className="profile-card">
          <h2>Personal Information</h2>
          
          {/* Display Profile Info */}
          <div style={{ marginBottom: '2rem', padding: '1.5rem', background: '#f9f9f9', borderRadius: '8px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '600', color: '#666', marginBottom: '0.5rem' }}>
                  Full Name
                </label>
                <p style={{ fontSize: '1.1rem', color: '#333', fontWeight: '500' }}>
                  {profile.fullName || profile.name || 'N/A'}
                </p>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '600', color: '#666', marginBottom: '0.5rem' }}>
                  Phone Number
                </label>
                <p style={{ fontSize: '1.1rem', color: '#333', fontWeight: '500' }}>
                  <a 
                    href={`tel:${profile.phoneNumber || profile.phone || ''}`}
                    style={{ color: '#ff6b35', textDecoration: 'none' }}
                  >
                    {profile.phoneNumber || profile.phone || 'N/A'}
                  </a>
                </p>
              </div>
            </div>
            
            {profile.email && (
              <div style={{ marginTop: '1rem' }}>
                <label style={{ display: 'block', fontWeight: '600', color: '#666', marginBottom: '0.5rem' }}>
                  Email
                </label>
                <p style={{ fontSize: '1.1rem', color: '#333', fontWeight: '500' }}>
                  {profile.email}
                </p>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontWeight: '600', color: '#666', marginBottom: '0.5rem' }}>
                  Vehicle Type
                </label>
                <p style={{ fontSize: '1.1rem', color: '#333', fontWeight: '500', textTransform: 'capitalize' }}>
                  {profile.vehicleType || 'N/A'}
                </p>
              </div>
              <div>
                <label style={{ display: 'block', fontWeight: '600', color: '#666', marginBottom: '0.5rem' }}>
                  Vehicle Number
                </label>
                <p style={{ fontSize: '1.1rem', color: '#333', fontWeight: '500' }}>
                  {profile.vehicleNumber || 'N/A'}
                </p>
              </div>
            </div>

            <div style={{ marginTop: '1rem' }}>
              <label style={{ display: 'block', fontWeight: '600', color: '#666', marginBottom: '0.5rem' }}>
                Status
              </label>
              <p style={{ fontSize: '1.1rem', color: '#333', fontWeight: '500' }}>
                <span style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '4px',
                  backgroundColor: profile.isVerified ? '#d4edda' : '#fff3cd',
                  color: profile.isVerified ? '#155724' : '#856404',
                  fontWeight: '600'
                }}>
                  {profile.isVerified ? '✓ Verified' : '⚠ Pending Verification'}
                </span>
              </p>
            </div>
          </div>

          {/* Edit Profile Form */}
          <form onSubmit={handleSubmit}>
            <h3>Edit Profile</h3>
            
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                required
              />
            </div>

            <h3>Address</h3>

            <div className="form-group">
              <label>Street Address</label>
              <input
                type="text"
                name="address.street"
                value={formData.address.street}
                onChange={handleChange}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>State</label>
                <input
                  type="text"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Zip Code</label>
              <input
                type="text"
                name="address.zipCode"
                value={formData.address.zipCode}
                onChange={handleChange}
              />
            </div>

            <button type="submit" className="save-button" disabled={updating}>
              {updating ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DeliveryProfile;

