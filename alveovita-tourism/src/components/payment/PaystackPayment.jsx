// src/components/payment/PaystackPayment.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../hooks/useToast';
import { 
  Loader2, 
  Shield, 
  CreditCard, 
  Lock, 
  Check, 
  XCircle
} from 'lucide-react';

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
  onPaymentStart,
}) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('idle');
  const [paymentMessage, setPaymentMessage] = useState('');
  const [reference, setReference] = useState(null);
  const [bookingId, setBookingId] = useState(null);
  const paystackHandlerRef = useRef(null);
  const isMountedRef = useRef(true);
  const initializedRef = useRef(false);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (paystackHandlerRef.current) {
        try {
          paystackHandlerRef.current.close();
        } catch (e) {
          // Ignore
        }
      }
    };
  }, []);

  // Load Paystack inline script
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.PaystackPop) {
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.async = true;
      script.onload = () => {
        console.log('✅ Paystack SDK loaded successfully');
      };
      script.onerror = () => {
        console.error('❌ Failed to load Paystack SDK');
        if (isMountedRef.current) {
          setPaymentStatus('failed');
          setPaymentMessage('Failed to load payment gateway. Please refresh and try again.');
          showToast('Failed to load payment gateway', 'error');
        }
      };
      document.body.appendChild(script);
    }
  }, []);

  const initializeDirectPayment = async () => {
    // Prevent multiple initializations
    if (initializedRef.current) {
      console.log('⏳ Payment already initializing, skipping...');
      return;
    }
    initializedRef.current = true;

    try {
      if (!isMountedRef.current) return;
      
      setLoading(true);
      setPaymentStatus('processing');
      setPaymentMessage('Initializing payment...');
      
      if (onPaymentStart) {
        onPaymentStart();
      }

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

      const response = await axios.post('/payments/initialize-direct', payload);

      if (!isMountedRef.current) return;

      if (response.data.success) {
        const { data, reference: ref, bookingId: bId, amount: amt } = response.data;
        setReference(ref);
        setBookingId(bId);
        setPaymentMessage(`Payment of ₵${amt.toLocaleString()} initialized`);

        // Check if PaystackPop is available
        if (typeof window.PaystackPop === 'undefined') {
          setPaymentStatus('failed');
          setPaymentMessage('Paystack SDK not loaded. Please refresh and try again.');
          showToast('Paystack SDK not loaded', 'error');
          if (onError) onError({ message: 'Paystack SDK not loaded' });
          initializedRef.current = false;
          return;
        }

        // Define callback functions as named functions (non-async for Paystack)
        const handlePaymentSuccess = (paystackResponse) => {
          console.log('✅ Paystack payment success:', paystackResponse);
          if (!isMountedRef.current) return;
          
          setPaymentMessage('Verifying payment...');
          
          // Use a separate async function for verification
          const verifyPayment = async () => {
            try {
              const verifyResponse = await axios.get(`/payments/verify/${paystackResponse.reference}`);
              
              if (!isMountedRef.current) return;
              
              if (verifyResponse.data.success) {
                setPaymentStatus('success');
                setPaymentMessage('Payment completed successfully! 🎉');
                showToast('🎉 Payment successful! Your booking is confirmed.', 'success');
                
                if (onSuccess) {
                  onSuccess({
                    ...verifyResponse.data.data,
                    booking: verifyResponse.data.booking,
                    reference: paystackResponse.reference
                  });
                }
              } else {
                setPaymentStatus('failed');
                setPaymentMessage('Payment verification failed. Please contact support.');
                showToast('Payment verification failed', 'error');
                if (onError) onError({ message: 'Payment verification failed' });
              }
            } catch (error) {
              console.error('Verification error:', error);
              if (!isMountedRef.current) return;
              setPaymentStatus('failed');
              setPaymentMessage('Payment verification failed. Please contact support.');
              showToast('Payment verification failed', 'error');
              if (onError) onError(error.response?.data || { message: 'Payment verification failed' });
            } finally {
              initializedRef.current = false;
            }
          };
          
          verifyPayment();
        };

        const handlePaymentClose = () => {
          console.log('❌ Paystack modal closed by user');
          if (!isMountedRef.current) return;
          if (paymentStatus === 'processing' || paymentStatus === 'idle') {
            setPaymentStatus('idle');
            setPaymentMessage('');
            showToast('Payment cancelled', 'info');
            if (onError) onError({ message: 'Payment cancelled by user' });
          }
          initializedRef.current = false;
        };

        // Get the public key - try multiple sources
        const publicKey = data.key || import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || process.env.VITE_PAYSTACK_PUBLIC_KEY;
        
        console.log('🔑 Using Paystack public key:', publicKey ? '✅ Present' : '❌ Missing');

        // Initialize Paystack inline popup with proper callbacks
        const handler = window.PaystackPop.setup({
          key: publicKey,
          email: data.email,
          amount: data.amount,
          ref: data.reference,
          metadata: data.metadata,
          callback: handlePaymentSuccess,
          onClose: handlePaymentClose,
        });

        paystackHandlerRef.current = handler;
        
        // Open the Paystack modal
        handler.openIframe();

      } else {
        setPaymentStatus('failed');
        setPaymentMessage(response.data.message || 'Failed to initialize payment');
        showToast('Failed to initialize payment', 'error');
        if (onError) onError(response.data);
        initializedRef.current = false;
      }
    } catch (error) {
      console.error('Payment initialization error:', error);
      if (!isMountedRef.current) return;
      setPaymentStatus('failed');
      setPaymentMessage(error.response?.data?.message || 'Payment initialization failed');
      showToast(error.response?.data?.message || 'Payment initialization failed', 'error');
      if (onError) onError(error.response?.data || { message: 'Payment initialization failed' });
      initializedRef.current = false;
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  };

  // Auto-initialize payment on mount
  useEffect(() => {
    if (!email && !user?.email) {
      setPaymentStatus('failed');
      setPaymentMessage('Email is required for payment');
      showToast('Email is required for payment', 'error');
      if (onError) onError({ message: 'Email is required' });
      return;
    }
    
    // Small delay to ensure everything is ready
    const timer = setTimeout(() => {
      initializeDirectPayment();
    }, 800);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  // Render different states
  const renderContent = () => {
    if (paymentStatus === 'success') {
      return (
        <div className="flex flex-col items-center justify-center py-8 space-y-4 animate-in fade-in zoom-in duration-500">
          <div className="relative w-24 h-24 mx-auto">
            <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping" />
            <div className="absolute inset-2 rounded-full bg-green-500/40 animate-pulse" />
            <div className="absolute inset-0 rounded-full bg-green-500 flex items-center justify-center">
              <Check className="w-12 h-12 text-white" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            Payment Successful! 🎉
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-center max-w-sm">
            {paymentMessage || 'Your payment has been completed successfully.'}
          </p>
          {bookingId && (
            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800 w-full max-w-sm">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Booking Reference</span>
                <span className="font-mono font-medium text-gray-900 dark:text-white">
                  #{bookingId.slice(0, 12)}
                </span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-gray-500">Total Paid</span>
                <span className="font-bold text-amber-500">₵{amount.toLocaleString()}</span>
              </div>
              {reference && (
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-500">Transaction Ref</span>
                  <span className="font-mono text-xs text-gray-600 dark:text-gray-400">
                    {reference.slice(0, 16)}...
                  </span>
                </div>
              )}
            </div>
          )}
          <div className="flex items-center justify-center gap-2 text-sm text-green-500">
            <Shield className="w-4 h-4" />
            <span>Your booking is confirmed</span>
          </div>
          <button
            onClick={onClose}
            className="mt-4 px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:scale-105 transition-all font-medium shadow-lg shadow-amber-500/30"
          >
            Continue
          </button>
        </div>
      );
    }

    if (paymentStatus === 'failed') {
      return (
        <div className="flex flex-col items-center justify-center py-8 space-y-4 animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <XCircle className="w-12 h-12 text-red-500" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            Payment Failed
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-center max-w-sm">
            {paymentMessage || 'There was an issue processing your payment. Please try again.'}
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3 mt-2 w-full max-w-sm">
            <button
              onClick={() => {
                setPaymentStatus('idle');
                setPaymentMessage('');
                initializedRef.current = false;
                initializeDirectPayment();
              }}
              className="w-full sm:flex-1 px-6 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-all font-medium"
            >
              Retry Payment
            </button>
            <button
              onClick={onClose}
              className="w-full sm:flex-1 px-6 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      );
    }

    // Processing / Loading state
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        {loading ? (
          <>
            <Loader2 className="w-16 h-16 text-amber-500 animate-spin" />
            <p className="text-gray-600 dark:text-gray-400">{paymentMessage || 'Initializing payment...'}</p>
            <p className="text-sm text-gray-400">Please wait while we prepare your payment</p>
          </>
        ) : (
          <>
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center animate-pulse">
                <CreditCard className="w-12 h-12 text-amber-500" />
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Processing Payment
            </h3>
            
            <p className="text-gray-600 dark:text-gray-400 text-center max-w-sm">
              Please wait while we process your payment securely...
            </p>
            
            <div className="flex flex-col items-center gap-2 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                <span>Secure payment by Paystack</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <Shield className="w-4 h-4" />
                <span>Your payment is fully encrypted</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="mt-4 px-6 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 min-h-[300px] flex items-center justify-center">
      {renderContent()}
    </div>
  );
};

export default PaystackPayment;