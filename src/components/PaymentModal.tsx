import React, { useState } from 'react';
import { CreditCard, X, AlertCircle, QrCode, Banknote, Check } from 'lucide-react';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import stripePromise from '../utils/stripe';
import axios from 'axios';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  rideId: string;
  amount: number;
  token: string;
  onPaymentSuccess: () => void;
}

const PaymentForm: React.FC<Omit<PaymentModalProps, 'isOpen'>> = ({
  onClose,
  rideId,
  amount,
  token,
  onPaymentSuccess
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'qr' | 'cash'>('card');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const API_BASE_URL = 'https://uber-backend-ar0c.onrender.com/api';

  const handleCardPayment = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create payment intent
      const { data } = await axios.post(`${API_BASE_URL}/payments/create-payment-intent`, {
        rideId,
        amount
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const cardElement = elements.getElement(CardElement);
      
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      // Confirm payment
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        data.clientSecret,
        {
          payment_method: {
            card: cardElement,
          }
        }
      );

      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
      } else if (paymentIntent.status === 'succeeded') {
        // Confirm payment on backend
        await axios.post(`${API_BASE_URL}/payments/confirm-payment`, {
          paymentIntentId: paymentIntent.id,
          rideId
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setPaymentSuccess(true);
        setTimeout(() => {
          onPaymentSuccess();
          onClose();
        }, 2000);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAlternativePayment = async (method: 'qr' | 'cash') => {
    setLoading(true);
    setError('');

    try {
      // For QR and cash payments, we'll mark as completed without Stripe
      await axios.post(`${API_BASE_URL}/payments/confirm-payment`, {
        rideId,
        paymentMethod: method,
        amount
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPaymentSuccess(true);
      setTimeout(() => {
        onPaymentSuccess();
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Payment confirmation failed');
    } finally {
      setLoading(false);
    }
  };

  if (paymentSuccess) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
        <p className="text-gray-600">Thank you for your payment. Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Payment Method Selection */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Choose Payment Method</h4>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => setPaymentMethod('card')}
            className={`p-4 border rounded-lg text-center transition-all ${
              paymentMethod === 'card' 
                ? 'border-primary-500 bg-primary-50 text-primary-700' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <CreditCard className="h-6 w-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Card</span>
          </button>
          
          <button
            onClick={() => setPaymentMethod('qr')}
            className={`p-4 border rounded-lg text-center transition-all ${
              paymentMethod === 'qr' 
                ? 'border-primary-500 bg-primary-50 text-primary-700' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <QrCode className="h-6 w-6 mx-auto mb-2" />
            <span className="text-sm font-medium">QR Code</span>
          </button>
          
          <button
            onClick={() => setPaymentMethod('cash')}
            className={`p-4 border rounded-lg text-center transition-all ${
              paymentMethod === 'cash' 
                ? 'border-primary-500 bg-primary-50 text-primary-700' 
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <Banknote className="h-6 w-6 mx-auto mb-2" />
            <span className="text-sm font-medium">Cash</span>
          </button>
        </div>
      </div>

      {/* Payment Content */}
      {paymentMethod === 'card' && (
        <form onSubmit={handleCardPayment} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Card Details
            </label>
            <div className="border border-gray-300 rounded-lg p-3">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#424770',
                      '::placeholder': {
                        color: '#aab7c4',
                      },
                    },
                  },
                }}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </div>
          )}

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!stripe || loading}
              className="flex-1 btn-primary flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <CreditCard className="h-5 w-5 mr-2" />
                  Pay ${amount.toFixed(2)}
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {paymentMethod === 'qr' && (
        <div className="text-center space-y-4">
          <div className="bg-gray-100 p-8 rounded-lg">
            <QrCode className="h-24 w-24 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">Scan QR code to pay ${amount.toFixed(2)}</p>
            <div className="mt-4 p-4 bg-white rounded border-2 border-dashed border-gray-300">
              <p className="text-xs text-gray-500">QR Code would appear here</p>
              <p className="text-xs text-gray-500">Integration with payment apps</p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button onClick={onClose} className="flex-1 btn-secondary">
              Cancel
            </button>
            <button
              onClick={() => handleAlternativePayment('qr')}
              disabled={loading}
              className="flex-1 btn-primary flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                'Confirm QR Payment'
              )}
            </button>
          </div>
        </div>
      )}

      {paymentMethod === 'cash' && (
        <div className="text-center space-y-4">
          <div className="bg-green-50 p-6 rounded-lg">
            <Banknote className="h-16 w-16 mx-auto text-green-600 mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">Cash Payment</h4>
            <p className="text-gray-600 mb-4">
              Please pay ${amount.toFixed(2)} in cash to your driver
            </p>
            <div className="bg-white p-4 rounded border border-green-200">
              <p className="text-sm text-green-700 font-medium">
                💡 Tip: Have exact change ready for a smooth transaction
              </p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button onClick={onClose} className="flex-1 btn-secondary">
              Cancel
            </button>
            <button
              onClick={() => handleAlternativePayment('cash')}
              disabled={loading}
              className="flex-1 btn-success flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                'Confirm Cash Payment'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const PaymentModal: React.FC<PaymentModalProps> = (props) => {
  if (!props.isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">Complete Payment</h3>
          <button
            onClick={props.onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Ride Fare</span>
            <span className="text-2xl font-bold text-gray-900">${props.amount.toFixed(2)}</span>
          </div>
        </div>

        <Elements stripe={stripePromise}>
          <PaymentForm {...props} />
        </Elements>
      </div>
    </div>
  );
};

export default PaymentModal;