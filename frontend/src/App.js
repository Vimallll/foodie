import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute";
import RestaurantAdminRoute from "./components/RestaurantAdminRoute";
import DeliveryRoute from "./components/DeliveryRoute";
import UserRoute from "./components/UserRoute";
import ChefRoute from "./components/ChefRoute"; // Import ChefRoute
import ChatbotPopup from "./components/chatbot/ChatbotPopup";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import DeliveryLogin from "./pages/DeliveryLogin";
import DeliverySignup from "./pages/DeliverySignup";
import VerifyOTP from "./pages/VerifyOTP";
import VerifyEmail from "./pages/VerifyEmail";
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
import AdminDeliveryPartners from "./pages/admin/DeliveryPartners";
import AdminHomeChefs from "./pages/admin/HomeChefs";
import SuperAdminDashboard from "./pages/admin/SuperAdminDashboard";

import RestaurantAdminDashboard from "./pages/restaurantAdmin/Dashboard";
import RestaurantAdminFoods from "./pages/restaurantAdmin/Foods";
import RestaurantAdminOrders from "./pages/restaurantAdmin/Orders";

import DeliveryDashboard from "./pages/delivery/Dashboard";
import DeliveryProfile from "./pages/delivery/Profile";

import HomeKitchen from "./pages/HomeKitchen";
import RegisterChef from "./pages/RegisterChef";
import ChefProfile from "./pages/ChefProfile";
import ChefDashboard from "./pages/chef/Dashboard";

import TermsAndConditions from "./pages/TermsAndConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import RefundPolicy from "./pages/RefundPolicy";
import FAQ from "./pages/FAQ";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import Careers from "./pages/Careers";
import Blog from "./pages/Blog";

function App() {
  return (
    <Router>
      <div className="App" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />

        <main style={{ flex: 1 }}>
          <Routes>
            {/* Public Routes - Wrapped in UserRoute to redirect admins */}
            <Route path="/" element={<UserRoute><Home /></UserRoute>} />
            <Route path="/login" element={<UserRoute><Login /></UserRoute>} />
            <Route path="/signup" element={<UserRoute><Signup /></UserRoute>} />
            <Route path="/delivery/login" element={<UserRoute><DeliveryLogin /></UserRoute>} />
            <Route path="/delivery/signup" element={<UserRoute><DeliverySignup /></UserRoute>} />
            <Route path="/delivery/verify-otp" element={<UserRoute><VerifyOTP /></UserRoute>} />
            <Route path="/delivery/verify-email/:token" element={<UserRoute><VerifyEmail /></UserRoute>} />
            <Route path="/foods" element={<UserRoute><Foods /></UserRoute>} />
            <Route path="/foods/:id" element={<UserRoute><FoodDetails /></UserRoute>} />
            <Route path="/home-kitchen" element={<UserRoute><HomeKitchen /></UserRoute>} />
            <Route path="/register-chef" element={<PrivateRoute><RegisterChef /></PrivateRoute>} />
            <Route path="/chef/:id" element={<UserRoute><ChefProfile /></UserRoute>} />
            <Route path="/chef/dashboard" element={<PrivateRoute><ChefRoute><ChefDashboard /></ChefRoute></PrivateRoute>} />

            {/* Footer Pages - Accessible to all */}
            <Route path="/terms" element={<TermsAndConditions />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/refund" element={<RefundPolicy />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/blog" element={<Blog />} />

            <Route
              path="/cart"
              element={
                <PrivateRoute>
                  <UserRoute>
                    <Cart />
                  </UserRoute>
                </PrivateRoute>
              }
            />

            <Route
              path="/checkout"
              element={
                <PrivateRoute>
                  <UserRoute>
                    <Checkout />
                  </UserRoute>
                </PrivateRoute>
              }
            />

            <Route
              path="/orders"
              element={
                <PrivateRoute>
                  <UserRoute>
                    <Orders />
                  </UserRoute>
                </PrivateRoute>
              }
            />

            <Route
              path="/orders/:id"
              element={
                <PrivateRoute>
                  <UserRoute>
                    <OrderDetails />
                  </UserRoute>
                </PrivateRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <UserRoute>
                    <Profile />
                  </UserRoute>
                </PrivateRoute>
              }
            />

            {/* Super Admin Route */}
            <Route
              path="/super-admin/dashboard"
              element={
                <AdminRoute>
                  <SuperAdminDashboard />
                </AdminRoute>
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

            <Route
              path="/admin/delivery-partners"
              element={
                <AdminRoute>
                  <AdminDeliveryPartners />
                </AdminRoute>
              }
            />

            <Route
              path="/admin/home-chefs"
              element={
                <AdminRoute>
                  <AdminHomeChefs />
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
            <Route
              path="/delivery/profile"
              element={
                <DeliveryRoute>
                  <DeliveryProfile />
                </DeliveryRoute>
              }
            />
          </Routes>
        </main>

        <Footer />

        {/* ✅ CHATBOT (GLOBAL FLOATING BUTTON) */}
        <ChatbotPopup />

        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </Router>
  );
}

export default App;
