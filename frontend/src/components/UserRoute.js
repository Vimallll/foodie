import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const UserRoute = ({ children }) => {
    const { isAuthenticated, loading, user } = useContext(AuthContext);

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    // If user is logged in as superAdmin, redirect to admin dashboard
    if (isAuthenticated && user?.role === 'superAdmin') {
        return <Navigate to="/admin/dashboard" />;
    }

    // If user is logged in as homeChef, redirect to chef dashboard
    if (isAuthenticated && user?.role === 'homeChef') {
        return <Navigate to="/chef/dashboard" />;
    }

    // Otherwise, allow access (public users, regular users, delivery partners)
    return children;
};

export default UserRoute;
