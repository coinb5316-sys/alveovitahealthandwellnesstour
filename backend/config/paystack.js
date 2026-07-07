// backend/config/paystack.js
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

// Create a custom Paystack client using axios
const paystackClient = {
  transaction: {
    initialize: async (data) => {
      try {
        const response = await axios.post(
          `${PAYSTACK_BASE_URL}/transaction/initialize`,
          data,
          {
            headers: {
              Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
              'Content-Type': 'application/json',
            },
          }
        );
        return response.data;
      } catch (error) {
        console.error('Paystack initialize error:', error.response?.data || error.message);
        throw error;
      }
    },
    verify: async (data) => {
      try {
        const response = await axios.get(
          `${PAYSTACK_BASE_URL}/transaction/verify/${data.reference}`,
          {
            headers: {
              Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
              'Content-Type': 'application/json',
            },
          }
        );
        return response.data;
      } catch (error) {
        console.error('Paystack verify error:', error.response?.data || error.message);
        throw error;
      }
    },
  },
  bank: {
    list: async () => {
      try {
        const response = await axios.get(
          `${PAYSTACK_BASE_URL}/bank`,
          {
            headers: {
              Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
              'Content-Type': 'application/json',
            },
          }
        );
        return response.data;
      } catch (error) {
        console.error('Paystack bank list error:', error.response?.data || error.message);
        throw error;
      }
    },
  },
};

console.log('🔑 Paystack configured with:', {
  secretKey: PAYSTACK_SECRET_KEY ? `✅ Present (${PAYSTACK_SECRET_KEY.substring(0, 10)}...)` : '❌ Missing',
});

export default paystackClient;