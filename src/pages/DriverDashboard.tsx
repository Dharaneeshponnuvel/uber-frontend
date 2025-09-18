import React, { useState, useEffect } from 'react';
import { Car, DollarSign, Star, MapPin, Clock, Check, X, Users } from 'lucide-react';
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
      
      // Update stats
      setStats(prev => ({
        ...prev,
        completedRides: prev.completedRides + 1
      }));
    } catch (error) {
      console.error('Error accepting ride:', error);
    } finally {
      setAcceptingRide(null);
    }
  };

  const toggleOnlineStatus = () => {
    setIsOnline(!isOnline);
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
              <div className="p-3 bg-blue-100 rounded-lg">
                <Car className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.completedRides}</p>
                <p className="text-gray-600">Completed Rides</p>
              </div>
            </div>
          </div>

          <div className="card hover:scale-105 transform transition-all duration-200">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  ${stats.totalEarnings.toFixed(2)}
                </p>
                <p className="text-gray-600">Total Earnings</p>
              </div>
            </div>
          </div>

          <div className="card hover:scale-105 transform transition-all duration-200">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {stats.averageRating > 0 ? stats.averageRating.toFixed(1) : 'N/A'}
                </p>
                <p className="text-gray-600">Average Rating</p>
              </div>
            </div>
          </div>

          <div className="card hover:scale-105 transform transition-all duration-200">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{availableRides.length}</p>
                <p className="text-gray-600">Available Rides</p>
              </div>
            </div>
          </div>
        </div>

        {/* Available Ride Requests */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Available Ride Requests</h2>
            {!isOnline && (
              <p className="text-amber-600 bg-amber-50 px-3 py-1 rounded-full text-sm">
                Go online to see ride requests
              </p>
            )}
          </div>

          {!isOnline ? (
            <div className="text-center py-8">
              <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">
                You're currently offline. Toggle your status to start receiving ride requests.
              </p>
              <button
                onClick={toggleOnlineStatus}
                className="btn-primary"
              >
                Go Online
              </button>
            </div>
          ) : availableRides.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No ride requests at the moment.</p>
              <p className="text-sm text-gray-500">New requests will appear here automatically.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {availableRides.map((ride) => (
                <div
                  key={ride.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-all duration-200 hover:shadow-md"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-3">
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                          {ride.ride_type.charAt(0).toUpperCase() + ride.ride_type.slice(1)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(ride.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center text-sm">
                          <MapPin className="h-4 w-4 mr-2 text-green-500" />
                          <span className="text-gray-700">Pickup: {ride.pickup_address}</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <MapPin className="h-4 w-4 mr-2 text-red-500" />
                          <span className="text-gray-700">Drop-off: {ride.dropoff_address}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>Distance: {ride.distance} miles</span>
                        <span>Rider: {ride.rider.first_name} {ride.rider.last_name}</span>
                      </div>
                    </div>
                    
                    <div className="text-right ml-4">
                      <p className="text-2xl font-bold text-green-600 mb-2">
                        ${ride.estimated_fare.toFixed(2)}
                      </p>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleAcceptRide(ride.id)}
                          disabled={acceptingRide === ride.id}
                          className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors"
                        >
                          {acceptingRide === ride.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                          ) : (
                            <Check className="h-4 w-4 mr-1" />
                          )}
                          Accept
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;
