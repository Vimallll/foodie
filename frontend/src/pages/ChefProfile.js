import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';

const ChefProfile = () => {
    const { id } = useParams();
    const [chef, setChef] = useState(null);
    const [menu, setMenu] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchChefData = async () => {
            try {
                const response = await api.get(`/chefs/${id}`);
                if (response.data.success) {
                    setChef(response.data.data);
                    setMenu(response.data.data.menu || []);
                }
            } catch (error) {
                console.error('Error fetching chef:', error);
                toast.error('Failed to load chef profile');
            } finally {
                setLoading(false);
            }
        };

        fetchChefData();
    }, [id]);

    const handleAddToCart = async (foodId) => {
        // Simple Add to Cart logic reused from Foods page
        // In a real app, you might want to check for mixed cart here or let the backend handle it
        try {
            await api.post('/cart', { foodId, quantity: 1 });
            toast.success('Added to cart');
            // Trigger cart update via context if available (not implemented here but implicit in Navbar)
            window.location.reload(); // Temporary to update cart count
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add to cart');
        }
    };

    if (loading) return <div className="loading">Loading Chef Profile...</div>;
    if (!chef) return <div className="error">Chef not found</div>;

    return (
        <div className="chef-profile-page" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            {/* Chef Header */}
            <div className="chef-header" style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginBottom: '3rem', padding: '2rem', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                <div className="chef-avatar" style={{ width: '150px', height: '150px', borderRadius: '50%', background: '#f0f0f0', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '4rem' }}>
                    👩‍🍳
                </div>
                <div className="chef-info">
                    <h1 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {chef.chefProfile?.kitchenName || chef.name + "'s Kitchen"}
                        {chef.chefProfile?.isVerified && (
                            <span title="Verified Home Chef" style={{ fontSize: '1.2rem', color: '#4caf50' }}>✅</span>
                        )}
                    </h1>
                    <p style={{ color: '#666', fontSize: '1.1rem' }}>{chef.chefProfile?.bio || 'Passionate Home Chef'}</p>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem' }}>
                        <span className="badge" style={{ background: '#fff3e0', color: '#ef6c00', padding: '0.4rem 0.8rem', borderRadius: '4px' }}>
                            ⭐ {chef.chefProfile?.rating || 'New'} Rating
                        </span>
                        <span className="badge" style={{ background: '#e8f5e9', color: '#2e7d32', padding: '0.4rem 0.8rem', borderRadius: '4px' }}>
                            🕒 {chef.chefProfile?.experience || 'Experienced'}
                        </span>
                        {chef.chefProfile?.fssaiLicenseNumber && (
                            <span className="badge" style={{ background: '#e3f2fd', color: '#0277bd', padding: '0.4rem 0.8rem', borderRadius: '4px' }}>
                                📜 FSSAI: {chef.chefProfile.fssaiLicenseNumber}
                            </span>
                        )}
                        <span className="badge" style={{ background: '#f3e5f5', color: '#7b1fa2', padding: '0.4rem 0.8rem', borderRadius: '4px' }}>
                            🛵 {chef.chefProfile?.deliveryMode === 'self' ? `Self Delivery (${chef.chefProfile.deliveryRadius}km)` : 'Platform Delivery'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Menu Section */}
            <div className="chef-menu">
                <h2 style={{ marginBottom: '1.5rem', borderBottom: '2px solid #ff4757', display: 'inline-block', paddingBottom: '0.5rem' }}>Today's Menu</h2>

                <div className="menu-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
                    {menu.length > 0 ? menu.map(dish => (
                        <div key={dish._id} className="food-card" style={{ border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden', background: '#fff' }}>
                            <img src={dish.image || 'https://via.placeholder.com/300?text=Delicious+Food'} alt={dish.name} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                            <div style={{ padding: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                    <h3 style={{ margin: '0', fontSize: '1.2rem' }}>{dish.name}</h3>
                                    <span style={{ background: '#ff4757', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 'bold' }}>₹{dish.price}</span>
                                </div>
                                <p style={{ color: '#666', fontSize: '0.9rem', margin: '0.5rem 0' }}>{dish.description}</p>
                                <button
                                    onClick={() => handleAddToCart(dish._id)}
                                    className="btn btn-primary"
                                    style={{ width: '100%', marginTop: '1rem', padding: '0.6rem', background: '#ff4757', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                                >
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    )) : (
                        <p>No dishes available at the moment.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChefProfile;
