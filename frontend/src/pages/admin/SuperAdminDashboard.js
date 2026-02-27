import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Navbar from '../../components/Navbar';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const SuperAdminDashboard = () => {
    const [analytics, setAnalytics] = useState(null);
    const [chefs, setChefs] = useState([]);
    const [filter, setFilter] = useState('pending');
    const [loading, setLoading] = useState(true);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [selectedChefId, setSelectedChefId] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');

    // New state for chef detail & payouts
    const [activeSection, setActiveSection] = useState('chefs'); // 'chefs', 'payouts', 'revenue'
    const [chefDetail, setChefDetail] = useState(null);
    const [pendingPayouts, setPendingPayouts] = useState([]);
    const [detailLoading, setDetailLoading] = useState(false);

    const getToken = useCallback(() => localStorage.getItem('token'), []);
    const authHeaders = useCallback(() => ({ headers: { Authorization: `Bearer ${getToken()}` } }), [getToken]);

    const fetchAnalytics = useCallback(async () => {
        try {
            const res = await axios.get(`${API_URL}/api/super-admin/analytics`, authHeaders());
            setAnalytics(res.data.data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        }
    }, [authHeaders]);

    const fetchChefs = useCallback(async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/api/super-admin/chefs?status=${filter}`, authHeaders());
            setChefs(res.data.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching chefs:', error);
            toast.error('Failed to load chefs');
            setLoading(false);
        }
    }, [filter, authHeaders]);

    useEffect(() => {
        fetchAnalytics();
        fetchChefs();
    }, [fetchAnalytics, fetchChefs]);

    const updateChefStatus = async (id, status, reason = '') => {
        try {
            await axios.put(`${API_URL}/api/super-admin/chef/${id}/status`,
                { status, rejectionReason: reason }, authHeaders()
            );
            toast.success(`Chef status updated to ${status}`);
            fetchChefs();
            fetchAnalytics();
            if (status === 'rejected') closeRejectModal();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
    };

    const openRejectModal = (id) => { setSelectedChefId(id); setRejectModalOpen(true); };
    const closeRejectModal = () => { setRejectModalOpen(false); setSelectedChefId(null); setRejectionReason(''); };
    const handleRejectSubmit = () => {
        if (!rejectionReason.trim()) { toast.error('Please provide a rejection reason'); return; }
        updateChefStatus(selectedChefId, 'rejected', rejectionReason);
    };

    // Chef Detail
    const viewChefDetail = async (id) => {
        try {
            setDetailLoading(true);
            const res = await axios.get(`${API_URL}/api/super-admin/chef/${id}`, authHeaders());
            setChefDetail(res.data.data);
            setDetailLoading(false);
        } catch (error) {
            toast.error('Failed to load chef details');
            setDetailLoading(false);
        }
    };

    // Payouts
    const fetchPayouts = useCallback(async () => {
        try {
            const res = await axios.get(`${API_URL}/api/super-admin/payouts`, authHeaders());
            setPendingPayouts(res.data.data);
        } catch (error) {
            console.error('Error fetching payouts:', error);
        }
    }, [authHeaders]);

    const handlePayout = async (chefId, payoutId, action) => {
        try {
            await axios.put(`${API_URL}/api/super-admin/chef/${chefId}/payout/${payoutId}`,
                { action }, authHeaders()
            );
            toast.success(`Payout ${action} successfully`);
            fetchPayouts();
            fetchAnalytics();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to process payout');
        }
    };

    // Delete dish
    const handleDeleteDish = async (foodId) => {
        if (!window.confirm('Are you sure you want to delete this dish?')) return;
        try {
            await axios.delete(`${API_URL}/api/super-admin/food/${foodId}`, authHeaders());
            toast.success('Dish deleted');
            if (chefDetail) viewChefDetail(chefDetail.chef._id);
        } catch (error) {
            toast.error('Failed to delete dish');
        }
    };

    useEffect(() => {
        if (activeSection === 'payouts') fetchPayouts();
    }, [activeSection, fetchPayouts]);

    const statusBadge = (status) => {
        const colors = {
            pending: '#f59e0b', approved: '#10b981', rejected: '#ef4444',
            suspended: '#6b7280', PLACED: '#3b82f6', PREPARING: '#f59e0b',
            READY: '#8b5cf6', DELIVERED: '#10b981', CANCELLED: '#ef4444'
        };
        return {
            display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '9999px',
            fontSize: '0.75rem', fontWeight: '600', color: 'white',
            background: colors[status] || '#6b7280'
        };
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f3f4f6' }}>
            <Navbar />
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '1.5rem' }}>
                    Super Admin Dashboard
                </h1>

                {/* Analytics Cards */}
                {analytics && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
                        {[
                            { label: 'Total Chefs', value: analytics.chefs.total, color: '#3b82f6' },
                            { label: 'Pending', value: analytics.chefs.pending, color: '#f59e0b' },
                            { label: 'Active', value: analytics.chefs.approved, color: '#10b981' },
                            { label: 'Home Orders', value: analytics.orders.totalHomeKitchen, color: '#8b5cf6' },
                            { label: 'Revenue', value: `₹${analytics.revenue?.totalRevenue || 0}`, color: '#059669' },
                            { label: 'Platform Fee', value: `₹${analytics.revenue?.platformEarnings || 0}`, color: '#dc2626' },
                        ].map((card, i) => (
                            <div key={i} style={{
                                background: 'white', padding: '1.2rem', borderRadius: '8px',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: `4px solid ${card.color}`
                            }}>
                                <p style={{ color: '#6b7280', fontSize: '0.8rem', marginBottom: '0.3rem' }}>{card.label}</p>
                                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937' }}>{card.value}</p>
                            </div>
                        ))}
                    </div>
                )}

                {/* Section Tabs */}
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    {[
                        { key: 'chefs', label: '👨‍🍳 Manage Chefs' },
                        { key: 'payouts', label: '💰 Payouts' },
                        { key: 'revenue', label: '📊 Revenue' },
                    ].map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => { setActiveSection(tab.key); setChefDetail(null); }}
                            style={{
                                padding: '0.6rem 1.2rem', borderRadius: '6px', border: 'none', cursor: 'pointer',
                                fontWeight: '600', fontSize: '0.9rem',
                                background: activeSection === tab.key ? '#3b82f6' : 'white',
                                color: activeSection === tab.key ? 'white' : '#4b5563',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ===== CHEF DETAIL PANEL ===== */}
                {chefDetail && (
                    <div style={{ background: 'white', borderRadius: '8px', padding: '1.5rem', marginBottom: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: 0 }}>Chef Details: {chefDetail.chef.name}</h2>
                            <button onClick={() => setChefDetail(null)} style={{ background: '#f3f4f6', border: 'none', padding: '0.5rem 1rem', borderRadius: '6px', cursor: 'pointer' }}>
                                ✕ Close
                            </button>
                        </div>

                        {detailLoading ? <p>Loading...</p> : (
                            <div>
                                {/* Profile Info */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                                    <div>
                                        <h3 style={{ color: '#374151', marginBottom: '0.5rem' }}>Profile</h3>
                                        <table style={{ width: '100%', fontSize: '0.9rem' }}>
                                            <tbody>
                                                <tr><td style={{ padding: '0.4rem', color: '#6b7280' }}>Email</td><td>{chefDetail.chef.email}</td></tr>
                                                <tr><td style={{ padding: '0.4rem', color: '#6b7280' }}>Kitchen</td><td>{chefDetail.chef.chefProfile?.kitchenName || 'N/A'}</td></tr>
                                                <tr><td style={{ padding: '0.4rem', color: '#6b7280' }}>Experience</td><td>{chefDetail.chef.chefProfile?.experience || 'N/A'}</td></tr>
                                                <tr><td style={{ padding: '0.4rem', color: '#6b7280' }}>Specialties</td><td>{chefDetail.chef.chefProfile?.specialties?.join(', ') || 'N/A'}</td></tr>
                                                <tr><td style={{ padding: '0.4rem', color: '#6b7280' }}>Status</td><td><span style={statusBadge(chefDetail.chef.chefProfile?.chefStatus)}>{chefDetail.chef.chefProfile?.chefStatus}</span></td></tr>
                                                <tr><td style={{ padding: '0.4rem', color: '#6b7280' }}>Delivery</td><td>{chefDetail.chef.chefProfile?.deliveryMode} ({chefDetail.chef.chefProfile?.deliveryRadius}km)</td></tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <div>
                                        <h3 style={{ color: '#374151', marginBottom: '0.5rem' }}>Documents</h3>
                                        <table style={{ width: '100%', fontSize: '0.9rem' }}>
                                            <tbody>
                                                <tr><td style={{ padding: '0.4rem', color: '#6b7280' }}>FSSAI #</td><td>{chefDetail.chef.chefProfile?.fssaiLicenseNumber || 'Not provided'}</td></tr>
                                                <tr><td style={{ padding: '0.4rem', color: '#6b7280' }}>ID Type</td><td>{chefDetail.chef.chefProfile?.idProofType || 'Not provided'}</td></tr>
                                                <tr><td style={{ padding: '0.4rem', color: '#6b7280' }}>Wallet</td><td style={{ fontWeight: 'bold', color: '#7c3aed' }}>₹{chefDetail.chef.chefProfile?.walletBalance || 0}</td></tr>
                                            </tbody>
                                        </table>

                                        <h3 style={{ color: '#374151', margin: '1rem 0 0.5rem' }}>Order Stats</h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                                            {[
                                                { label: 'Total', value: chefDetail.stats.totalOrders, bg: '#eff6ff' },
                                                { label: 'Delivered', value: chefDetail.stats.deliveredOrders, bg: '#ecfdf5' },
                                                { label: 'Revenue', value: `₹${chefDetail.stats.totalRevenue}`, bg: '#f0fdf4' },
                                            ].map((s, i) => (
                                                <div key={i} style={{ background: s.bg, padding: '0.6rem', borderRadius: '6px', textAlign: 'center' }}>
                                                    <p style={{ fontSize: '0.7rem', color: '#6b7280', margin: 0 }}>{s.label}</p>
                                                    <p style={{ fontWeight: 'bold', margin: 0 }}>{s.value}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Menu */}
                                <h3 style={{ color: '#374151', marginBottom: '0.5rem' }}>Menu ({chefDetail.menu.length} items)</h3>
                                {chefDetail.menu.length > 0 ? (
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                                        <thead>
                                            <tr style={{ background: '#f9fafb', textAlign: 'left' }}>
                                                <th style={{ padding: '0.6rem' }}>Dish</th>
                                                <th style={{ padding: '0.6rem' }}>Price</th>
                                                <th style={{ padding: '0.6rem' }}>Type</th>
                                                <th style={{ padding: '0.6rem' }}>Status</th>
                                                <th style={{ padding: '0.6rem' }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {chefDetail.menu.map(dish => (
                                                <tr key={dish._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                                    <td style={{ padding: '0.6rem' }}>
                                                        {dish.name} {dish.isSpecial && '✨'}
                                                    </td>
                                                    <td style={{ padding: '0.6rem' }}>₹{dish.price}</td>
                                                    <td style={{ padding: '0.6rem' }}>{dish.isVeg ? '🥬 Veg' : '🍖 Non-Veg'}</td>
                                                    <td style={{ padding: '0.6rem' }}>
                                                        <span style={{ color: dish.isAvailable ? '#10b981' : '#ef4444' }}>
                                                            {dish.isAvailable ? 'Active' : 'Inactive'}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '0.6rem' }}>
                                                        <button
                                                            onClick={() => handleDeleteDish(dish._id)}
                                                            style={{ color: '#ef4444', background: '#fef2f2', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : <p style={{ color: '#9ca3af' }}>No dishes listed</p>}

                                {/* Recent Orders */}
                                <h3 style={{ color: '#374151', marginBottom: '0.5rem' }}>Recent Orders</h3>
                                {chefDetail.recentOrders.length > 0 ? (
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                        <thead>
                                            <tr style={{ background: '#f9fafb', textAlign: 'left' }}>
                                                <th style={{ padding: '0.6rem' }}>Order ID</th>
                                                <th style={{ padding: '0.6rem' }}>Customer</th>
                                                <th style={{ padding: '0.6rem' }}>Amount</th>
                                                <th style={{ padding: '0.6rem' }}>Status</th>
                                                <th style={{ padding: '0.6rem' }}>Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {chefDetail.recentOrders.map(order => (
                                                <tr key={order._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                                    <td style={{ padding: '0.6rem', fontFamily: 'monospace' }}>
                                                        #{order._id.substring(order._id.length - 6).toUpperCase()}
                                                    </td>
                                                    <td style={{ padding: '0.6rem' }}>{order.user?.name || 'N/A'}</td>
                                                    <td style={{ padding: '0.6rem', fontWeight: 'bold' }}>₹{order.totalAmount}</td>
                                                    <td style={{ padding: '0.6rem' }}>
                                                        <span style={statusBadge(order.status)}>{order.status}</span>
                                                    </td>
                                                    <td style={{ padding: '0.6rem', color: '#6b7280' }}>
                                                        {new Date(order.createdAt).toLocaleDateString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : <p style={{ color: '#9ca3af' }}>No orders yet</p>}

                                {/* Payout History */}
                                {chefDetail.payoutHistory.length > 0 && (
                                    <>
                                        <h3 style={{ color: '#374151', margin: '1rem 0 0.5rem' }}>Payout History</h3>
                                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                            <thead>
                                                <tr style={{ background: '#f9fafb', textAlign: 'left' }}>
                                                    <th style={{ padding: '0.6rem' }}>Amount</th>
                                                    <th style={{ padding: '0.6rem' }}>UPI</th>
                                                    <th style={{ padding: '0.6rem' }}>Status</th>
                                                    <th style={{ padding: '0.6rem' }}>Date</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {chefDetail.payoutHistory.map((p, i) => (
                                                    <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                                        <td style={{ padding: '0.6rem', fontWeight: 'bold' }}>₹{p.amount}</td>
                                                        <td style={{ padding: '0.6rem' }}>{p.upiId || 'N/A'}</td>
                                                        <td style={{ padding: '0.6rem' }}>
                                                            <span style={statusBadge(p.status)}>{p.status}</span>
                                                        </td>
                                                        <td style={{ padding: '0.6rem', color: '#6b7280' }}>
                                                            {new Date(p.requestedAt).toLocaleDateString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* ===== CHEFS SECTION ===== */}
                {activeSection === 'chefs' && !chefDetail && (
                    <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        {/* Status Filter Tabs */}
                        <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
                            {['pending', 'approved', 'suspended', 'rejected'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setFilter(status)}
                                    style={{
                                        padding: '0.8rem 1.5rem', border: 'none', cursor: 'pointer',
                                        fontWeight: '500', textTransform: 'capitalize', background: 'transparent',
                                        borderBottom: filter === status ? '2px solid #3b82f6' : '2px solid transparent',
                                        color: filter === status ? '#3b82f6' : '#6b7280'
                                    }}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>

                        {/* Chef Table */}
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f9fafb', textAlign: 'left' }}>
                                    <th style={{ padding: '0.8rem 1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: '#6b7280' }}>Chef</th>
                                    <th style={{ padding: '0.8rem 1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: '#6b7280' }}>Kitchen</th>
                                    <th style={{ padding: '0.8rem 1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: '#6b7280' }}>FSSAI</th>
                                    <th style={{ padding: '0.8rem 1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: '#6b7280' }}>Delivery</th>
                                    <th style={{ padding: '0.8rem 1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: '#6b7280' }}>Registered</th>
                                    <th style={{ padding: '0.8rem 1rem', fontSize: '0.75rem', textTransform: 'uppercase', color: '#6b7280', textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>Loading...</td></tr>
                                ) : chefs.length === 0 ? (
                                    <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#9ca3af' }}>No chefs found in this category.</td></tr>
                                ) : (
                                    chefs.map((chef) => (
                                        <tr key={chef._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                            <td style={{ padding: '0.8rem 1rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                                                    <div style={{
                                                        width: '36px', height: '36px', borderRadius: '50%', background: '#e5e7eb',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#6b7280'
                                                    }}>
                                                        {chef.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: '500', fontSize: '0.9rem' }}>{chef.name}</div>
                                                        <div style={{ color: '#6b7280', fontSize: '0.8rem' }}>{chef.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '0.8rem 1rem', fontSize: '0.85rem', color: '#4b5563' }}>
                                                {chef.chefProfile?.kitchenName || 'N/A'}
                                            </td>
                                            <td style={{ padding: '0.8rem 1rem', fontSize: '0.85rem', color: '#4b5563' }}>
                                                {chef.chefProfile?.fssaiLicenseNumber || '—'}
                                            </td>
                                            <td style={{ padding: '0.8rem 1rem', fontSize: '0.85rem', color: '#4b5563' }}>
                                                {chef.chefProfile?.deliveryMode || 'platform'}
                                            </td>
                                            <td style={{ padding: '0.8rem 1rem', fontSize: '0.85rem', color: '#6b7280' }}>
                                                {new Date(chef.createdAt).toLocaleDateString()}
                                            </td>
                                            <td style={{ padding: '0.8rem 1rem', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                                                    <button
                                                        onClick={() => viewChefDetail(chef._id)}
                                                        style={{ background: '#eff6ff', color: '#3b82f6', border: 'none', padding: '0.3rem 0.7rem', borderRadius: '9999px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '500' }}
                                                    >
                                                        View
                                                    </button>
                                                    {filter === 'pending' && (
                                                        <>
                                                            <button
                                                                onClick={() => updateChefStatus(chef._id, 'approved')}
                                                                style={{ background: '#ecfdf5', color: '#059669', border: 'none', padding: '0.3rem 0.7rem', borderRadius: '9999px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '500' }}
                                                            >
                                                                Approve
                                                            </button>
                                                            <button
                                                                onClick={() => openRejectModal(chef._id)}
                                                                style={{ background: '#fef2f2', color: '#dc2626', border: 'none', padding: '0.3rem 0.7rem', borderRadius: '9999px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '500' }}
                                                            >
                                                                Reject
                                                            </button>
                                                        </>
                                                    )}
                                                    {filter === 'approved' && (
                                                        <button
                                                            onClick={() => updateChefStatus(chef._id, 'suspended')}
                                                            style={{ background: '#fffbeb', color: '#d97706', border: 'none', padding: '0.3rem 0.7rem', borderRadius: '9999px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '500' }}
                                                        >
                                                            Suspend
                                                        </button>
                                                    )}
                                                    {filter === 'suspended' && (
                                                        <button
                                                            onClick={() => updateChefStatus(chef._id, 'approved')}
                                                            style={{ background: '#ecfdf5', color: '#059669', border: 'none', padding: '0.3rem 0.7rem', borderRadius: '9999px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '500' }}
                                                        >
                                                            Reactivate
                                                        </button>
                                                    )}
                                                    {filter === 'rejected' && (
                                                        <button
                                                            onClick={() => updateChefStatus(chef._id, 'approved')}
                                                            style={{ background: '#ecfdf5', color: '#059669', border: 'none', padding: '0.3rem 0.7rem', borderRadius: '9999px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '500' }}
                                                        >
                                                            Re-approve
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* ===== PAYOUTS SECTION ===== */}
                {activeSection === 'payouts' && (
                    <div style={{ background: 'white', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <h2 style={{ margin: '0 0 1rem' }}>Pending Payout Requests</h2>
                        {pendingPayouts.length === 0 ? (
                            <p style={{ color: '#9ca3af', textAlign: 'center', padding: '2rem' }}>No pending payouts</p>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                <thead>
                                    <tr style={{ background: '#f9fafb', textAlign: 'left' }}>
                                        <th style={{ padding: '0.8rem' }}>Chef</th>
                                        <th style={{ padding: '0.8rem' }}>Amount</th>
                                        <th style={{ padding: '0.8rem' }}>UPI ID</th>
                                        <th style={{ padding: '0.8rem' }}>Requested</th>
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
                                            <td style={{ padding: '0.8rem', fontWeight: 'bold', fontSize: '1.1rem', color: '#7c3aed' }}>
                                                ₹{p.amount}
                                            </td>
                                            <td style={{ padding: '0.8rem', fontFamily: 'monospace' }}>{p.upiId}</td>
                                            <td style={{ padding: '0.8rem', color: '#6b7280' }}>
                                                {new Date(p.requestedAt).toLocaleString()}
                                            </td>
                                            <td style={{ padding: '0.8rem', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                    <button
                                                        onClick={() => handlePayout(p.chefId, p.payoutId, 'completed')}
                                                        style={{ background: '#ecfdf5', color: '#059669', border: 'none', padding: '0.4rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                                                    >
                                                        ✓ Mark Paid
                                                    </button>
                                                    <button
                                                        onClick={() => handlePayout(p.chefId, p.payoutId, 'rejected')}
                                                        style={{ background: '#fef2f2', color: '#dc2626', border: 'none', padding: '0.4rem 1rem', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}
                                                    >
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

                {/* ===== REVENUE SECTION ===== */}
                {activeSection === 'revenue' && analytics && (
                    <div style={{ background: 'white', borderRadius: '8px', padding: '1.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <h2 style={{ margin: '0 0 1.5rem' }}>Revenue Overview</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
                            <div style={{ background: '#ecfdf5', padding: '1.5rem', borderRadius: '12px', textAlign: 'center' }}>
                                <p style={{ color: '#065f46', fontSize: '0.9rem', marginBottom: '0.3rem' }}>Total Home Kitchen Revenue</p>
                                <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#059669' }}>₹{analytics.revenue?.totalRevenue || 0}</p>
                            </div>
                            <div style={{ background: '#fef2f2', padding: '1.5rem', borderRadius: '12px', textAlign: 'center' }}>
                                <p style={{ color: '#991b1b', fontSize: '0.9rem', marginBottom: '0.3rem' }}>Platform Commission (15%)</p>
                                <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#dc2626' }}>₹{analytics.revenue?.platformEarnings || 0}</p>
                            </div>
                            <div style={{ background: '#eff6ff', padding: '1.5rem', borderRadius: '12px', textAlign: 'center' }}>
                                <p style={{ color: '#1e40af', fontSize: '0.9rem', marginBottom: '0.3rem' }}>Delivered Orders</p>
                                <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#3b82f6' }}>{analytics.orders?.delivered || 0}</p>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginTop: '1.5rem' }}>
                            <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                                <p style={{ color: '#6b7280', fontSize: '0.8rem' }}>Total Chefs</p>
                                <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{analytics.chefs.total}</p>
                            </div>
                            <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                                <p style={{ color: '#6b7280', fontSize: '0.8rem' }}>Active Chefs</p>
                                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>{analytics.chefs.approved}</p>
                            </div>
                            <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                                <p style={{ color: '#6b7280', fontSize: '0.8rem' }}>Pending Payouts</p>
                                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>{analytics.pendingPayouts || 0}</p>
                            </div>
                            <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                                <p style={{ color: '#6b7280', fontSize: '0.8rem' }}>Suspended</p>
                                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#6b7280' }}>{analytics.chefs.suspended || 0}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Rejection Modal */}
            {rejectModalOpen && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50
                }}>
                    <div style={{ background: 'white', borderRadius: '12px', maxWidth: '420px', width: '100%', padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Reject Application</h3>
                        <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '1rem' }}>
                            Please provide a reason for rejecting this chef application. This will be visible to the user.
                        </p>
                        <textarea
                            rows="4"
                            placeholder="Reason for rejection..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            style={{ width: '100%', padding: '0.8rem', border: '1px solid #d1d5db', borderRadius: '8px', marginBottom: '1rem', resize: 'vertical' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem' }}>
                            <button onClick={closeRejectModal} style={{ padding: '0.5rem 1rem', background: 'transparent', border: 'none', color: '#6b7280', cursor: 'pointer', fontWeight: '500' }}>
                                Cancel
                            </button>
                            <button onClick={handleRejectSubmit} style={{ padding: '0.5rem 1rem', background: '#dc2626', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' }}>
                                Confirm Rejection
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperAdminDashboard;
