import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../services/api';
import LiveLocationTracker from '../../components/LiveLocationTracker';
import '../admin/Admin.css';

const DeliveryDashboard = () => {
  const [stats, setStats] = useState(null);
  const [availableOrders, setAvailableOrders] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availabilityStatus, setAvailabilityStatus] = useState('ONLINE');

  useEffect(() => {
    fetchData();
    // Refresh orders every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Set to ONLINE by default when component mounts (only if status is not set at all)
  useEffect(() => {
    const setInitialStatus = async () => {
      try {
        const response = await api.get('/delivery/stats');
        const currentStatus = response.data.stats?.availabilityStatus;
        
        // Only auto-set to ONLINE if status is completely undefined/null (first login)
        // Don't override if user has explicitly set it to OFFLINE
        if (!currentStatus) {
          try {
            await api.patch('/delivery/status', { availabilityStatus: 'ONLINE' });
            setAvailabilityStatus('ONLINE');
            toast.success('You are now ONLINE');
          } catch (err) {
            console.warn('Could not auto-set to ONLINE:', err);
            // If error is due to verification, set to OFFLINE
            if (err.response?.status === 403) {
              setAvailabilityStatus('OFFLINE');
            }
          }
        } else {
          // Use the existing status from server
          setAvailabilityStatus(currentStatus);
        }
      } catch (error) {
        console.warn('Could not fetch initial status:', error);
        // Default to ONLINE if we can't fetch status
        setAvailabilityStatus('ONLINE');
      }
    };
    setInitialStatus();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch stats and dashboard first (these don't require verification)
      const [statsRes, dashboardRes] = await Promise.all([
        api.get('/delivery/stats'),
        api.get('/delivery/dashboard'),
      ]);
      
      // Then fetch orders (may fail if not verified, but that's okay)
      let availableRes, myOrdersRes;
      try {
        [availableRes, myOrdersRes] = await Promise.all([
          api.get('/delivery/orders/new'),
          api.get('/delivery/orders'),
        ]);
      } catch (ordersError) {
        // If orders fail due to verification, just set empty arrays
        console.warn('Could not fetch orders:', ordersError.response?.data?.message);
        availableRes = { data: { data: [], orders: [] } };
        myOrdersRes = { data: { orders: [], data: [] } };
      }
      setStats(statsRes.data.stats);
      setAvailableOrders(availableRes.data.data || availableRes.data.orders || []);
      
      const allMyOrders = myOrdersRes.data.orders || myOrdersRes.data.data || [];
      setMyOrders(allMyOrders);
      
      // Find active order (status: OUT_FOR_DELIVERY, PICKED_UP, ON_THE_WAY)
      const active = allMyOrders.find(order => 
        order.status === 'OUT_FOR_DELIVERY' || 
        order.status === 'PICKED_UP' || 
        order.status === 'ON_THE_WAY'
      );
      
      // Get active order from dashboard response or from myOrders
      const dashboardActiveOrder = dashboardRes.data.data?.activeOrder || dashboardRes.data?.activeOrder || null;
      setActiveOrder(dashboardActiveOrder || active || null);
      
      // Update availability status from server (respects user's manual changes)
      // If there's an active order, status should be BUSY
      if (dashboardActiveOrder || active) {
        setAvailabilityStatus('BUSY');
      } else if (statsRes.data.stats?.availabilityStatus) {
        setAvailabilityStatus(statsRes.data.stats.availabilityStatus);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      // Try to get active order from myOrders even if dashboard fails
      try {
        const myOrdersRes = await api.get('/delivery/orders');
        const orders = myOrdersRes.data.orders || myOrdersRes.data.data || [];
        const active = orders.find(order => 
          order.status === 'OUT_FOR_DELIVERY' || 
          order.status === 'PICKED_UP' || 
          order.status === 'ON_THE_WAY'
        );
        setActiveOrder(active || null);
      } catch (err) {
        console.error('Error fetching my orders:', err);
      }
      toast.error(error.response?.data?.message || 'Error fetching dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const acceptOrder = async (orderId) => {
    try {
      const response = await api.post(`/delivery/orders/${orderId}/accept`);
      
      // Get the accepted order from response
      const acceptedOrder = response.data?.order || response.data?.data?.order;
      
      if (acceptedOrder) {
        // Immediately update UI: Add to activeOrder
        setActiveOrder(acceptedOrder);
        
        // Remove from availableOrders
        setAvailableOrders(prevOrders => 
          prevOrders.filter(order => order._id !== orderId)
        );
        
        // Add to myOrders if not already there
        setMyOrders(prevOrders => {
          const exists = prevOrders.find(order => order._id === orderId);
          if (!exists) {
            return [acceptedOrder, ...prevOrders];
          }
          return prevOrders.map(order => 
            order._id === orderId ? acceptedOrder : order
          );
        });
        
        // Update availability status to BUSY (since they now have an active order)
        setAvailabilityStatus('BUSY');
        
        toast.success('Order accepted successfully! It is now in your Active Delivery section.');
      } else {
        // If order not in response, refresh to get updated data
        toast.success('Order accepted successfully!');
        setTimeout(() => {
          fetchData();
        }, 500);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error accepting order');
      // Refresh data on error to ensure UI is in sync
      fetchData();
    }
  };

  const rejectOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to reject this order? The system will offer it to another delivery partner.')) {
      return;
    }
    try {
      await api.post(`/delivery/orders/${orderId}/reject`);
      
      // Immediately remove from availableOrders for better UX
      setAvailableOrders(prevOrders => 
        prevOrders.filter(order => order._id !== orderId)
      );
      
      toast.info('Order rejected. It will be offered to another delivery partner.');
      
      // Refresh data after a short delay to ensure consistency
      setTimeout(() => {
        fetchData();
      }, 500);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error rejecting order');
      // Refresh on error to ensure UI is in sync
      fetchData();
    }
  };

  const deliverOrder = async (orderId) => {
    try {
      await api.put(`/delivery/orders/${orderId}/deliver`);
      toast.success('Order marked as delivered!');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating order');
    }
  };

  const toggleAvailability = async () => {
    try {
      // Determine new status based on current status
      const newStatus = availabilityStatus === 'ONLINE' ? 'OFFLINE' : 'ONLINE';
      
      // Optimistically update UI first for better UX
      setAvailabilityStatus(newStatus);
      
      // Call API to update status
      const response = await api.patch('/delivery/status', { availabilityStatus: newStatus });
      
      // Confirm status from server response
      if (response.data && response.data.data) {
        const confirmedStatus = response.data.data.availabilityStatus || newStatus;
        setAvailabilityStatus(confirmedStatus);
        toast.success(`You are now ${confirmedStatus}`);
      } else {
        // Fallback if response format is different
        setAvailabilityStatus(newStatus);
        toast.success(`You are now ${newStatus}`);
      }
      
      // Refresh data after status change to get updated stats
      setTimeout(() => {
        fetchData();
      }, 500);
    } catch (error) {
      console.error('Toggle availability error:', error);
      
      // Revert optimistic update on error
      setAvailabilityStatus(availabilityStatus === 'ONLINE' ? 'OFFLINE' : 'ONLINE');
      
      const errorMessage = error.response?.data?.message || 'Error updating status';
      toast.error(errorMessage);
      
      // If access denied, suggest re-login
      if (error.response?.status === 403) {
        setTimeout(() => {
          toast.info('Please try logging out and logging back in', { autoClose: 5000 });
        }, 2000);
      }
      
      // Refresh to get actual status from server
      fetchData();
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="admin-page">
      <div className="container">
        <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h1>Delivery Dashboard</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: availabilityStatus === 'ONLINE' ? 'rgba(72, 196, 121, 0.1)' : 'rgba(108, 117, 125, 0.1)',
              borderRadius: '8px',
              border: `1px solid ${availabilityStatus === 'ONLINE' ? '#48c479' : '#6c757d'}`
            }}>
              <span style={{ 
                width: '12px', 
                height: '12px', 
                borderRadius: '50%', 
                background: availabilityStatus === 'ONLINE' ? '#48c479' : '#6c757d',
                animation: availabilityStatus === 'ONLINE' ? 'pulse 2s infinite' : 'none',
                boxShadow: availabilityStatus === 'ONLINE' ? '0 0 8px rgba(72, 196, 121, 0.6)' : 'none'
              }}></span>
              <span style={{ 
                fontWeight: '600', 
                color: availabilityStatus === 'ONLINE' ? '#48c479' : '#6c757d',
                fontSize: '0.95rem'
              }}>
                {availabilityStatus === 'ONLINE' ? 'You are now ONLINE' : 'You are OFFLINE'}
              </span>
            </div>
            <button
              onClick={toggleAvailability}
              disabled={loading}
              style={{
                background: availabilityStatus === 'ONLINE' 
                  ? 'linear-gradient(135deg, #48c479 0%, #3ba866 100%)' 
                  : 'linear-gradient(135deg, #6c757d 0%, #5a6268 100%)',
                border: 'none',
                color: '#fff',
                fontWeight: '700',
                padding: '0.875rem 2rem',
                borderRadius: '12px',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: availabilityStatus === 'ONLINE' 
                  ? '0 4px 15px rgba(72, 196, 121, 0.4)' 
                  : '0 4px 15px rgba(108, 117, 125, 0.3)',
                fontSize: '0.95rem',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = availabilityStatus === 'ONLINE' 
                    ? '0 6px 20px rgba(72, 196, 121, 0.5)' 
                    : '0 6px 20px rgba(108, 117, 125, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = availabilityStatus === 'ONLINE' 
                  ? '0 4px 15px rgba(72, 196, 121, 0.4)' 
                  : '0 4px 15px rgba(108, 117, 125, 0.3)';
              }}
            >
              {availabilityStatus === 'ONLINE' 
                ? '🟢 You are ONLINE - Click here to go OFFLINE' 
                : '⚫ You are OFFLINE - Click here to go ONLINE'}
            </button>
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
              transform: scale(1.2);
            }
          }
        `}</style>

        {stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Orders</h3>
              <p className="stat-number">{stats.totalOrders}</p>
            </div>
            <div className="stat-card">
              <h3>Delivered</h3>
              <p className="stat-number">{stats.deliveredOrders}</p>
            </div>
            <div className="stat-card">
              <h3>In Progress</h3>
              <p className="stat-number">{stats.inProgressOrders}</p>
            </div>
            <div className="stat-card">
              <h3>Total Earnings</h3>
              <p className="stat-number">₹{stats.totalEarnings?.toFixed(2) || '0.00'}</p>
            </div>
          </div>
        )}

        {/* Active Delivery Section */}
        <div style={{ marginTop: '2rem' }}>
          <h2>
            🚚 Active Delivery 
            {activeOrder && <span style={{ fontSize: '1rem', color: '#48c479', fontWeight: '600', marginLeft: '0.5rem' }}>(1 active order)</span>}
          </h2>
          {activeOrder ? (
            <div style={{
              backgroundColor: '#fff3cd',
              border: '2px solid #ffc107',
              borderRadius: '8px',
              padding: '1.5rem',
              marginBottom: '1rem'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.5rem 0', color: '#333', fontSize: '1.2rem' }}>
                    Order #{activeOrder._id.slice(-6)}
                  </h3>
                  <p style={{ margin: '0.25rem 0', color: '#666' }}>
                    <strong>Restaurant:</strong> {activeOrder.restaurant?.name || 'N/A'}
                  </p>
                  <p style={{ margin: '0.25rem 0', color: '#666' }}>
                    <strong>Customer:</strong> {activeOrder.user?.name || 'N/A'}
                  </p>
                  <p style={{ margin: '0.25rem 0', color: '#666' }}>
                    <strong>Phone:</strong>{' '}
                    <a 
                      href={`tel:${activeOrder.user?.phone || activeOrder.user?.phoneNumber || ''}`}
                      style={{ color: '#ff6b35', textDecoration: 'none' }}
                    >
                      {activeOrder.user?.phone || activeOrder.user?.phoneNumber || 'N/A'}
                    </a>
                  </p>
                </div>
                <div>
                  <p style={{ margin: '0.25rem 0', color: '#666' }}>
                    <strong>Delivery Address:</strong>
                  </p>
                  <p style={{ margin: '0.25rem 0', color: '#333', lineHeight: '1.6' }}>
                    {activeOrder.deliveryAddress?.street || ''}, {activeOrder.deliveryAddress?.city || ''}, {activeOrder.deliveryAddress?.state || ''} {activeOrder.deliveryAddress?.zipCode || ''}
                  </p>
                  <p style={{ margin: '0.5rem 0', color: '#666' }}>
                    <strong>Status:</strong>{' '}
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '4px',
                      backgroundColor: '#ffc107',
                      color: '#856404',
                      fontWeight: '600',
                      textTransform: 'capitalize'
                    }}>
                      {activeOrder.status?.replace(/_/g, ' ')}
                    </span>
                  </p>
                  <p style={{ margin: '0.25rem 0', color: '#48c479', fontWeight: '600', fontSize: '1.1rem' }}>
                    <strong>Earnings:</strong> ₹{activeOrder.deliveryFee || activeOrder.estimatedEarnings || '0'}
                  </p>
                </div>
              </div>
              <div style={{ borderTop: '1px solid #ffc107', paddingTop: '1rem', marginTop: '1rem' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#333' }}>Order Items:</h4>
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  {activeOrder.items?.map((item, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '0.5rem',
                      backgroundColor: '#fff',
                      borderRadius: '4px'
                    }}>
                      <span>{item.name} x {item.quantity}</span>
                      <span style={{ fontWeight: '600' }}>₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Live Location Tracker */}
              {(activeOrder.status === 'OUT_FOR_DELIVERY' || activeOrder.status === 'PICKED_UP' || activeOrder.status === 'ON_THE_WAY') && (
                <div style={{ marginTop: '1.5rem', borderTop: '2px solid #ffc107', paddingTop: '1.5rem' }}>
                  <LiveLocationTracker 
                    order={activeOrder} 
                    onLocationUpdate={(location) => {
                      console.log('Location updated:', location);
                    }}
                  />
                </div>
              )}

              <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                {activeOrder.status === 'OUT_FOR_DELIVERY' && (
                  <button
                    onClick={() => deliverOrder(activeOrder._id)}
                    className="btn-primary"
                    style={{ fontSize: '1rem', padding: '0.75rem 1.5rem', fontWeight: '600' }}
                  >
                    ✓ Mark as Delivered
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div style={{
              backgroundColor: '#f8f9fa',
              border: '1px solid #dee2e6',
              borderRadius: '8px',
              padding: '2rem',
              textAlign: 'center',
              color: '#6c757d',
              marginBottom: '1rem'
            }}>
              <p style={{ margin: 0, fontSize: '1.1rem' }}>
                No active delivery at the moment. Accept an order from "Available Orders" to start a delivery.
              </p>
            </div>
          )}
        </div>

        <div style={{ marginTop: '2rem' }}>
          <h2>Available Orders {availableOrders.length === 0 && '(No new orders)'}</h2>
          {availabilityStatus !== 'ONLINE' && (
            <div style={{ 
              backgroundColor: '#fff3cd', 
              border: '1px solid #ffc107', 
              borderRadius: '4px', 
              padding: '1rem', 
              marginBottom: '1rem',
              color: '#856404'
            }}>
              ⚠️ You must be ONLINE to receive new orders. Click the "Offline" button to go online.
            </div>
          )}
          {availabilityStatus === 'ONLINE' && !activeOrder && (
            <div style={{ 
              backgroundColor: '#d4edda', 
              border: '1px solid #28a745', 
              borderRadius: '4px', 
              padding: '1rem', 
              marginBottom: '1rem',
              color: '#155724'
            }}>
              ✅ You are ONLINE and can receive new orders. Click the "Online" button to go offline.
            </div>
          )}
          {activeOrder && (
            <div style={{ 
              backgroundColor: '#fff3cd', 
              border: '1px solid #ffc107', 
              borderRadius: '4px', 
              padding: '1rem', 
              marginBottom: '1rem',
              color: '#856404'
            }}>
              ⚠️ You have an active delivery. Complete it before accepting new orders. You are currently BUSY.
            </div>
          )}
          {availableOrders.length > 0 ? (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Restaurant</th>
                    <th>Customer</th>
                    <th>Address</th>
                    <th>Distance</th>
                    <th>Earnings</th>
                    <th>Total</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {availableOrders.map((order) => (
                    <tr key={order._id}>
                      <td>#{order._id.slice(-6)}</td>
                      <td>{order.restaurant?.name || 'N/A'}</td>
                      <td>{order.user?.name || 'N/A'}</td>
                      <td>
                        {order.deliveryAddress?.street || ''}, {order.deliveryAddress?.city || ''}
                      </td>
                      <td>{order.distance ? `${order.distance} km` : 'N/A'}</td>
                      <td style={{ fontWeight: '600', color: '#48c479' }}>
                        ₹{order.estimatedEarnings || order.deliveryFee || '0'}
                      </td>
                      <td>₹{order.totalAmount?.toFixed(2) || '0.00'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => acceptOrder(order._id)}
                            className="btn-primary"
                            disabled={availabilityStatus !== 'ONLINE' || !!activeOrder}
                            style={{ 
                              fontSize: '0.875rem', 
                              padding: '0.5rem 1rem',
                              opacity: (availabilityStatus !== 'ONLINE' || activeOrder) ? 0.6 : 1,
                              cursor: (availabilityStatus !== 'ONLINE' || activeOrder) ? 'not-allowed' : 'pointer'
                            }}
                            title={activeOrder ? 'You already have an active delivery. Complete it first.' : availabilityStatus !== 'ONLINE' ? 'You must be ONLINE to accept orders' : 'Click to accept this order'}
                          >
                            ✓ Accept Order
                          </button>
                          <button
                            onClick={() => rejectOrder(order._id)}
                            className="btn-secondary"
                            disabled={availabilityStatus !== 'ONLINE' || !!activeOrder}
                            style={{ 
                              fontSize: '0.875rem', 
                              padding: '0.5rem 1rem', 
                              borderColor: '#E23744', 
                              color: '#E23744',
                              opacity: (availabilityStatus !== 'ONLINE' || activeOrder) ? 0.6 : 1,
                              cursor: (availabilityStatus !== 'ONLINE' || activeOrder) ? 'not-allowed' : 'pointer'
                            }}
                            title={activeOrder ? 'You have an active delivery' : availabilityStatus !== 'ONLINE' ? 'You must be ONLINE to reject orders' : 'Click to reject this order'}
                          >
                            ✕ Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ 
              padding: '2rem', 
              textAlign: 'center', 
              background: '#f8f8f8', 
              borderRadius: '8px',
              color: '#686b78'
            }}>
              No orders available at the moment. Orders will appear here when restaurants accept them.
            </div>
          )}
        </div>

        <div style={{ marginTop: '2rem' }}>
          <h2>My Orders</h2>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Restaurant</th>
                  <th>Customer</th>
                  <th>Address</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {myOrders.map((order) => (
                  <tr key={order._id}>
                    <td>{order._id.slice(-6)}</td>
                    <td>{order.restaurant?.name}</td>
                    <td>{order.user?.name}</td>
                    <td>
                      {order.deliveryAddress?.street || ''}, {order.deliveryAddress?.city || ''}
                    </td>
                    <td>
                      <span className="status-badge">
                        {order.status?.replace(/_/g, ' ').toUpperCase() || 'N/A'}
                      </span>
                    </td>
                    <td>
                      {order.status === 'OUT_FOR_DELIVERY' && (
                        <button
                          onClick={() => deliverOrder(order._id)}
                          className="btn-primary"
                          style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                        >
                          Mark Delivered
                        </button>
                      )}
                      {(!order.status || order.status === 'READY_FOR_PICKUP') && (
                        <span style={{ color: '#93959f', fontSize: '0.875rem' }}>Waiting...</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryDashboard;

