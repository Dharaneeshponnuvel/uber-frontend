import React, { useState, useEffect } from 'react';
import { Car, DollarSign, Star, MapPin, Clock, Check, X, Users, Navigation } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import axios from 'axios';

interface RideRequest {
  id: string;
  created_at: string;
  pickup_address: string;
  dropoff_address: string;
  estimated_fare: number;
  distance: number;
  ride_type: string;
  rider: {
    first_name: string;
    last_name: string;
    phone: string;
  };
}

interface DriverStats {
  completedRides: number;
  totalEarnings: number;
  averageRating: number;
  totalRatings: number;
}

const DriverDashboard: React.FC = () => {
  const { user, token } = useAuth();
  const { socket, isConnected } = useSocket();
  const [availableRides, setAvailableRides] = useState<RideRequest[]>([]);
  const [activeRide, setActiveRide] = useState<any>(null);
  const [stats, setStats] = useState<DriverStats>({
    completedRides: 0,
    totalEarnings: 0,
    averageRating: 0,
    totalRatings: 0
  });
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const [acceptingRide, setAcceptingRide] = useState<string | null>(null);

  const API_BASE_URL = 'https://uber-backend-ar0c.onrender.com/api';

  useEffect(() => {
    const fetchDriverData = async () => {
      try {
        // Fetch available rides
        const ridesResponse = await axios.get(`${API_BASE_URL}/drivers/available-rides`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAvailableRides(ridesResponse.data.rides);

        // Fetch current active ride
        const currentRideResponse = await axios.get(`${API_BASE_URL}/rides/current`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setActiveRide(currentRideResponse.data.ride);

        // Fetch driver stats
        const statsResponse = await axios.get(`${API_BASE_URL}/drivers/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(statsResponse.data);
      } catch (error) {
        console.error('Error fetching driver data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (token && user?.userType === 'driver') {
      fetchDriverData();
    }
  }, [token, user]);

  useEffect(() => {
    if (socket && isOnline) {
      // Listen for new ride requests
      socket.on('new-ride-request', (rideData) => {
        setAvailableRides(prev => [rideData, ...prev]);
      });

      // Listen for rides being taken by other drivers
      socket.on('ride-taken', (data) => {
        setAvailableRides(prev => prev.filter(ride => ride.id !== data.rideId));
      });

      return () => {
        socket.off('new-ride-request');
        socket.off('ride-taken');
      };
    }
  }, [socket, isOnline]);

  const handleAcceptRide = async (rideId: string) => {
    setAcceptingRide(rideId);
    
    try {
      await axios.post(`${API_BASE_URL}/rides/${rideId}/accept`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Remove the accepted ride from available rides
      setAvailableRides(prev => prev.filter(ride => ride.id !== rideId));
      
      // Fetch updated active ride
      const currentRideResponse = await axios.get(`${API_BASE_URL}/rides/current`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setActiveRide(currentRideResponse.data.ride);
    } catch (error) {
      console.error('Error accepting ride:', error);
    } finally {
      setAcceptingRide(null);
    }
  };

  const toggleOnlineStatus = () => {
    setIsOnline(!isOnline);
  };

  const completeRide = async () => {
    if (!activeRide) return;

    try {
      await axios.patch(`${API_BASE_URL}/rides/${activeRide.id}/complete`, {
        finalFare: activeRide.estimated_fare
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setActiveRide(null);
      
      // Refresh stats
      const statsResponse = await axios.get(`${API_BASE_URL}/drivers/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(statsResponse.data);
    } catch (error) {
      console.error('Error completing ride:', error);
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Driver Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Welcome back, {user?.firstName}! Ready to earn some money?
            </p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <button
              onClick={toggleOnlineStatus}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                isOnline 
                  ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                  : 'bg-red-100 text-red-700 hover:bg-red-200'
              }`}
            >
              <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>{isOnline ? 'Online' : 'Offline'}</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="card hover:scale-105 transform transition-all duration-200">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100
