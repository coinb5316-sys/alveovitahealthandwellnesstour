// src/context/BookingContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from '../api/axios';

const BookingContext = createContext();

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error('useBooking must be used within BookingProvider');
  }
  return context;
};

export const BookingProvider = ({ children }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUserBookings = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/bookings/mine');
      if (response.data.success) {
        setBookings(response.data.bookings);
      }
      return response.data;
    } catch (error) {
      console.error('Error fetching bookings:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createBooking = async (bookingData) => {
    try {
      setLoading(true);
      const response = await axios.post('/bookings', bookingData);
      if (response.data.success) {
        setBookings(prev => [response.data.booking, ...prev]);
      }
      return response.data;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId) => {
    try {
      setLoading(true);
      const response = await axios.post(`/bookings/${bookingId}/cancel`);
      if (response.data.success) {
        setBookings(prev => prev.map(b => 
          b._id === bookingId ? { ...b, status: 'cancelled' } : b
        ));
      }
      return response.data;
    } catch (error) {
      console.error('Error cancelling booking:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getBookingById = async (bookingId) => {
    try {
      setLoading(true);
      const response = await axios.get(`/bookings/${bookingId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching booking:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <BookingContext.Provider value={{
      bookings,
      loading,
      fetchUserBookings,
      createBooking,
      cancelBooking,
      getBookingById,
    }}>
      {children}
    </BookingContext.Provider>
  );
};