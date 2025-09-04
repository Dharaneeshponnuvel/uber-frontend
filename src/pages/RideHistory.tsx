import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Star, Calendar, Filter, DollarSign } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface Ride {
  id: string;
  created_at: string;
  pickup_address: string;
  dropoff_address: string;
  final_fare: number;
  estimated_fare: number;
  status: string;
  distance: number;
  ride_type: string;
  driver?: {
    first_name: string;
    last_name: string;
    phone: string;
  };
  rating?: Array<{
    rating: number;
    comment: string;
  }>;
}

const RideHistory: React.FC = () => {
  const { user, token } = useAuth();
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({
    totalRides: 0,
    totalSpent: 0,
    averageRating: 0
  });

  const API_BASE_URL = 'https://uber-backend-ar0c.onrender.com/api';

  useEffect(() => {
    const fetchRideHistory = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/rides/history`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const userRides = response.data.rides;
        setRides(userRides);

        // Calculate stats
        const totalRides = userRides.length;
        const totalSpent = userRides.reduce((sum: number, ride: Ride) => 
          sum + (ride.final_fare || ride.estimated_fare || 0), 0
        );

        setStats({
          totalRides,
          totalSpent,
          averageRating: 4.8 // Mock rating
        });
      } catch (error) {
        console.error('Error fetching ride history:', error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchRideHistory();
    }
  }, [token]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      case 'requested':
        return 'status-requested';
      case 'accepted':
        return 'status-accepted';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredRides = rides.filter(ride => {
    if (filter === 'all') return true;
    return ride.status === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ride history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {user?.userType === 'driver' ? 'Trip History' : 'Ride History'}
          </h1>
          <p className="text-gray-600 mt-2">View all your past rides and trips</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="card hover:scale-105 transform transition-all duration-200">
            <div className="flex items-center">
              <div className="p-3 bg-primary-100 rounded-lg">
                <Calendar className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.totalRides}</p>
                <p className="text-gray-600">Total {user?.userType === 'driver' ? 'Trips' : 'Rides'}</p>
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
                  ${stats.totalSpent.toFixed(2)}
                </p>
                <p className="text-gray-600">
                  {user?.userType === 'driver' ? 'Total Earned' : 'Total Spent'}
                </p>
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
                  {stats.averageRating.toFixed(1)}
                </p>
                <p className="text-gray-600">Average Rating</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter and Rides List */}
        <div className="card">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 md:mb-0">Recent Activity</h2>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Rides</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="requested">Requested</option>
              </select>
            </div>
          </div>

          {filteredRides.length === 0 ? (
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No rides found for the selected filter.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRides.map((ride) => (
                <div
                  key={ride.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`status-badge ${getStatusColor(ride.status)}`}>
                        {ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(ride.created_at).toLocaleDateString()} at {new Date(ride.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <div className="space-y-1 mb-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-1 text-green-500" />
                        <span className="truncate">{ride.pickup_address}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-1 text-red-500" />
                        <span className="truncate">{ride.dropoff_address}</span>
                      </div>
                    </div>
                    
                    {ride.driver && (
                      <p className="text-sm text-gray-500">
                        Driver: {ride.driver.first_name} {ride.driver.last_name}
                      </p>
                    )}
                    
                    {ride.rating && ride.rating[0] && (
                      <div className="flex items-center mt-2">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        <span className="text-sm text-gray-600">
                          Rated {ride.rating[0].rating}/5
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right ml-4">
                    <p className="text-lg font-bold text-gray-900">
                      ${(ride.final_fare || ride.estimated_fare || 0).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {ride.distance} miles
                    </p>
                    <p className="text-xs text-gray-400 capitalize">
                      {ride.ride_type}
                    </p>
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

export default RideHistory;
