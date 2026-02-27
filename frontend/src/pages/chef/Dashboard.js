import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const ChefDashboard = () => {
    const [stats, setStats] = useState({ dishes: 0, orders: 0, earnings: 0 });
    const [myDishes, setMyDishes] = useState([]);
    const [loading, setLoading] = useState(true);

    // New dish form state
    const [isAddingDish, setIsAddingDish] = useState(false);
    const [formData, setFormData] = useState({
        name: '', description: '', price: '', category: '', preparationTime: 30, image: '',
        isVeg: true, ingredients: '', isSpecial: false
    });
    const [editingDishId, setEditingDishId] = useState(null);
    const [categories, setCategories] = useState([]);

    const [orders, setOrders] = useState([]);
    const [activeTab, setActiveTab] = useState('active');
    const [earnings, setEarnings] = useState(null);
    const [payoutAmount, setPayoutAmount] = useState('');
    const [payoutUpi, setPayoutUpi] = useState('');

    const fetchOrders = useCallback(async () => {
        try {
            const res = await api.get(`/orders/chef-orders?status=${activeTab}`);
            if (res.data.success) {
                setOrders(res.data.orders);
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
        }
    }, [activeTab]);

    const fetchCategories = useCallback(async () => {
        try {
            const res = await api.get('/categories');
            if (res.data.success) setCategories(res.data.categories);
        } catch (err) { console.error(err); }
    }, []);

    const fetchEarnings = useCallback(async () => {
        try {
            const res = await api.get('/chefs/earnings');
            if (res.data.success) setEarnings(res.data.data);
        } catch (err) { console.error('Error fetching earnings:', err); }
    }, []);

    const fetchDashboardData = useCallback(async () => {
        try {
            const statsRes = await api.get('/chefs/dashboard/stats');
            if (statsRes.data.success) setStats(statsRes.data.data);

            const meRes = await api.get('/auth/me');
            const myId = meRes.data.user.id;

            const dishesRes = await api.get(`/foods?chef=${myId}&foodType=home&limit=100`);
            if (dishesRes.data.success) setMyDishes(dishesRes.data.foods);
        } catch (error) {
            console.error('Error loading dashboard', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDashboardData();
        fetchCategories();
        fetchOrders();
        fetchEarnings();
    }, [fetchDashboardData, fetchCategories, fetchOrders, fetchEarnings]);

    const updateOrderStatus = async (orderId, status) => {
        try {
            await api.put(`/orders/${orderId}/status`, { status });
            toast.success(`Order status updated to ${status}`);
            fetchOrders();
            fetchDashboardData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
    };

    const handleDishSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingDishId) {
                // Update existing dish
                await api.put(`/foods/${editingDishId}`, {
                    ...formData,
                    foodType: 'home'
                });
                toast.success('Dish updated successfully!');
            } else {
                // Create new dish
                await api.post('/foods', {
                    ...formData,
                    foodType: 'home'
                });
                toast.success('Dish added successfully!');
            }

            setIsAddingDish(false);
            setEditingDishId(null);
            setFormData({
                name: '', description: '', price: '', category: '', preparationTime: 30, image: '',
                isVeg: true, ingredients: '', isSpecial: false
            });
            fetchDashboardData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to save dish');
        }
    };

    const handleEditDish = (dish) => {
        setFormData({
            name: dish.name,
            description: dish.description,
            price: dish.price,
            category: dish.category?._id || dish.category, // Handle populated or ID
            preparationTime: dish.preparationTime,
            image: dish.image,
            isVeg: dish.isVeg,
            ingredients: dish.ingredients,
            isSpecial: dish.isSpecial
        });
        setEditingDishId(dish._id);
        setIsAddingDish(true);
        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteDish = async (dishId) => {
        if (window.confirm('Are you sure you want to delete this dish?')) {
            try {
                await api.delete(`/foods/${dishId}`);
                toast.success('Dish deleted successfully');
                fetchDashboardData();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to delete dish');
            }
        }
    };

    const handlePayout = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/chefs/payout', { amount: Number(payoutAmount), upiId: payoutUpi });
            toast.success(res.data.message);
            setPayoutAmount('');
            setPayoutUpi('');
            fetchEarnings();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Payout request failed');
        }
    };

    if (loading) return <div>Loading Dashboard...</div>;

    return (
        <div className="chef-dashboard" style={{ padding: '2rem' }}>
            <h1>Chef Dashboard 👨‍🍳</h1>

            {/* Stats Cards */}
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginTop: '2rem' }}>
                <div className="stat-card" style={{ padding: '1.5rem', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <h3>Dishes</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.dishes}</p>
                </div>
                <div className="stat-card" style={{ padding: '1.5rem', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <h3>Orders</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.orders}</p>
                </div>
                <div className="stat-card" style={{ padding: '1.5rem', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                    <h3>Earnings</h3>
                    <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>₹{stats.earnings}</p>
                </div>
            </div>

            {/* Order Management Section */}
            <div className="order-management" style={{ marginTop: '3rem' }}>
                <h2>Orders</h2>
                {/* Tabs */}
                <div className="tabs" style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #eee', marginBottom: '1.5rem' }}>
                    <button
                        className={activeTab === 'active' ? 'active-tab' : ''}
                        onClick={() => setActiveTab('active')}
                        style={{ padding: '0.8rem 1.5rem', background: 'none', border: 'none', borderBottom: activeTab === 'active' ? '2px solid #ff4757' : 'none', cursor: 'pointer', fontWeight: activeTab === 'active' ? 'bold' : 'normal' }}
                    >
                        Active Orders
                    </button>
                    <button
                        className={activeTab === 'history' ? 'active-tab' : ''}
                        onClick={() => setActiveTab('history')}
                        style={{ padding: '0.8rem 1.5rem', background: 'none', border: 'none', borderBottom: activeTab === 'history' ? '2px solid #ff4757' : 'none', cursor: 'pointer', fontWeight: activeTab === 'history' ? 'bold' : 'normal' }}
                    >
                        Order History
                    </button>
                </div>

                <div className="orders-list" style={{ display: 'grid', gap: '1.5rem' }}>
                    {(!orders || orders.length === 0) ? (
                        <p>No orders found.</p>
                    ) : orders.map(order => (
                        <div key={order._id} className="order-card" style={{ border: '1px solid #eee', borderRadius: '8px', padding: '1.5rem', background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <div>
                                    <h3 style={{ margin: 0 }}>Order #{order._id.substring(order._id.length - 6).toUpperCase()}</h3>
                                    <p style={{ color: '#666', fontSize: '0.9rem' }}>{new Date(order.createdAt).toLocaleString()}</p>
                                    <p><strong>Customer:</strong> {order.user?.name}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span className={`status-badge status-${order.status.toLowerCase()}`} style={{ padding: '0.4rem 0.8rem', borderRadius: '4px', background: '#eee', fontWeight: 'bold' }}>
                                        {order.status}
                                    </span>
                                    <p style={{ fontSize: '1.2rem', fontWeight: 'bold', marginTop: '0.5rem' }}>₹{order.totalAmount}</p>
                                </div>
                            </div>

                            <div className="order-items" style={{ background: '#f9f9f9', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>
                                {order.items?.map((item, index) => (
                                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span>{item.quantity}x {item.food?.name}</span>
                                        <span>₹{item.price * item.quantity}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Action Buttons based on Status */}
                            <div className="order-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                {order.status === 'PLACED' && (
                                    <>
                                        <button
                                            onClick={() => updateOrderStatus(order._id, 'PREPARING')}
                                            className="btn"
                                            style={{ background: '#2ecc71', color: 'white', padding: '0.6rem 1.2rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                        >
                                            Accept & Cook
                                        </button>
                                        <button
                                            onClick={() => updateOrderStatus(order._id, 'CANCELLED')} // Or REJECTED if supported
                                            className="btn"
                                            style={{ background: '#e74c3c', color: 'white', padding: '0.6rem 1.2rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                        >
                                            Reject
                                        </button>
                                    </>
                                )}
                                {order.status === 'PREPARING' && (
                                    <button
                                        onClick={() => updateOrderStatus(order._id, 'READY')}
                                        className="btn"
                                        style={{ background: '#3498db', color: 'white', padding: '0.6rem 1.2rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                    >
                                        Mark Ready
                                    </button>
                                )}
                                {order.status === 'READY' && (
                                    // Logic for Delivery: If Self Delivery, show "Mark Delivered". If Platform, show "Waiting for Pickup"
                                    <button
                                        onClick={() => updateOrderStatus(order._id, 'DELIVERED')}
                                        className="btn"
                                        style={{ background: '#9b59b6', color: 'white', padding: '0.6rem 1.2rem', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                    >
                                        Mark Delivered
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Menu Management */}
            <div className="menu-management" style={{ marginTop: '3rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h2>My Menu</h2>
                    <button
                        onClick={() => setIsAddingDish(!isAddingDish)}
                        className="btn btn-primary"
                        style={{ padding: '0.6rem 1.2rem', background: '#2ecc71', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        {isAddingDish ? 'Cancel' : '+ Add New Dish'}
                    </button>
                </div>

                {isAddingDish && (
                    <div className="add-dish-form" style={{ background: '#f9f9f9', padding: '1.5rem', borderRadius: '8px', marginBottom: '2rem' }}>
                        <h3>{editingDishId ? 'Edit Dish' : 'Add New Dish'}</h3>
                        <form onSubmit={handleDishSubmit}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <input
                                    type="text" placeholder="Dish Name" required
                                    value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    style={{ padding: '0.8rem', width: '100%' }}
                                />
                                <input
                                    type="number" placeholder="Price (₹)" required
                                    value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })}
                                    style={{ padding: '0.8rem', width: '100%' }}
                                />
                                <select
                                    required
                                    value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    style={{ padding: '0.8rem', width: '100%' }}
                                >
                                    <option value="">Select Category</option>
                                    {categories?.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                </select>
                                <input
                                    type="number" placeholder="Prep Time (mins)"
                                    value={formData.preparationTime} onChange={e => setFormData({ ...formData, preparationTime: e.target.value })}
                                    style={{ padding: '0.8rem', width: '100%' }}
                                />
                                <input
                                    type="text" placeholder="Image URL"
                                    value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })}
                                    style={{ padding: '0.8rem', width: '100%', gridColumn: 'span 2' }}
                                />
                                <input
                                    type="text" placeholder="Ingredients (comma separated)"
                                    value={formData.ingredients} onChange={e => setFormData({ ...formData, ingredients: e.target.value })}
                                    style={{ padding: '0.8rem', width: '100%', gridColumn: 'span 2' }}
                                />
                                <textarea
                                    placeholder="Description" required
                                    value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    style={{ padding: '0.8rem', width: '100%', gridColumn: 'span 2', minHeight: '100px' }}
                                ></textarea>

                                <div style={{ display: 'flex', gap: '2rem', gridColumn: 'span 2' }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.isVeg}
                                            onChange={e => setFormData({ ...formData, isVeg: e.target.checked })}
                                        />
                                        Vegetarian 🥬
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <input
                                            type="checkbox"
                                            checked={formData.isSpecial}
                                            onChange={e => setFormData({ ...formData, isSpecial: e.target.checked })}
                                        />
                                        Today's Special ✨
                                    </label>
                                </div>
                            </div>
                            <button type="submit" style={{ marginTop: '1rem', padding: '0.8rem 1.5rem', background: '#ff4757', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                                {editingDishId ? 'Update Dish' : 'Publish Dish'}
                            </button>
                        </form>
                    </div>
                )}

                <div className="dishes-list">
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ background: '#f0f0f0', textAlign: 'left' }}>
                                <th style={{ padding: '1rem' }}>Name</th>
                                <th style={{ padding: '1rem' }}>Price</th>
                                <th style={{ padding: '1rem' }}>Status</th>
                                <th style={{ padding: '1rem' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {myDishes?.map(dish => (
                                <tr key={dish._id} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '1rem' }}>{dish.name}</td>
                                    <td style={{ padding: '1rem' }}>₹{dish.price}</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{ color: dish.isAvailable ? 'green' : 'red' }}>
                                            {dish.isAvailable ? 'Active' : 'Unavailable'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <button onClick={() => handleEditDish(dish)} style={{ marginRight: '0.5rem', cursor: 'pointer' }}>Edit</button>
                                        <button onClick={() => handleDeleteDish(dish._id)} style={{ color: 'red', cursor: 'pointer' }}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            {/* Earnings & Wallet Section */}
            <div className="earnings-section" style={{ marginTop: '3rem' }}>
                <h2>Earnings & Wallet 💰</h2>
                {earnings ? (
                    <div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginTop: '1rem' }}>
                            <div style={{ padding: '1.2rem', background: '#e8f5e9', borderRadius: '8px', textAlign: 'center' }}>
                                <p style={{ color: '#666', fontSize: '0.85rem' }}>Total Revenue</p>
                                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2e7d32' }}>₹{earnings.totalRevenue}</p>
                            </div>
                            <div style={{ padding: '1.2rem', background: '#fff3e0', borderRadius: '8px', textAlign: 'center' }}>
                                <p style={{ color: '#666', fontSize: '0.85rem' }}>Platform Fee (15%)</p>
                                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#e65100' }}>₹{earnings.platformCommission}</p>
                            </div>
                            <div style={{ padding: '1.2rem', background: '#e3f2fd', borderRadius: '8px', textAlign: 'center' }}>
                                <p style={{ color: '#666', fontSize: '0.85rem' }}>Net Earnings</p>
                                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1565c0' }}>₹{earnings.netEarnings}</p>
                            </div>
                            <div style={{ padding: '1.2rem', background: '#f3e5f5', borderRadius: '8px', textAlign: 'center' }}>
                                <p style={{ color: '#666', fontSize: '0.85rem' }}>Wallet Balance</p>
                                <p style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#7b1fa2' }}>₹{earnings.walletBalance}</p>
                            </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginTop: '2rem' }}>
                            {/* Payout Request */}
                            <div style={{ background: '#f9f9f9', padding: '1.5rem', borderRadius: '8px' }}>
                                <h3>Request Payout</h3>
                                <form onSubmit={handlePayout}>
                                    <input
                                        type="number" placeholder="Amount (₹)" required min="1"
                                        value={payoutAmount} onChange={e => setPayoutAmount(e.target.value)}
                                        style={{ padding: '0.8rem', width: '100%', marginBottom: '0.8rem' }}
                                    />
                                    <input
                                        type="text" placeholder="UPI ID (e.g., name@upi)" required
                                        value={payoutUpi} onChange={e => setPayoutUpi(e.target.value)}
                                        style={{ padding: '0.8rem', width: '100%', marginBottom: '0.8rem' }}
                                    />
                                    <button type="submit" style={{ padding: '0.8rem 1.5rem', background: '#7b1fa2', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '100%' }}>
                                        Request Payout
                                    </button>
                                </form>
                            </div>

                            {/* Payout History */}
                            <div style={{ background: '#f9f9f9', padding: '1.5rem', borderRadius: '8px' }}>
                                <h3>Payout History</h3>
                                {earnings.payoutHistory && earnings.payoutHistory.length > 0 ? (
                                    <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                        {earnings.payoutHistory.map((p, i) => (
                                            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #eee' }}>
                                                <span>₹{p.amount}</span>
                                                <span style={{ color: p.status === 'completed' ? 'green' : p.status === 'pending' ? '#f59e0b' : 'red' }}>
                                                    {p.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : <p>No payouts yet.</p>}
                            </div>
                        </div>
                    </div>
                ) : <p>Loading earnings...</p>}
            </div>
        </div>
    );
};

export default ChefDashboard;
