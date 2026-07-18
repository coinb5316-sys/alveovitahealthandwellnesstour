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
  XCircle,
  ExternalLink
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
  const [paymentUrl, setPaymentUrl] = useState(null);
  const [pollingActive, setPollingActive] = useState(false);
  const isMountedRef = useRef(true);
  const initializedRef = useRef(false);
  const pollIntervalRef = useRef(null);
  const windowCheckIntervalRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      if (windowCheckIntervalRef.current) {
        clearInterval(windowCheckIntervalRef.current);
      }
    };
  }, []);

  // Check if payment window is still open
  const checkPaymentWindow = (paymentWindow, ref) => {
    if (windowCheckIntervalRef.current) {
      clearInterval(windowCheckIntervalRef.current);
    }

    windowCheckIntervalRef.current = setInterval(() => {
      // If the window is closed, start polling for status
      if (!paymentWindow || paymentWindow.closed) {
        console.log('🔍 Payment window closed, starting verification...');
        clearInterval(windowCheckIntervalRef.current);
        windowCheckIntervalRef.current = null;
        
        // Check payment status immediately when window closes
        checkPaymentStatus(ref);
        
        // Start polling
        if (!pollIntervalRef.current) {
          startPolling(ref);
        }
      }
    }, 2000);
  };

  // Check payment status once
  const checkPaymentStatus = async (ref) => {
    try {
      console.log('🔍 Checking payment status for:', ref);
      const response = await axios.get(`/payments/verify/${ref}`);
      
      if (!isMountedRef.current) return;
      
      if (response.data.success) {
        console.log('✅ Payment verified successfully!');
        handlePaymentSuccess(response.data, ref);
        return true;
      } else {
        console.log('⏳ Payment still pending...');
        return false;
      }
    } catch (error) {
      console.error('❌ Status check error:', error);
      return false;
    }
  };

  // Handle payment success
  const handlePaymentSuccess = (data, ref) => {
    // Clear all intervals
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    if (windowCheckIntervalRef.current) {
      clearInterval(windowCheckIntervalRef.current);
      windowCheckIntervalRef.current = null;
    }
    
    setPollingActive(false);
    setPaymentStatus('success');
    setPaymentMessage('Payment completed successfully! 🎉');
    showToast('🎉 Payment successful! Your booking is confirmed.', 'success');
    
    if (onSuccess) {
      onSuccess({
        ...data.data,
        booking: data.booking,
        reference: ref
      });
    }
    initializedRef.current = false;
  };

  const startPolling = (ref) => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    setPollingActive(true);
    let attempts = 0;
    const maxAttempts = 40; // 40 * 3 seconds = 120 seconds (2 minutes)

    pollIntervalRef.current = setInterval(async () => {
      attempts++;
      console.log(`⏳ Polling attempt ${attempts}/${maxAttempts} for: ${ref}`);
      
      try {
        const response = await axios.get(`/payments/verify/${ref}`);
        
        if (!isMountedRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
          return;
        }
        
        if (response.data.success) {
          console.log('✅ Payment verified via polling!');
          handlePaymentSuccess(response.data, ref);
          return;
        }
        
        if (attempts >= maxAttempts) {
          // Timeout - check one more time
          console.log('⏰ Polling timeout, final check...');
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
          setPollingActive(false);
          
          // Final check
          const finalCheck = await checkPaymentStatus(ref);
          if (!finalCheck) {
            setPaymentStatus('failed');
            setPaymentMessage('Payment verification timed out. Please contact support.');
            showToast('Payment verification timed out', 'error');
            if (onError) onError({ message: 'Payment verification timed out' });
            initializedRef.current = false;
          }
        }
      } catch (error) {
        console.error('❌ Polling error:', error);
        if (attempts >= maxAttempts) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
          setPollingActive(false);
          
          if (!isMountedRef.current) return;
          
          setPaymentStatus('failed');
          setPaymentMessage('Payment verification failed. Please contact support.');
          showToast('Payment verification failed', 'error');
          if (onError) onError(error.response?.data || { message: 'Payment verification failed' });
          initializedRef.current = false;
        }
      }
    }, 3000);
  };

  const initializePayment = async () => {
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

      const response = await axios.post('/payments/initiate', payload);

      if (!isMountedRef.current) return;

      if (response.data.success) {
        const { authorization_url, reference: ref, bookingId: bId } = response.data;
        setReference(ref);
        setBookingId(bId);
        setPaymentUrl(authorization_url);
        setPaymentMessage(`Payment of ₵${amount.toLocaleString()} initialized`);

        // Open payment in new window/tab
        const newWindow = window.open(authorization_url, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
        
        if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
          // Popup blocked - redirect in same window
          window.location.href = authorization_url;
          return;
        }

        // Start checking if the window is still open
        checkPaymentWindow(newWindow, ref);
        
        // Also start polling as backup
        startPolling(ref);

        // Also check for focus events on the page (user returned to tab)
        const handleFocus = () => {
          console.log('👁️ Page focused, checking payment status...');
          if (ref && !pollingActive) {
            checkPaymentStatus(ref);
          }
        };
        window.addEventListener('focus', handleFocus);
        
        // Cleanup listener when component unmounts or payment completes
        const cleanup = () => {
          window.removeEventListener('focus', handleFocus);
        };
        
        // Store cleanup function
        if (window._paystackCleanup) {
          window._paystackCleanup();
        }
        window._paystackCleanup = cleanup;

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
    
    const timer = setTimeout(() => {
      initializePayment();
    }, 500);

    return () => {
      clearTimeout(timer);
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
      if (windowCheckIntervalRef.current) {
        clearInterval(windowCheckIntervalRef.current);
      }
      if (window._paystackCleanup) {
        window._paystackCleanup();
        window._paystackCleanup = null;
      }
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
                if (pollIntervalRef.current) {
                  clearInterval(pollIntervalRef.current);
                  pollIntervalRef.current = null;
                }
                if (windowCheckIntervalRef.current) {
                  clearInterval(windowCheckIntervalRef.current);
                  windowCheckIntervalRef.current = null;
                }
                setPollingActive(false);
                initializePayment();
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
        ) : paymentUrl ? (
          <>
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <ExternalLink className="w-12 h-12 text-amber-500" />
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Payment Window Opened
            </h3>
            
            <p className="text-gray-600 dark:text-gray-400 text-center max-w-sm">
              A new window has been opened for payment. Please complete the payment there.
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

            <div className="flex flex-col sm:flex-row items-center gap-3 mt-2 w-full max-w-sm">
              <a
                href={paymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:scale-105 transition-all font-medium text-center"
                onClick={(e) => {
                  e.preventDefault();
                  const newWin = window.open(paymentUrl, '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
                  if (newWin) {
                    checkPaymentWindow(newWin, reference);
                  } else {
                    window.location.href = paymentUrl;
                  }
                }}
              >
                Open Payment Page
              </a>
              <button
                onClick={onClose}
                className="w-full sm:flex-1 px-6 py-3 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
            
            {pollingActive ? (
              <p className="text-xs text-gray-400 mt-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Waiting for payment confirmation...
              </p>
            ) : (
              <p className="text-xs text-gray-400 mt-2">
                Complete payment in the new window. We'll automatically detect when it's done.
              </p>
            )}
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