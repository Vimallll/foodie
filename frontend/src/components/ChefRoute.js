import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ChefRoute = ({ children }) => {
    const { user, loading } = useContext(AuthContext);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (user && user.role === 'homeChef') {
        return children;
    }

    return <Navigate to="/" />;
};

export default ChefRoute;
