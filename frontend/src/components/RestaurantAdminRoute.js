import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const RestaurantAdminRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useContext(AuthContext);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (user?.role !== 'restaurant_admin' && user?.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return children;
};

export default RestaurantAdminRoute;

