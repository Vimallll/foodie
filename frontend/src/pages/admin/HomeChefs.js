import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { toast } from 'react-toastify';
import './Admin.css';

const AdminHomeChefs = () => {
    const [chefs, setChefs] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState(null);

    // Chef detail state
    const [chefDetail, setChefDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    // Payouts state
    const [showPayouts, setShowPayouts] = useState(false);
    const [pendingPayouts, setPendingPayouts] = useState([]);

    // Reject modal state
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [selectedChefId, setSelectedChefId] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');

    // Add Chef Modal
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [addFormData, setAddFormData] = useState({ name: '', email: '', password: '', kitchenName: '', phone: '' });



    const fetchAnalytics = useCallback(async () => {
        try {
            const res = await api.get('/super-admin/analytics');
            setAnalytics(res.data.data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        }
    }, []);

    const fetchChefs = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get(`/super-admin/chefs?status=${filter}`);
            setChefs(res.data.data);
        } catch (error) {
            toast.error('Failed to load chefs');
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        fetchAnalytics();
        fetchChefs();
    }, [fetchAnalytics, fetchChefs]);

    // Status update
    const updateChefStatus = async (id, status, reason = '') => {
        try {
            await api.put(`/super-admin/chef/${id}/status`, { status, rejectionReason: reason });
            toast.success(`Chef ${status} successfully`);
            fetchChefs();
            fetchAnalytics();
            if (status === 'rejected') closeRejectModal();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update');
        }
    };

    // Rejection modal
    const openRejectModal = (id) => { setSelectedChefId(id); setRejectModalOpen(true); };
    const closeRejectModal = () => { setRejectModalOpen(false); setSelectedChefId(null); setRejectionReason(''); };
    const handleRejectSubmit = () => {
        if (!rejectionReason.trim()) { toast.error('Please provide a reason'); return; }
        updateChefStatus(selectedChefId, 'rejected', rejectionReason);
    };

    // Chef detail
    const viewChefDetail = async (id) => {
        try {
            setDetailLoading(true);
            const res = await api.get(`/super-admin/chef/${id}`);
            setChefDetail(res.data.data);
        } catch (error) {
            toast.error('Failed to load chef details');
        } finally {
            setDetailLoading(false);
        }
    };

    // Payouts
    const fetchPayouts = async () => {
        try {
            const res = await api.get('/super-admin/payouts');
            setPendingPayouts(res.data.data);
        } catch (error) {
            console.error('Error fetching payouts:', error);
        }
    };

    const handlePayout = async (chefId, payoutId, action) => {
        try {
            await api.put(`/super-admin/chef/${chefId}/payout/${payoutId}`, { action });
            toast.success(`Payout ${action}`);
            fetchPayouts();
            fetchAnalytics();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Payout action failed');
        }
    };

    // Add Chef Handler
    const handleAddChef = async (e) => {
        e.preventDefault();
        try {
            await api.post('/super-admin/chef', addFormData);
            toast.success('Home Chef created successfully');
            setAddModalOpen(false);
            setAddFormData({ name: '', email: '', password: '', kitchenName: '', phone: '' });
            fetchChefs();
            fetchAnalytics(); // Update total chefs count
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create chef');
        }
    };

    // Delete Chef Handler
    const handleDeleteChef = async (id) => {
        if (window.confirm('Are you sure? This will delete the chef and all their data irreversibly.')) {
            try {
                await api.delete(`/super-admin/chef/${id}`);
                toast.success('Chef deleted successfully');
                fetchChefs();
                fetchAnalytics();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to delete chef');
            }
        }
    };

    // Delete dish
    const handleDeleteDish = async (foodId) => {
        if (!window.confirm('Delete this dish?')) return;
        try {
            await api.delete(`/super-admin/food/${foodId}`);
            toast.success('Dish deleted');
            if (chefDetail) viewChefDetail(chefDetail.chef._id);
        } catch (error) {
            toast.error('Failed to delete dish');
        }
    };

    const statusColors = {
        pending: '#f59e0b', approved: '#10b981', rejected: '#ef4444', suspended: '#6b7280',
        PLACED: '#3b82f6', PREPARING: '#f59e0b', READY: '#8b5cf6', DELIVERED: '#10b981', CANCELLED: '#ef4444',
        completed: '#10b981'
    };

    const badge = (status) => ({
        display: 'inline-block', padding: '4px 12px', borderRadius: '20px',
        fontSize: '0.75rem', fontWeight: '600', color: 'white',
        background: statusColors[status] || '#6b7280', textTransform: 'capitalize'
    });

    const cardStyle = {
        background: 'white', borderRadius: '12px', padding: '1.5rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: '1.5rem'
    };

    const btnStyle = (bg, color) => ({
        background: bg, color, border: 'none', padding: '6px 14px',
        borderRadius: '20px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600'
    });

    return (
        <div className="admin-page">
            <div className="container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h1 style={{ margin: 0 }}>🍳 Manage Home Chefs</h1>
                    <Link to="/admin/dashboard" style={{ color: '#3b82f6', textDecoration: 'none', fontWeight: '500' }}>
                        ← Back to Dashboard
                    </Link>
                </div>

                {/* Add Chef Modal */}
                {addModalOpen && (
                    <div className="modal-overlay" style={{
                        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                        background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                    }}>
                        <div className="modal-content" style={{ background: 'white', padding: '2rem', borderRadius: '8px', width: '400px' }}>
                            <h3 style={{ marginTop: 0 }}>Add New Home Chef</h3>
                            <form onSubmit={handleAddChef}>
                                <input
                                    type="text" placeholder="Full Name" required
                                    value={addFormData.name} onChange={e => setAddFormData({ ...addFormData, name: e.target.value })}
                                    style={{ display: 'block', width: '100%', padding: '0.8rem', marginBottom: '1rem', border: '1px solid #ddd', borderRadius: '4px' }}
                                />
                                <input
                                    type="email" placeholder="Email Address" required
                                    value={addFormData.email} onChange={e => setAddFormData({ ...addFormData, email: e.target.value })}
                                    style={{ display: 'block', width: '100%', padding: '0.8rem', marginBottom: '1rem', border: '1px solid #ddd', borderRadius: '4px' }}
                                />
                                <input
                                    type="password" placeholder="Password" required
                                    value={addFormData.password} onChange={e => setAddFormData({ ...addFormData, password: e.target.value })}
                                    style={{ display: 'block', width: '100%', padding: '0.8rem', marginBottom: '1rem', border: '1px solid #ddd', borderRadius: '4px' }}
                                />
                                <input
                                    type="text" placeholder="Kitchen Name" required
                                    value={addFormData.kitchenName} onChange={e => setAddFormData({ ...addFormData, kitchenName: e.target.value })}
                                    style={{ display: 'block', width: '100%', padding: '0.8rem', marginBottom: '1rem', border: '1px solid #ddd', borderRadius: '4px' }}
                                />
                                <input
                                    type="text" placeholder="Phone (Optional)"
                                    value={addFormData.phone} onChange={e => setAddFormData({ ...addFormData, phone: e.target.value })}
                                    style={{ display: 'block', width: '100%', padding: '0.8rem', marginBottom: '1rem', border: '1px solid #ddd', borderRadius: '4px' }}
                                />
                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                    <button type="button" onClick={() => setAddModalOpen(false)} style={{ padding: '0.5rem 1rem', cursor: 'pointer', border: '1px solid #ccc', background: 'white', borderRadius: '4px' }}>Cancel</button>
                                    <button type="submit" style={{ padding: '0.5rem 1rem', cursor: 'pointer', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px' }}>Create Chef</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Analytics Cards */}
                {analytics && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                        {[
                            { label: 'Total Chefs', value: analytics.chefs.total, color: '#3b82f6', icon: '👨‍🍳' },
                            { label: 'Pending', value: analytics.chefs.pending, color: '#f59e0b', icon: '⏳' },
                            { label: 'Active', value: analytics.chefs.approved, color: '#10b981', icon: '✅' },
                            { label: 'Suspended', value: analytics.chefs.suspended || 0, color: '#6b7280', icon: '⛔' },
                            { label: 'Total Revenue', value: `₹${analytics.revenue?.totalRevenue || 0}`, color: '#059669', icon: '💰' },
                            { label: 'Platform Fee', value: `₹${analytics.revenue?.platformEarnings || 0}`, color: '#dc2626', icon: '🏦' },
                            { label: 'Home Orders', value: analytics.orders.totalHomeKitchen, color: '#8b5cf6', icon: '📦' },
                            { label: 'Payouts Pending', value: analytics.pendingPayouts || 0, color: '#f59e0b', icon: '💳' },
                        ].map((card, i) => (
                            <div key={i} style={{
                                background: 'white', padding: '1rem', borderRadius: '12px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderLeft: `4px solid ${card.color}`,
                                textAlign: 'center'
                            }}>
                                <div style={{ fontSize: '1.5rem' }}>{card.icon}</div>
                                <p style={{ color: '#6b7280', fontSize: '0.75rem', margin: '0.2rem 0' }}>{card.label}</p>
                                <p style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>{card.value}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '0.8rem', marginBottom: '1.5rem' }}>
                    <button
                        onClick={() => setAddModalOpen(true)}
                        style={btnStyle('#10b981', 'white')}
                    >
                        + Add New Chef
                    </button>
                    <button
                        onClick={() => { setShowPayouts(false); setChefDetail(null); }}
                        style={btnStyle(showPayouts ? '#f3f4f6' : '#3b82f6', showPayouts ? '#374151' : 'white')}
                    >
                        👨‍🍳 Chef List
                    </button>
                    <button
                        onClick={() => { setShowPayouts(true); setChefDetail(null); fetchPayouts(); }}
                        style={btnStyle(!showPayouts ? '#f3f4f6' : '#7c3aed', !showPayouts ? '#374151' : 'white')}
                    >
                        💳 Manage Payouts {analytics?.pendingPayouts > 0 && `(${analytics.pendingPayouts})`}
                    </button>
                </div>

                {/* ========== CHEF DETAIL PANEL ========== */}
                {chefDetail && (
                    <div style={cardStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0, fontSize: '1.3rem' }}>
                                {chefDetail.chef.name} <span style={badge(chefDetail.chef.chefProfile?.chefStatus)}>{chefDetail.chef.chefProfile?.chefStatus}</span>
                            </h2>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {chefDetail.chef.chefProfile?.chefStatus === 'pending' && (
                                    <>
                                        <button onClick={() => updateChefStatus(chefDetail.chef._id, 'approved')} style={btnStyle('#ecfdf5', '#059669')}>✓ Approve</button>
                                        <button onClick={() => openRejectModal(chefDetail.chef._id)} style={btnStyle('#fef2f2', '#dc2626')}>✕ Reject</button>
                                    </>
                                )}
                                {chefDetail.chef.chefProfile?.chefStatus === 'approved' && (
                                    <button onClick={() => updateChefStatus(chefDetail.chef._id, 'suspended')} style={btnStyle('#fffbeb', '#d97706')}>⛔ Suspend</button>
                                )}
                                {chefDetail.chef.chefProfile?.chefStatus === 'suspended' && (
                                    <button onClick={() => updateChefStatus(chefDetail.chef._id, 'approved')} style={btnStyle('#ecfdf5', '#059669')}>✓ Reactivate</button>
                                )}
                                <button onClick={() => setChefDetail(null)} style={btnStyle('#f3f4f6', '#374151')}>✕ Close</button>
                            </div>
                        </div>

                        {detailLoading ? <p>Loading details...</p> : (
                            <>
                                {/* Profile + Documents Grid */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                    <div style={{ background: '#f9fafb', padding: '1.2rem', borderRadius: '8px' }}>
                                        <h3 style={{ margin: '0 0 0.8rem', fontSize: '1rem', color: '#374151' }}>📋 Profile Information</h3>
                                        <table style={{ width: '100%', fontSize: '0.85rem' }}>
                                            <tbody>
                                                {[
                                                    ['Email', chefDetail.chef.email],
                                                    ['Kitchen Name', chefDetail.chef.chefProfile?.kitchenName || 'N/A'],
                                                    ['Experience', chefDetail.chef.chefProfile?.experience || 'N/A'],
                                                    ['Specialties', chefDetail.chef.chefProfile?.specialties?.join(', ') || 'N/A'],
                                                    ['Description', chefDetail.chef.chefProfile?.description || 'N/A'],
                                                    ['Delivery Mode', chefDetail.chef.chefProfile?.deliveryMode || 'platform'],
                                                    ['Delivery Radius', `${chefDetail.chef.chefProfile?.deliveryRadius || 5} km`],
                                                    ['Registered', new Date(chefDetail.chef.createdAt).toLocaleDateString()],
                                                ].map(([label, value], i) => (
                                                    <tr key={i}>
                                                        <td style={{ padding: '0.3rem 0.5rem', color: '#6b7280', fontWeight: '500', whiteSpace: 'nowrap' }}>{label}</td>
                                                        <td style={{ padding: '0.3rem 0.5rem' }}>{value}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div>
                                        <div style={{ background: '#f9fafb', padding: '1.2rem', borderRadius: '8px', marginBottom: '1rem' }}>
                                            <h3 style={{ margin: '0 0 0.8rem', fontSize: '1rem', color: '#374151' }}>📄 Documents & Verification</h3>
                                            <table style={{ width: '100%', fontSize: '0.85rem' }}>
                                                <tbody>
                                                    {[
                                                        ['FSSAI License', chefDetail.chef.chefProfile?.fssaiLicenseNumber || 'Not provided'],
                                                        ['ID Proof Type', chefDetail.chef.chefProfile?.idProofType || 'Not provided'],
                                                        ['Kitchen Address', chefDetail.chef.chefProfile?.kitchenAddress || 'Not provided'],
                                                        ['Wallet Balance', `₹${chefDetail.chef.chefProfile?.walletBalance || 0}`],
                                                        ['Total Earnings', `₹${chefDetail.chef.chefProfile?.totalEarnings || 0}`],
                                                    ].map(([label, value], i) => (
                                                        <tr key={i}>
                                                            <td style={{ padding: '0.3rem 0.5rem', color: '#6b7280', fontWeight: '500', whiteSpace: 'nowrap' }}>{label}</td>
                                                            <td style={{ padding: '0.3rem 0.5rem' }}>{value}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Mini Order Stats */}
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                                            {[
                                                { label: 'Orders', value: chefDetail.stats.totalOrders, bg: '#eff6ff' },
                                                { label: 'Delivered', value: chefDetail.stats.deliveredOrders, bg: '#ecfdf5' },
                                                { label: 'Cancelled', value: chefDetail.stats.cancelledOrders, bg: '#fef2f2' },
                                                { label: 'Revenue', value: `₹${chefDetail.stats.totalRevenue}`, bg: '#f0fdf4' },
                                            ].map((s, i) => (
                                                <div key={i} style={{ background: s.bg, padding: '0.6rem', borderRadius: '8px', textAlign: 'center' }}>
                                                    <p style={{ fontSize: '0.7rem', color: '#6b7280', margin: 0 }}>{s.label}</p>
                                                    <p style={{ fontWeight: 'bold', margin: 0, fontSize: '1.1rem' }}>{s.value}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Menu Items */}
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <h3 style={{ margin: '0 0 0.8rem', fontSize: '1rem', color: '#374151' }}>
                                        🍽️ Menu ({chefDetail.menu.length} items)
                                    </h3>
                                    {chefDetail.menu.length > 0 ? (
                                        <div style={{ overflowX: 'auto' }}>
                                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                                <thead>
                                                    <tr style={{ background: '#f9fafb' }}>
                                                        <th style={{ padding: '0.6rem 0.8rem', textAlign: 'left' }}>Dish</th>
                                                        <th style={{ padding: '0.6rem 0.8rem', textAlign: 'left' }}>Price</th>
                                                        <th style={{ padding: '0.6rem 0.8rem', textAlign: 'left' }}>Type</th>
                                                        <th style={{ padding: '0.6rem 0.8rem', textAlign: 'left' }}>Prep Time</th>
                                                        <th style={{ padding: '0.6rem 0.8rem', textAlign: 'left' }}>Status</th>
                                                        <th style={{ padding: '0.6rem 0.8rem', textAlign: 'right' }}>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {chefDetail.menu.map(dish => (
                                                        <tr key={dish._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                                            <td style={{ padding: '0.6rem 0.8rem', fontWeight: '500' }}>
                                                                {dish.name} {dish.isSpecial && <span title="Special">✨</span>}
                                                            </td>
                                                            <td style={{ padding: '0.6rem 0.8rem' }}>₹{dish.price}</td>
                                                            <td style={{ padding: '0.6rem 0.8rem' }}>{dish.isVeg ? '🥬 Veg' : '🍖 Non-Veg'}</td>
                                                            <td style={{ padding: '0.6rem 0.8rem' }}>{dish.preparationTime || 30} min</td>
                                                            <td style={{ padding: '0.6rem 0.8rem' }}>
                                                                <span style={{ color: dish.isAvailable ? '#10b981' : '#ef4444', fontWeight: '600', fontSize: '0.8rem' }}>
                                                                    {dish.isAvailable ? '● Active' : '● Inactive'}
                                                                </span>
                                                            </td>
                                                            <td style={{ padding: '0.6rem 0.8rem', textAlign: 'right' }}>
                                                                <button onClick={() => handleDeleteDish(dish._id)} style={btnStyle('#fef2f2', '#dc2626')}>
                                                                    🗑 Delete
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : <p style={{ color: '#9ca3af', fontStyle: 'italic' }}>No dishes listed yet</p>}
                                </div>

                                {/* Recent Orders */}
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <h3 style={{ margin: '0 0 0.8rem', fontSize: '1rem', color: '#374151' }}>📦 Recent Orders</h3>
                                    {chefDetail.recentOrders.length > 0 ? (
                                        <div style={{ overflowX: 'auto' }}>
                                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                                <thead>
                                                    <tr style={{ background: '#f9fafb' }}>
                                                        <th style={{ padding: '0.6rem 0.8rem', textAlign: 'left' }}>Order ID</th>
                                                        <th style={{ padding: '0.6rem 0.8rem', textAlign: 'left' }}>Customer</th>
                                                        <th style={{ padding: '0.6rem 0.8rem', textAlign: 'left' }}>Items</th>
                                                        <th style={{ padding: '0.6rem 0.8rem', textAlign: 'left' }}>Amount</th>
                                                        <th style={{ padding: '0.6rem 0.8rem', textAlign: 'left' }}>Status</th>
                                                        <th style={{ padding: '0.6rem 0.8rem', textAlign: 'left' }}>Date</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {chefDetail.recentOrders.map(order => (
                                                        <tr key={order._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                                            <td style={{ padding: '0.6rem 0.8rem', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                                                                #{order._id.slice(-6).toUpperCase()}
                                                            </td>
                                                            <td style={{ padding: '0.6rem 0.8rem' }}>{order.user?.name || 'N/A'}</td>
                                                            <td style={{ padding: '0.6rem 0.8rem' }}>
                                                                {order.items?.map(it => it.food?.name || 'Item').join(', ').substring(0, 40)}
                                                            </td>
                                                            <td style={{ padding: '0.6rem 0.8rem', fontWeight: 'bold' }}>₹{order.totalAmount}</td>
                                                            <td style={{ padding: '0.6rem 0.8rem' }}>
                                                                <span style={badge(order.status)}>{order.status}</span>
                                                            </td>
                                                            <td style={{ padding: '0.6rem 0.8rem', color: '#6b7280' }}>
                                                                {new Date(order.createdAt).toLocaleDateString()}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : <p style={{ color: '#9ca3af', fontStyle: 'italic' }}>No orders yet</p>}
                                </div>

                                {/* Payout History */}
                                {chefDetail.payoutHistory.length > 0 && (
                                    <div>
                                        <h3 style={{ margin: '0 0 0.8rem', fontSize: '1rem', color: '#374151' }}>💳 Payout History</h3>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                            <thead>
                                                <tr style={{ background: '#f9fafb' }}>
                                                    <th style={{ padding: '0.6rem 0.8rem', textAlign: 'left' }}>Amount</th>
                                                    <th style={{ padding: '0.6rem 0.8rem', textAlign: 'left' }}>UPI ID</th>
                                                    <th style={{ padding: '0.6rem 0.8rem', textAlign: 'left' }}>Status</th>
                                                    <th style={{ padding: '0.6rem 0.8rem', textAlign: 'left' }}>Requested</th>
                                                    <th style={{ padding: '0.6rem 0.8rem', textAlign: 'right' }}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {chefDetail.payoutHistory.map((p, i) => (
                                                    <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                                        <td style={{ padding: '0.6rem 0.8rem', fontWeight: 'bold' }}>₹{p.amount}</td>
                                                        <td style={{ padding: '0.6rem 0.8rem', fontFamily: 'monospace' }}>{p.upiId || 'N/A'}</td>
                                                        <td style={{ padding: '0.6rem 0.8rem' }}>
                                                            <span style={badge(p.status)}>{p.status}</span>
                                                        </td>
                                                        <td style={{ padding: '0.6rem 0.8rem', color: '#6b7280' }}>
                                                            {new Date(p.requestedAt).toLocaleString()}
                                                        </td>
                                                        <td style={{ padding: '0.6rem 0.8rem', textAlign: 'right' }}>
                                                            {p.status === 'pending' && (
                                                                <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                                                                    <button onClick={() => handlePayout(chefDetail.chef._id, p._id, 'completed')} style={btnStyle('#ecfdf5', '#059669')}>✓ Pay</button>
                                                                    <button onClick={() => handlePayout(chefDetail.chef._id, p._id, 'rejected')} style={btnStyle('#fef2f2', '#dc2626')}>✕ Reject</button>
                                                                </div>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* ========== PAYOUTS SECTION ========== */}
                {showPayouts && !chefDetail && (
                    <div style={cardStyle}>
                        <h2 style={{ margin: '0 0 1rem', fontSize: '1.3rem' }}>💳 All Pending Payout Requests</h2>
                        {pendingPayouts.length === 0 ? (
                            <p style={{ color: '#9ca3af', textAlign: 'center', padding: '2rem' }}>🎉 No pending payouts! All clear.</p>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                <thead>
                                    <tr style={{ background: '#f9fafb' }}>
                                        <th style={{ padding: '0.8rem', textAlign: 'left' }}>Chef</th>
                                        <th style={{ padding: '0.8rem', textAlign: 'left' }}>Amount</th>
                                        <th style={{ padding: '0.8rem', textAlign: 'left' }}>UPI ID</th>
                                        <th style={{ padding: '0.8rem', textAlign: 'left' }}>Requested</th>
                                        <th style={{ padding: '0.8rem', textAlign: 'right' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingPayouts.map((p, i) => (
                                        <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                            <td style={{ padding: '0.8rem' }}>
                                                <div style={{ fontWeight: '500' }}>{p.chefName}</div>
                                                <div style={{ color: '#6b7280', fontSize: '0.8rem' }}>{p.chefEmail}</div>
                                            </td>
                                            <td style={{ padding: '0.8rem', fontWeight: 'bold', color: '#7c3aed', fontSize: '1.1rem' }}>₹{p.amount}</td>
                                            <td style={{ padding: '0.8rem', fontFamily: 'monospace' }}>{p.upiId}</td>
                                            <td style={{ padding: '0.8rem', color: '#6b7280' }}>{new Date(p.requestedAt).toLocaleString()}</td>
                                            <td style={{ padding: '0.8rem', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                    <button onClick={() => handlePayout(p.chefId, p.payoutId, 'completed')} style={btnStyle('#ecfdf5', '#059669')}>
                                                        ✓ Mark Paid
                                                    </button>
                                                    <button onClick={() => handlePayout(p.chefId, p.payoutId, 'rejected')} style={btnStyle('#fef2f2', '#dc2626')}>
                                                        ✕ Reject
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {/* ========== CHEF LIST TABLE ========== */}
                {!showPayouts && !chefDetail && (
                    <div style={cardStyle}>
                        {/* Status Filter Tabs */}
                        <div style={{ display: 'flex', borderBottom: '2px solid #f3f4f6', marginBottom: '1rem' }}>
                            {['all', 'pending', 'approved', 'suspended', 'rejected'].map(status => (
                                <button
                                    key={status}
                                    onClick={() => setFilter(status)}
                                    style={{
                                        padding: '0.7rem 1.5rem', border: 'none', cursor: 'pointer',
                                        fontWeight: '600', textTransform: 'capitalize', background: 'transparent',
                                        borderBottom: filter === status ? '3px solid #e67e22' : '3px solid transparent',
                                        color: filter === status ? '#e67e22' : '#6b7280', fontSize: '0.9rem'
                                    }}
                                >
                                    {status} {analytics && status === 'pending' && analytics.chefs.pending > 0 &&
                                        <span style={{ background: '#f59e0b', color: 'white', borderRadius: '50%', padding: '2px 7px', marginLeft: '4px', fontSize: '0.7rem' }}>
                                            {analytics.chefs.pending}
                                        </span>
                                    }
                                </button>
                            ))}
                        </div>

                        {/* Chef Table */}
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                <thead>
                                    <tr style={{ background: '#f9fafb' }}>
                                        <th style={{ padding: '0.8rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: '#6b7280' }}>Chef</th>
                                        <th style={{ padding: '0.8rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: '#6b7280' }}>Kitchen</th>
                                        <th style={{ padding: '0.8rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: '#6b7280' }}>Contact</th>
                                        <th style={{ padding: '0.8rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: '#6b7280' }}>FSSAI</th>
                                        <th style={{ padding: '0.8rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: '#6b7280' }}>Delivery</th>
                                        <th style={{ padding: '0.8rem', textAlign: 'left', fontSize: '0.75rem', textTransform: 'uppercase', color: '#6b7280' }}>Registered</th>
                                        <th style={{ padding: '0.8rem', textAlign: 'right', fontSize: '0.75rem', textTransform: 'uppercase', color: '#6b7280' }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>Loading...</td></tr>
                                    ) : chefs.length === 0 ? (
                                        <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>No chefs with {filter} status</td></tr>
                                    ) : (
                                        chefs.map(chef => (
                                            <tr key={chef._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                                <td style={{ padding: '0.8rem' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                                        <div style={{
                                                            width: '38px', height: '38px', borderRadius: '50%', background: '#e67e22',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            color: 'white', fontWeight: 'bold', fontSize: '1rem'
                                                        }}>
                                                            {chef.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div style={{ fontWeight: '600' }}>{chef.name}</div>
                                                            <div style={{ color: '#6b7280', fontSize: '0.8rem' }}>{chef.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '0.8rem', color: '#4b5563' }}>{chef.chefProfile?.kitchenName || '—'}</td>
                                                <td style={{ padding: '0.8rem', color: '#4b5563', fontSize: '0.85rem' }}>
                                                    <div>📞 {chef.phone || chef.phoneNumber || 'N/A'}</div>
                                                    <div style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '2px' }}>
                                                        📍 {chef.chefProfile?.kitchenAddress || chef.address?.street || 'No Address'}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '0.8rem', color: '#4b5563', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                                                    {chef.chefProfile?.fssaiLicenseNumber || '—'}
                                                </td>
                                                <td style={{ padding: '0.8rem', color: '#4b5563' }}>{chef.chefProfile?.deliveryMode || 'platform'}</td>
                                                <td style={{ padding: '0.8rem', color: '#6b7280' }}>{new Date(chef.createdAt).toLocaleDateString()}</td>
                                                <td style={{ padding: '0.8rem', textAlign: 'right' }}>
                                                    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                                        <button onClick={() => viewChefDetail(chef._id)} style={btnStyle('#eff6ff', '#3b82f6')}>👁 View</button>
                                                        <button
                                                            onClick={() => handleDeleteChef(chef._id)}
                                                            style={btnStyle('#fef2f2', '#dc2626')}
                                                        >
                                                            🗑 Delete
                                                        </button>
                                                        {filter === 'pending' && (
                                                            <>
                                                                <button onClick={() => updateChefStatus(chef._id, 'approved')} style={btnStyle('#ecfdf5', '#059669')}>✓ Approve</button>
                                                                <button onClick={() => openRejectModal(chef._id)} style={btnStyle('#fef2f2', '#dc2626')}>✕ Reject</button>
                                                            </>
                                                        )}
                                                        {filter === 'approved' && (
                                                            <button onClick={() => updateChefStatus(chef._id, 'suspended')} style={btnStyle('#fffbeb', '#d97706')}>⛔ Suspend</button>
                                                        )}
                                                        {filter === 'suspended' && (
                                                            <button onClick={() => updateChefStatus(chef._id, 'approved')} style={btnStyle('#ecfdf5', '#059669')}>✓ Reactivate</button>
                                                        )}
                                                        {filter === 'rejected' && (
                                                            <button onClick={() => updateChefStatus(chef._id, 'approved')} style={btnStyle('#ecfdf5', '#059669')}>✓ Re-approve</button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Rejection Modal */}
            {rejectModalOpen && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999
                }}>
                    <div style={{ background: 'white', borderRadius: '12px', maxWidth: '420px', width: '90%', padding: '1.5rem' }}>
                        <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem' }}>Reject Chef Application</h3>
                        <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '1rem' }}>
                            Provide a reason for rejection. This will be visible to the chef.
                        </p>
                        <textarea
                            rows="4"
                            placeholder="Reason for rejection..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            style={{
                                width: '100%', padding: '0.8rem', border: '2px solid #e5e7eb',
                                borderRadius: '8px', marginBottom: '1rem', resize: 'vertical',
                                fontSize: '0.9rem', boxSizing: 'border-box'
                            }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem' }}>
                            <button onClick={closeRejectModal} style={{ padding: '0.6rem 1.2rem', background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer', fontWeight: '500' }}>
                                Cancel
                            </button>
                            <button onClick={handleRejectSubmit} style={{ padding: '0.6rem 1.2rem', background: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                                Confirm Rejection
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
export default AdminHomeChefs;
