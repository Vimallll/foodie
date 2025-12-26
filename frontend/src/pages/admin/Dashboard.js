import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import './Admin.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  if (!stats) {
    return <div className="error">Failed to load dashboard</div>;
  }

  return (
    <div className="admin-page">
      <div className="container">
        <h1>Admin Dashboard</h1>

        <div className="admin-nav">
          <Link to="/admin/foods" className="admin-nav-link">
            Manage Foods
          </Link>
          <Link to="/admin/categories" className="admin-nav-link">
            Manage Categories
          </Link>
          <Link to="/admin/restaurants" className="admin-nav-link">
            Manage Restaurants
          </Link>
          <Link to="/admin/orders" className="admin-nav-link">
            Manage Orders
          </Link>
          <Link to="/admin/users" className="admin-nav-link">
            Manage Users
          </Link>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Users</h3>
            <div className="stat-value">{stats.totalUsers}</div>
          </div>
          <div className="stat-card">
            <h3>Total Foods</h3>
            <div className="stat-value">{stats.totalFoods}</div>
          </div>
          <div className="stat-card">
            <h3>Total Orders</h3>
            <div className="stat-value">{stats.totalOrders}</div>
          </div>
          <div className="stat-card">
            <h3>Total Revenue</h3>
            <div className="stat-value">${stats.totalRevenue.toFixed(2)}</div>
          </div>
          <div className="stat-card">
            <h3>Pending Orders</h3>
            <div className="stat-value">{stats.orders.pending}</div>
          </div>
          <div className="stat-card">
            <h3>Preparing Orders</h3>
            <div className="stat-value">{stats.orders.preparing}</div>
          </div>
          <div className="stat-card">
            <h3>Delivered Orders</h3>
            <div className="stat-value">{stats.orders.delivered}</div>
          </div>
          <div className="stat-card">
            <h3>Total Categories</h3>
            <div className="stat-value">{stats.totalCategories}</div>
          </div>
          <div className="stat-card">
            <h3>Total Restaurants</h3>
            <div className="stat-value">{stats.totalRestaurants}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

