import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import '../admin/Admin.css';

const RestaurantAdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, restaurantRes] = await Promise.all([
        api.get('/restaurant-admin/stats'),
        api.get('/restaurant-admin/restaurant'),
      ]);
      setStats(statsRes.data.stats);
      setRestaurant(restaurantRes.data.restaurant);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="admin-page">
      <div className="container">
        <h1>Restaurant Dashboard</h1>
        {restaurant && (
          <div className="restaurant-info">
            <h2>{restaurant.name}</h2>
            <p>{restaurant.description}</p>
          </div>
        )}

        <div className="admin-nav">
          <Link to="/restaurant-admin/foods" className="admin-nav-link">
            Manage Foods
          </Link>
          <Link to="/restaurant-admin/orders" className="admin-nav-link">
            Manage Orders
          </Link>
        </div>

        {stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Foods</h3>
              <p className="stat-number">{stats.totalFoods}</p>
            </div>
            <div className="stat-card">
              <h3>Total Orders</h3>
              <p className="stat-number">{stats.totalOrders}</p>
            </div>
            <div className="stat-card">
              <h3>Pending Orders</h3>
              <p className="stat-number">{stats.pendingOrders}</p>
            </div>
            <div className="stat-card">
              <h3>Preparing</h3>
              <p className="stat-number">{stats.preparingOrders}</p>
            </div>
            <div className="stat-card">
              <h3>Ready for Delivery</h3>
              <p className="stat-number">{stats.readyOrders}</p>
            </div>
            <div className="stat-card">
              <h3>Total Revenue</h3>
              <p className="stat-number">${stats.totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantAdminDashboard;

