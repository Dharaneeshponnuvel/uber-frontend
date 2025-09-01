import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import RideBooking from './pages/RideBooking';
import DriverDashboard from './pages/DriverDashboard';
import RideHistory from './pages/RideHistory';
import PaymentHistory from './pages/PaymentHistory';
import RideTracking from './pages/RideTracking';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading RideShare...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/dashboard" />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={
            user ? (
              user.userType === 'driver' ? <DriverDashboard /> : <Navigate to="/ride-history" />
            ) : (
              <Navigate to="/login" />
            )
          } />
          
          <Route path="/book-ride" element={
            user?.userType === 'rider' ? <RideBooking /> : <Navigate to="/login" />
          } />
          
          <Route path="/ride-tracking" element={
            user?.userType === 'rider' ? <RideTracking /> : <Navigate to="/login" />
          } />
          
          <Route path="/ride-history" element={
            user ? <RideHistory /> : <Navigate to="/login" />
          } />
          
          <Route path="/payment-history" element={
            user?.userType === 'rider' ? <PaymentHistory /> : <Navigate to="/login" />
          } />
        </Routes>
      </main>
    </div>
  );
}

export default App;