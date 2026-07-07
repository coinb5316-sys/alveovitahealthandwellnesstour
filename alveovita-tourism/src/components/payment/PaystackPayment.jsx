// src/components/payment/PaystackPayment.jsx
import React, { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import { Loader2, Shield, CreditCard, Lock } from 'lucide-react';

const PaystackPayment = ({
  amount,
  email,
  name,
  tourTitle,
  hotelName,
  bookingData,
  onSuccess,
  onError,
  onClose,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [reference, setReference] = useState(null);

  useEffect(() => {
    initializePayment();
  }, []);

  const initializePayment = async () => {
    try {
      setLoading(true);
      
      const payload = {
        email: email || user?.email,
        amount: amount,
        tourTitle: tourTitle || 'Tour Booking',
        hotelName: hotelName || 'Hotel Booking',
        customerName: name || user?.name,
        bookingData: {
          ...bookingData,
          customerName: name || user?.name,
          customerEmail: email || user?.email,
        },
      };

      const response = await axios.post('/payments/initialize', payload);

      if (response.data.success) {
        setPaymentUrl(response.data.authorization_url);
        setReference(response.data.reference);
        
        // Open payment in new window
        window.open(response.data.authorization_url, '_blank');
        
        // Start polling for payment status
        pollPaymentStatus(response.data.reference);
      } else {
        showToast('Failed to initialize payment', 'error');
        onError?.({ message: 'Payment initialization failed' });
      }
    } catch (error) {
      console.error('Payment initialization error:', error);
      showToast(error.response?.data?.message || 'Payment initialization failed', 'error');
      onError?.(error.response?.data || { message: 'Payment initialization failed' });
    } finally {
      setLoading(false);
    }
  };

  const pollPaymentStatus = (ref) => {
    let attempts = 0;
    const maxAttempts = 30; // 30 * 2 seconds = 60 seconds

    const interval = setInterval(async () => {
      attempts++;
      
      try {
        const response = await axios.get(`/payments/verify/${ref}`);
        
        if (response.data.success) {
          clearInterval(interval);
          showToast('Payment successful! 🎉', 'success');
          onSuccess?.(response.data.data);
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
          showToast('Payment verification timed out', 'error');
          onError?.({ message: 'Payment verification timed out' });
        }
      } catch (error) {
        if (attempts >= maxAttempts) {
          clearInterval(interval);
          showToast('Payment verification failed', 'error');
          onError?.(error.response?.data || { message: 'Payment verification failed' });
        }
      }
    }, 2000);
  };

  return (
    <div className="p-6 text-center">
      {loading ? (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 className="w-12 h-12 text-amber-500 animate-spin mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Initializing payment...</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <CreditCard className="w-10 h-10 text-amber-500" />
            </div>
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">
            Redirecting to Paystack
          </h3>
          
          <p className="text-gray-600 dark:text-gray-400">
            You will be redirected to Paystack to complete your payment securely.
          </p>
          
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Lock className="w-4 h-4" />
            <span>Secure payment by Paystack</span>
          </div>
          
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
            <Shield className="w-4 h-4" />
            <span>Your payment is fully encrypted</span>
          </div>
          
          <button
            onClick={onClose}
            className="mt-4 px-6 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default PaystackPayment;