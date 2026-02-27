import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const HomeKitchen = () => {
    const { user } = useContext(AuthContext);
    const [chefs, setChefs] = useState([]);
    const [topDishes, setTopDishes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Chefs
                const chefsRes = await api.get('/chefs');
                if (chefsRes.data.success) {
                    setChefs(chefsRes.data.data);
                }

                // Fetch Top Home Dishes
                const dishesRes = await api.get('/foods?foodType=home&limit=6');
                if (dishesRes.data.success) {
                    setTopDishes(dishesRes.data.foods);
                }
            } catch (err) {
                console.error("Failed to load Home Kitchen data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="loading-spinner">Loading Home Kitchen...</div>;

    return (
        <div className="home-kitchen-container" style={{ padding: '2rem' }}>
            <div className="hk-hero" style={{
                background: 'linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url("/assets/home-kitchen-hero.jpg")',
                backgroundSize: 'cover',
                color: 'white',
                padding: '4rem 2rem',
                borderRadius: '12px',
                marginBottom: '3rem',
                textAlign: 'center'
            }}>
                <h1>Home Kitchen 🏠</h1>
                <p>Authentic homemade meals from your neighbors, delivered to you.</p>
                {user?.role === 'homeChef' ? (
                    <Link to="/chef/dashboard" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
                        Go to Dashboard
                    </Link>
                ) : user?.chefProfile?.chefStatus === 'pending' && user?.chefProfile?.kitchenName ? (
                    <button className="btn btn-secondary" disabled style={{ marginTop: '1rem', display: 'inline-block', opacity: 0.7, cursor: 'not-allowed' }}>
                        Application Pending ⏳
                    </button>
                ) : (
                    <Link to="/register-chef" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
                        Become a Home Chef
                    </Link>
                )}
            </div>

            <section className="featured-chefs">
                <h2>Featured Home Chefs</h2>
                <div className="chefs-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem', marginTop: '1rem' }}>
                    {chefs.length > 0 ? chefs.map(chef => (
                        <Link to={`/chef/${chef._id}`} key={chef._id} style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div className="chef-card" style={{ border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden', transition: 'transform 0.2s', background: 'white' }}>
                                <div style={{ height: '150px', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span style={{ fontSize: '3rem' }}>👩‍🍳</span>
                                </div>
                                <div style={{ padding: '1rem' }}>
                                    <h3 style={{ margin: '0 0 0.5rem 0' }}>{chef.chefProfile?.kitchenName || chef.name + "'s Kitchen"}</h3>
                                    <p style={{ color: '#666', fontSize: '0.9rem' }}>{chef.chefProfile?.specialties?.join(', ') || 'Home Cooked Meals'}</p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', alignItems: 'center' }}>
                                        <span className="rating">⭐ {chef.chefProfile?.rating || 'New'}</span>
                                        <span className="btn-text" style={{ color: '#ff4757', fontWeight: 'bold' }}>View Menu →</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    )) : (
                        <p>No home chefs found yet. Be the first!</p>
                    )}
                </div>
            </section>

            <section className="popular-dishes" style={{ marginTop: '4rem' }}>
                <h2>Popular Homemade Dishes</h2>
                <div className="dishes-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '2rem', marginTop: '1rem' }}>
                    {topDishes.map(dish => (
                        <div key={dish._id} className="food-card" style={{ border: '1px solid #eee', borderRadius: '8px', overflow: 'hidden' }}>
                            <img src={dish.image || 'https://via.placeholder.com/300?text=Delicious+Food'} alt={dish.name} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                            <div style={{ padding: '1rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                    <h3 style={{ margin: '0', fontSize: '1.2rem' }}>{dish.name}</h3>
                                    <span style={{ background: '#ff4757', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem' }}>₹{dish.price}</span>
                                </div>
                                <p style={{ color: '#666', fontSize: '0.9rem', margin: '0.5rem 0' }}>{dish.description.substring(0, 60)}...</p>
                                <p style={{ fontSize: '0.8rem', color: '#888' }}>By: {dish.chef?.name || 'Local Chef'}</p>
                                <Link to={`/foods/${dish._id}`} className="btn btn-outline" style={{ display: 'block', textAlign: 'center', marginTop: '1rem', border: '1px solid #ff4757', color: '#ff4757', padding: '0.5rem', borderRadius: '4px', textDecoration: 'none' }}>
                                    View Details
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default HomeKitchen;
