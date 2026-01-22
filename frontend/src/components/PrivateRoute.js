import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useContext(AuthContext);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Block delivery guys from accessing customer features
  if (user?.role === 'delivery') {
    return <Navigate to="/delivery/dashboard" />;
  }

  return children;
};

export default PrivateRoute;

