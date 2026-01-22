import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useContext(AuthContext);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Only superAdmin can access admin dashboard routes
  if (user?.role !== 'superAdmin') {
    return <Navigate to="/" />;
  }

  return children;
};

export default AdminRoute;

