import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const DeliveryRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useContext(AuthContext);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (user?.role !== 'delivery' && user?.role !== 'admin') {
    return <Navigate to="/" />;
  }

  return children;
};

export default DeliveryRoute;

