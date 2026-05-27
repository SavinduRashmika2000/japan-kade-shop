import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import StaffDashboard from './pages/dashboards/StaffDashboard';
import CustomerDashboard from './pages/dashboards/CustomerDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute roles={['ROLE_ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          