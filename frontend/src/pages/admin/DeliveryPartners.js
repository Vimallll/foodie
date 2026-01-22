import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import './Admin.css';

const DeliveryPartners = () => {
  const [deliveryPartners, setDeliveryPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeliveryPartners();
    // Refresh delivery partners status every 5 seconds to show live status updates
    const interval = setInterval(() => {
      fetchDeliveryPartners();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchDeliveryPartners = async () => {
    try {
      const response = await api.get('/admin/delivery-partners');
      setDeliveryPartners(response.data.deliveryPartners || []);
    } catch (error) {
      console.error('Error fetching delivery partners:', error);
      toast.error(error.response?.data?.message || 'Error fetching delivery partners');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (partnerId, field, currentValue) => {
    try {
      const updateData = { [field]: !currentValue };
      await api.put(`/admin/delivery-partners/${partnerId}`, updateData);
      toast.success(`${field === 'isVerified' ? 'Verification' : 'Account'} status updated`);
      fetchDeliveryPartners();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating status');
    }
  };

  if (loading) {
    return <div className="loading">Loading delivery partners...</div>;
  }

  return (
    <div className="admin-page">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h1>Manage Delivery Partners</h1>
          <div style={{ 
            padding: '0.5rem 1rem', 
            background: 'rgba(252, 128, 25, 0.1)', 
            borderRadius: '8px',
            border: '1px solid rgba(252, 128, 25, 0.2)',
            fontSize: '0.85rem',
            color: '#FC8019',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <span style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              background: '#FC8019',
              animation: 'pulse 2s infinite'
            }}></span>
            Live Status - Updates every 5 seconds
          </div>
        </div>
        
        <style>{`
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
              transform: scale(1);
            }
            50% {
              opacity: 0.7;
              transform: scale(1.3);
            }
          }
        `}</style>

        {deliveryPartners.length === 0 ? (
          <div className="no-data">
            <p>No delivery partners found</p>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Vehicle</th>
                  <th>Verified</th>
                  <th>Active</th>
                  <th>Phone Verified</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {deliveryPartners.map((partner) => (
                  <tr key={partner._id || partner.id}>
                    <td>{partner.fullName || partner.name}</td>
                    <td>{partner.phoneNumber || partner.phone || 'N/A'}</td>
                    <td>{partner.email || 'N/A'}</td>
                    <td>
                      {partner.vehicleType && (
                        <span>
                          {partner.vehicleType} ({partner.vehicleNumber || 'N/A'})
                        </span>
                      )}
                      {!partner.vehicleType && 'N/A'}
                    </td>
                    <td>
                      <span
                        style={{
                          color: partner.isVerified ? '#4caf50' : '#f44336',
                          fontWeight: 'bold',
                        }}
                      >
                        {partner.isVerified ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          color: partner.isActive ? '#4caf50' : '#f44336',
                          fontWeight: 'bold',
                        }}
                      >
                        {partner.isActive ? 'Active' : 'Blocked'}
                      </span>
                    </td>
                    <td>
                      <span
                        style={{
                          color: partner.isPhoneVerified ? '#4caf50' : '#f44336',
                        }}
                      >
                        {partner.isPhoneVerified ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ 
                          width: '10px', 
                          height: '10px', 
                          borderRadius: '50%', 
                          background: partner.availabilityStatus === 'ONLINE'
                            ? '#4caf50'
                            : partner.availabilityStatus === 'BUSY'
                            ? '#ff9800'
                            : '#9e9e9e',
                          boxShadow: partner.availabilityStatus === 'ONLINE'
                            ? '0 0 6px rgba(76, 175, 80, 0.6)'
                            : 'none',
                          animation: partner.availabilityStatus === 'ONLINE' ? 'pulse 2s infinite' : 'none'
                        }}></span>
                        <span
                          style={{
                            color:
                              partner.availabilityStatus === 'ONLINE'
                                ? '#4caf50'
                                : partner.availabilityStatus === 'BUSY'
                                ? '#ff9800'
                                : '#666',
                            fontWeight: partner.availabilityStatus === 'ONLINE' ? '700' : '600',
                            fontSize: '0.9rem'
                          }}
                        >
                          {partner.availabilityStatus || 'OFFLINE'}
                        </span>
                        {partner.availabilityStatus === 'ONLINE' && (
                          <span style={{ 
                            fontSize: '0.75rem', 
                            color: '#4caf50', 
                            fontWeight: '600',
                            padding: '0.125rem 0.375rem',
                            background: 'rgba(76, 175, 80, 0.1)',
                            borderRadius: '4px'
                          }}>
                            LIVE
                          </span>
                        )}
                      </div>
                    </td>
                    <td>{new Date(partner.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => handleToggleStatus(partner._id || partner.id, 'isVerified', partner.isVerified)}
                          className="btn-primary"
                          style={{
                            backgroundColor: partner.isVerified ? '#f44336' : '#4caf50',
                            fontSize: '12px',
                            padding: '4px 8px',
                          }}
                        >
                          {partner.isVerified ? 'Unverify' : 'Verify'}
                        </button>
                        <button
                          onClick={() => handleToggleStatus(partner._id || partner.id, 'isActive', partner.isActive)}
                          className="btn-primary"
                          style={{
                            backgroundColor: partner.isActive ? '#f44336' : '#4caf50',
                            fontSize: '12px',
                            padding: '4px 8px',
                          }}
                        >
                          {partner.isActive ? 'Block' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryPartners;




