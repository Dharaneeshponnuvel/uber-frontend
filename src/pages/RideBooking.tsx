import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, DollarSign, Clock, Car, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import axios from 'axios';
import { GoogleMap, LoadScript } from '@react-google-maps/api';

const RideBooking: React.FC = () => {
  const { token } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    pickupAddress: '',
    dropoffAddress: '',
    rideType: 'standard'
  });
  const [estimatedFare, setEstimatedFare] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [bookingStatus, setBookingStatus] = useState<'idle' | 'calculating' | 'booking' | 'success'>('idle');
  const [error, setError] = useState('');

  // Google Maps config
  const containerStyle = { width: '100%', height: '300px' };
  const center = { lat: 40.7128, lng: -74.0060 }; // NYC default
  const libraries: ("places")[] = ["places"];

  const API_BASE_URL = 'https://uber-backend-ar0c.onrender.com/api';

  const rideTypes = [
    { id: 'economy', name: 'Economy', description: 'Affordable rides', price: '$1.20/mile', icon: '🚗' },
    { id: 'standard', name: 'Standard', description: 'Comfortable rides', price: '$1.50/mile', icon: '🚘' },
    { id: 'premium', name: 'Premium', description: 'Premium vehicles', price: '$2.00/mile', icon: '🚙' },
    { id: 'xl', name: 'RideShare XL', description: '6+ passengers', price: '$2.50/mile', icon: '🚐' }
  ];

  useEffect(() => {
    if (socket) {
      socket.on('ride-accepted', (data) => {
        console.log('Ride accepted:', data);
        navigate('/ride-tracking');
      });

      return () => {
        socket.off('ride-accepted');
      };
    }
  }, [socket, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const calculateEstimate = async () => {
    if (!formData.pickupAddress || !formData.dropoffAddress) {
      setError('Please enter both pickup and destination addresses');
      return;
    }

    setBookingStatus('calculating');
    setError('');
    
    // Simulate calculation with mock data
    setTimeout(() => {
      const mockDistance = Math.random() * 10 + 2; // 2-12 miles
      const baseFare = 2.50;
      const perMileRates: { [key: string]: number } = {
        economy: 1.20,
        standard: 1.50,
        premium: 2.00,
        xl: 2.50
      };
      
      const fare = baseFare + (mockDistance * perMileRates[formData.rideType]);
      setEstimatedFare(Math.round(fare * 100) / 100);
      setBookingStatus('idle');
    }, 2000);
  };

  const handleBookRide = async () => {
    if (!estimatedFare) {
      calculateEstimate();
      return;
    }

    setBookingStatus('booking');
    setError('');

    try {
      // Create mock coordinates (in real app, use Google Maps Geocoding API)
      const mockPickupCoords = { 
        lat: 40.7128 + (Math.random() - 0.5) * 0.1, 
        lng: -74.0060 + (Math.random() - 0.5) * 0.1 
      };
      const mockDropoffCoords = { 
        lat: 40.7128 + (Math.random() - 0.5) * 0.1, 
        lng: -74.0060 + (Math.random() - 0.5) * 0.1 
      };

      const response = await axios.post(`${API_BASE_URL}/rides/request`, {
        pickupAddress: formData.pickupAddress,
        dropoffAddress: formData.dropoffAddress,
        pickupCoordinates: mockPickupCoords,
        dropoffCoordinates: mockDropoffCoords,
        rideType: formData.rideType
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setBookingStatus('success');
      
      // Navigate to tracking page after 2 seconds
      setTimeout(() => {
        navigate('/ride-tracking');
      }, 2000);
    } catch (error: any) {
      console.error('Error booking ride:', error);
      setError(error.response?.data?.error || 'Failed to book ride');
      setBookingStatus('idle');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Book Your Ride</h1>
          <p className="text-gray-600">Enter your pickup and destination to get started</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center max-w-2xl mx-auto">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Booking Form */}
          <div className="card">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Trip Details</h2>
            
            <div className="space-y-6">
              {/* Pickup Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pickup Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-green-500" />
                  <input
                    type="text"
                    name="pickupAddress"
                    value={formData.pickupAddress}
                    onChange={handleInputChange}
                    className="input-field pl-10"
                    placeholder="Enter pickup address"
                  />
                </div>
              </div>

              {/* Dropoff Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Destination
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-red-500" />
                  <input
                    type="text"
                    name="dropoffAddress"
                    value={formData.dropoffAddress}
                    onChange={handleInputChange}
                    className="input-field pl-10"
                    placeholder="Enter destination address"
                  />
                </div>
              </div>

              {/* Ride Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Choose Ride Type
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {rideTypes.map((type) => (
                    <label
                      key={type.id}
                      className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                        formData.rideType === type.id
                          ? 'border-primary-500 bg-primary-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      <input
                        type="radio"
                        name="rideType"
                        value={type.id}
                        checked={formData.rideType === type.id}
                        onChange={handleInputChange}
                        className="sr-only"
                      />
                      <span className="text-2xl mr-3">{type.icon}</span>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-900">{type.name}</span>
                          <span className="text-sm text-primary-600 font-medium">{type.price}</span>
                        </div>
                        <p className="text-sm text-gray-600">{type.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Calculate/Book Button */}
              <button
                onClick={estimatedFare ? handleBookRide : calculateEstimate}
                disabled={!formData.pickupAddress || !formData.dropoffAddress || bookingStatus !== 'idle'}
                className="w-full btn-primary flex items-center justify-center"
              >
                {bookingStatus === 'calculating' && (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Calculating Fare...
                  </>
                )}
                {bookingStatus === 'booking' && (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Booking Ride...
                  </>
                )}
                {bookingStatus === 'success' && (
                  <>
                    <Car className="h-5 w-5 mr-2" />
                    Ride Booked Successfully!
                  </>
                )}
                {bookingStatus === 'idle' && (
                  <>
                    {estimatedFare ? (
                      <>
                        <Car className="h-5 w-5 mr-2" />
                        Book Ride - ${estimatedFare.toFixed(2)}
                      </>
                    ) : (
                      <>
                        <Navigation className="h-5 w-5 mr-2" />
                        Get Fare Estimate
                      </>
                    )}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Fare Estimate & Info */}
          <div className="space-y-6">
            {/* Fare Estimate */}
            {estimatedFare && (
              <div className="card animate-slide-up">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-green-600" />
                  Fare Estimate
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Base Fare</span>
                    <span className="font-medium">$2.50</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Distance & Time</span>
                    <span className="font-medium">${(estimatedFare - 2.50).toFixed(2)}</span>
                  </div>
                  <hr className="border-gray-200" />
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total Estimate</span>
                    <span className="text-primary-600">${estimatedFare.toFixed(2)}</span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center text-sm text-blue-700">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>Estimated pickup time: 5-8 minutes</span>
                  </div>
                </div>
              </div>
            )}

            {/* Google Map Preview */}
            <div className="card">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Map Preview</h3>
              <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY} libraries={libraries}>
                <GoogleMap
                  mapContainerStyle={containerStyle}
                  center={center}
                  zoom={12}
                />
              </LoadScript>
            </div>

            {/* Ride Info */}
            <div className="card">
              <h3 className="text-lg font-bold text-gray-900 mb-4">How it Works</h3>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold mr-3">1</div>
                  <span>Enter your pickup and destination</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold mr-3">2</div>
                  <span>Get matched with a nearby driver</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold mr-3">3</div>
                  <span>Track your ride in real-time</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-xs font-bold mr-3">4</div>
                  <span>Pay securely and rate your driver</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RideBooking;
