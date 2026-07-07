import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Box from '@mui/material/Box';

// Import Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Services from './pages/Services';
import ProviderDetails from './pages/ProviderDetails';
import Booking from './pages/Booking';
import OrderTracking from './pages/OrderTracking';
import CustomerDashboard from './pages/CustomerDashboard';
import ProviderDashboard from './pages/ProviderDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import PrintableInvoice from './pages/PrintableInvoice';
import About from './pages/About';
import Contact from './pages/Contact';

// Import Components & Context
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import RouteGuard from './components/RouteGuard';
import { AuthProvider } from './context/AuthContext';
import { ThemeModeProvider } from './context/ThemeContext';

const App = () => {
  return (
    <Router>
      <ThemeModeProvider>
        <AuthProvider>
          <Box display="flex" flexDirection="column" minHeight="100vh">
            <Navbar />
            <Box component="main" flexGrow={1}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/services" element={<Services />} />
                <Route path="/providers/:id" element={<ProviderDetails />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />

                {/* Protected Customer Routes */}
                <Route 
                  path="/customer-dashboard" 
                  element={
                    <RouteGuard allowedRoles={['customer', 'admin']}>
                      <CustomerDashboard />
                    </RouteGuard>
                  } 
                />
                <Route 
                  path="/booking" 
                  element={
                    <RouteGuard allowedRoles={['customer', 'admin']}>
                      <Booking />
                    </RouteGuard>
                  } 
                />

                {/* Protected Shared Authenticated Routes */}
                <Route 
                  path="/orders/:id" 
                  element={
                    <RouteGuard>
                      <OrderTracking />
                    </RouteGuard>
                  } 
                />
                <Route 
                  path="/invoice/:id" 
                  element={
                    <RouteGuard>
                      <PrintableInvoice />
                    </RouteGuard>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <RouteGuard>
                      <Profile />
                    </RouteGuard>
                  } 
                />
                <Route 
                  path="/notifications" 
                  element={
                    <RouteGuard>
                      <Notifications />
                    </RouteGuard>
                  } 
                />

                {/* Protected Provider Routes */}
                <Route 
                  path="/provider-dashboard" 
                  element={
                    <RouteGuard allowedRoles={['provider', 'admin']}>
                      <ProviderDashboard />
                    </RouteGuard>
                  } 
                />

                {/* Protected Admin Routes */}
                <Route 
                  path="/admin-dashboard" 
                  element={
                    <RouteGuard allowedRoles={['admin']}>
                      <AdminDashboard />
                    </RouteGuard>
                  } 
                />

                {/* Fallback Route */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Box>
            <Footer />
          </Box>
        </AuthProvider>
      </ThemeModeProvider>
    </Router>
  );
};

export default App;
