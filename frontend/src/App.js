import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Components
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute";
import RestaurantAdminRoute from "./components/RestaurantAdminRoute";
import DeliveryRoute from "./components/DeliveryRoute";
import ChatbotPopup from "./components/chatbot/ChatbotPopup";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Foods from "./pages/Foods";
import FoodDetails from "./pages/FoodDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import Profile from "./pages/Profile";

import AdminDashboard from "./pages/admin/Dashboard";
import AdminFoods from "./pages/admin/Foods";
import AdminOrders from "./pages/admin/Orders";
import AdminUsers from "./pages/admin/Users";
import AdminCategories from "./pages/admin/Categories";
import AdminRestaurants from "./pages/admin/Restaurants";

import RestaurantAdminDashboard from "./pages/restaurantAdmin/Dashboard";
import RestaurantAdminFoods from "./pages/restaurantAdmin/Foods";
import RestaurantAdminOrders from "./pages/restaurantAdmin/Orders";

import DeliveryDashboard from "./pages/delivery/Dashboard";

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/foods" element={<Foods />} />
          <Route path="/foods/:id" element={<FoodDetails />} />

          <Route
            path="/cart"
            element={
              <PrivateRoute>
                <Cart />
              </PrivateRoute>
            }
          />

          <Route
            path="/checkout"
            element={
              <PrivateRoute>
                <Checkout />
              </PrivateRoute>
            }
          />

          <Route
            path="/orders"
            element={
              <PrivateRoute>
                <Orders />
              </PrivateRoute>
            }
          />

          <Route
            path="/orders/:id"
            element={
              <PrivateRoute>
                <OrderDetails />
              </PrivateRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/foods"
            element={
              <AdminRoute>
                <AdminFoods />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/orders"
            element={
              <AdminRoute>
                <AdminOrders />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <AdminRoute>
                <AdminUsers />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/categories"
            element={
              <AdminRoute>
                <AdminCategories />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/restaurants"
            element={
              <AdminRoute>
                <AdminRestaurants />
              </AdminRoute>
            }
          />

          {/* Restaurant Admin Routes */}
          <Route
            path="/restaurant-admin/dashboard"
            element={
              <RestaurantAdminRoute>
                <RestaurantAdminDashboard />
              </RestaurantAdminRoute>
            }
          />

          <Route
            path="/restaurant-admin/foods"
            element={
              <RestaurantAdminRoute>
                <RestaurantAdminFoods />
              </RestaurantAdminRoute>
            }
          />

          <Route
            path="/restaurant-admin/orders"
            element={
              <RestaurantAdminRoute>
                <RestaurantAdminOrders />
              </RestaurantAdminRoute>
            }
          />

          {/* Delivery */}
          <Route
            path="/delivery/dashboard"
            element={
              <DeliveryRoute>
                <DeliveryDashboard />
              </DeliveryRoute>
            }
          />
        </Routes>

        {/* ✅ CHATBOT (GLOBAL FLOATING BUTTON) */}
        <ChatbotPopup />

        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </Router>
  );
}

export default App;
