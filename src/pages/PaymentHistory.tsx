import React, { useState, useEffect } from 'react';
import { CreditCard, Download, Calendar, DollarSign, Receipt } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface Payment {
  id: string;
  created_at: string;
  completed_at: string;
  pickup_address: string;
  dropoff_address: string;
  final_fare: number;
  payment_status: string;
  distance: number;
  ride_type: string;
  driver?: {
    first_name: string;
    last_name: string;
  };
}

const PaymentHistory: React.FC = () => {
  const { token } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPayments: 0,
    totalAmount: 0,
    averageRide: 0
  });

  const API_BASE_URL = 'http://localhost:5000/api';

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/payments/history`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const paymentData = response.data.payments;
        setPayments(paymentData);

        // Calculate stats
        const totalPayments = paymentData.length;
        const totalAmount = paymentData.reduce((sum: number, payment: Payment) => 
          sum + payment.final_fare, 0
        );
        const averageRide = totalPayments > 0 ? totalAmount / totalPayments : 0;

        setStats({
          totalPayments,
          totalAmount,
          averageRide
        });
      } catch (error) {
        console.error('Error fetching payment history:', error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchPaymentHistory();
    }
  }, [token]);

  const downloadReceipt = (payment: Payment) => {
    // Generate a simple receipt (in real app, generate PDF)
    const receiptData = `
RIDESHARE RECEIPT
================
Date: ${new Date(payment.completed_at).toLocaleDateString()}
Time: ${new Date(payment.completed_at).toLocaleTimeString()}

Trip Details:
From: ${payment.pickup_address}
To: ${payment.dropoff_address}
Distance: ${payment.distance} miles
Ride Type: ${payment.ride_type}

Driver: ${payment.driver?.first_name} ${payment.driver?.last_name}

Payment:
Fare: $${payment.final_fare.toFixed(2)}
Status: Paid

Thank you for using RideShare!
    `;

    const blob = new Blob([receiptData], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${payment.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
          <p className="text-gray-600 mt-2">View all your completed payments and download receipts</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="card hover:scale-105 transform transition-all duration-200">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Receipt className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">{stats.totalPayments}</p>
                <p className="text-gray-600">Total Payments</p>
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
                  ${stats.totalAmount.toFixed(2)}
                </p>
                <p className="text-gray-600">Total Amount</p>
              </div>
            </div>
          </div>

          <div className="card hover:scale-105 transform transition-all duration-200">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  ${stats.averageRide.toFixed(2)}
                </p>
                <p className="text-gray-600">Average Ride</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment History */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Payment Records</h2>
            <div className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-gray-400" />
              <span className="text-gray-600 text-sm">All payments processed securely</span>
            </div>
          </div>

          {payments.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No payment history available.</p>
              <p className="text-sm text-gray-500">Complete some rides to see your payment history here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                        Paid
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(payment.completed_at).toLocaleDateString()} at {new Date(payment.completed_at).toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <div className="space-y-1 mb-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-1 text-green-500" />
                        <span className="truncate">{payment.pickup_address}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-1 text-red-500" />
                        <span className="truncate">{payment.dropoff_address}</span>
                      </div>
                    </div>
                    
                    {payment.driver && (
                      <p className="text-sm text-gray-500">
                        Driver: {payment.driver.first_name} {payment.driver.last_name}
                      </p>
                    )}
                  </div>
                  
                  <div className="text-right ml-4">
                    <p className="text-lg font-bold text-gray-900">
                      ${payment.final_fare.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500 mb-2">
                      {payment.distance} miles • {payment.ride_type}
                    </p>
                    <button
                      onClick={() => downloadReceipt(payment)}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center transition-colors"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Receipt
                    </button>
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

export default PaymentHistory;