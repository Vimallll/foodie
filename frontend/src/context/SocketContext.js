import React, { createContext, useState, useEffect, useContext } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { user, isAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        let newSocket;

        if (isAuthenticated && user) {
            // Connect to socket server
            // Use environment variable or default to localhost:5000
            const socketUrl = process.env.REACT_APP_API_URL
                ? process.env.REACT_APP_API_URL.replace('/api', '')
                : 'http://localhost:5000';

            newSocket = io(socketUrl, {
                transports: ['websocket'],
                reconnection: true,
            });

            setSocket(newSocket);

            // Join room based on role
            newSocket.on('connect', () => {
                console.log('Socket connected:', newSocket.id);

                const joinData = {
                    userId: user._id,
                    role: user.role,
                };

                if (user.role === 'manager' && user.restaurant) {
                    joinData.restaurantId = user.restaurant._id || user.restaurant;
                }

                newSocket.emit('join-room', joinData);
            });

            // Listen for new orders (Restaurant Manager)
            newSocket.on('new-order', (data) => {
                if (user.role === 'manager') {
                    // Play notification sound if desired
                    // const audio = new Audio('/notification.mp3');
                    // audio.play().catch(e => console.log('Audio play failed', e));

                    toast.info(`New Order #${data.orderId.slice(-6)} Received!`, {
                        position: "top-right",
                        autoClose: 5000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        onClick: () => navigate('/restaurant-admin/orders')
                    });
                }
            });

            // Listen for order updates (User/Delivery/Admin)
            newSocket.on('order-updated', (data) => {
                // You can add more logic here for other roles
                console.log('Order updated:', data);
            });

        } else {
            setSocket(null);
        }

        return () => {
            if (newSocket) newSocket.disconnect();
        };
    }, [isAuthenticated, user, navigate]); // Re-run when auth state changes

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};
