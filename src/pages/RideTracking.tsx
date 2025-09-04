import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Car, Phone, Star, User, CheckCircle, CreditCard, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import PaymentModal from '../components/PaymentModal';
import axios from 'axios';

interface CurrentRide {
  id: string;
  status: string;
  pickup_address: string;
  dropoff_address: string;
  estimated_fare: number;
  final_fare?: number;
  driver?: {
    first_name: string;
    last_name: string;
    phone: string;
  };
}

const RideTracking: React.FC = () => {
  const { user, token } = useAuth();
  const { socket } = useSocket();
  const [currentRide, setCurrentRide] = useState<CurrentRide | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRating, setShowRating] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [rideCompleted, setRideCompleted] = useState(false);

  const API_BASE_URL = 'https://uber-backend-ar0c.onrender.com/api';

  useEffect(() => {
    const fetchCurrentRide = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/rides/current`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setCurrentRide(response.data.ride);
        
        if (response.data.ride?.status === 'completed') {
          setShowRating(true);
        }
      } catch (error) {
        console.error('Error fetching current ride:', error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchCurrentRide();
    }
  }, [token]);

  useEffect(() => {
    if (socket) {
      socket.on('ride-accepted', (data) => {
        setCurrentRide(prev => prev ? { ...prev, status: 'accepted', driver: data.driver } : null);
      });

      socket.on('ride-completed', (data) => {
        setCurrentRide(prev => prev ? { ...prev, status: 'completed', final_fare: data.finalFare } : null);
        setRideCompleted(true);
        setShowPayment(true);
      });

      socket.on('payment-completed', (data) => {
        setShowPayment(false);
        setShowRating(true);
      });

      return () => {
        socket.off('ride-accepted');
        socket.off('ride-completed');
        socket.off('payment-completed');
      };
    }
  }, [socket]);

  const handleRatingSubmit = async () => {
    if (!currentRide) return;

    try {
      await axios.post(`${API_BASE_URL}/users/rate`, {
        rideId: currentRide.id,
        driverId: currentRide.driver?.id,
        rating,
        comment
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setShowRating(false);
      // Don't clear current ride, just close rating modal
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  const handlePaymentSuccess = () => {
    setShowPayment(false);
    setShowRating(true);
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'requested':
        return {
          color: 'text-yellow-600 bg-yellow-100',
          message: 'Looking for a driver...',
          icon: <Clock className="h-5 w-5" />
        };
      case 'accepted':
        return {
          color: 'text-blue-600 bg-blue-100',
          message: 'Driver is on the way!',
          icon: <Car className="h-5 w-5" />
        };
      case 'started':
        return {
          color: 'text-green-600 bg-green-100',
          message: 'Trip in progress',
          icon: <MapPin className="h-5 w-5" />
        };
      case 'completed':
        return {
          color: 'text-green-600 bg-green-100',
          message: rideCompleted ? 'Trip completed - Payment required' : 'Trip completed',
          icon: <CheckCircle className="h-5 w-5" />
        };
      default:
        return {
          color: 'text-gray-600 bg-gray-100',
          message: 'Unknown status',
          icon: <Clock className="h-5 w-5" />
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ride information...</p>
        </div>
      </div>
    );
  }

  if (!currentRide) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Active Ride</h2>
          <p className="text-gray-600 mb-6">You don't have any active rides at the moment.</p>
          <Link
            to="/book-ride"
            className="btn-primary"
          >
            Book a New Ride
          </Link>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(currentRide.status);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Ride</h1>
          <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${statusInfo.color}`}>
            {statusInfo.icon}
            <span className="font-medium">{statusInfo.message}</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Ride Details */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Trip Details</h2>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-green-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Pickup</p>
                  <p className="font-medium text-gray-900">{currentRide.pickup_address}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-red-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Destination</p>
                  <p className="font-medium text-gray-900">{currentRide.dropoff_address}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Estimated Fare</span>
                  <span className="text-lg font-bold text-primary-600">
                    ${currentRide.estimated_fare.toFixed(2)}
                  </span>
                </div>
                {currentRide.final_fare && (
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-gray-600">Final Fare</span>
                    <span className="text-lg font-bold text-green-600">
                      ${currentRide.final_fare.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </div>
              {/* Payment Button for Completed Rides */}
              {currentRide.status === 'completed' && rideCompleted && (
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setShowPayment(true)}
                    className="w-full btn-primary flex items-center justify-center"
                  >
                    <CreditCard className="h-5 w-5 mr-2" />
                    Pay ${(currentRide.final_fare || currentRide.estimated_fare).toFixed(2)}
                  </button>
                </div>
              )}
          </div>

          {/* Driver Info */}
          {currentRide.driver && (
            <div className="card">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Driver Information</h2>
              
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-gray-500" />
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-900">
                    {currentRide.driver.first_name} {currentRide.driver.last_name}
                  </p>
                  <p className="text-gray-600">Professional Driver</p>
                </div>
              </div>

              <button className="w-full btn-secondary flex items-center justify-center">
                <Phone className="h-5 w-5 mr-2" />
                Call Driver
              </button>
            </div>
          )}
        </div>

        {/* Payment Modal */}
        {showPayment && currentRide && (
          <PaymentModal
            isOpen={showPayment}
            onClose={() => setShowPayment(false)}
            rideId={currentRide.id}
            amount={currentRide.final_fare || currentRide.estimated_fare}
            token={token || ''}
            onPaymentSuccess={handlePaymentSuccess}
          />
        )}

        {/* Rating Modal */}
        {showRating && currentRide.status === 'completed' && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Rate Your Driver</h3>
                <button
                  onClick={() => setShowRating(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-gray-600 mb-2">How was your ride?</p>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`text-2xl ${star <= rating ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400 transition-colors`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comment (Optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={3}
                  placeholder="Share your experience..."
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowRating(false)}
                  className="flex-1 btn-secondary"
                >
                  Skip
                </button>
                <button
                  onClick={handleRatingSubmit}
                  className="flex-1 btn-primary"
                >
                  Submit Rating
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RideTracking;
