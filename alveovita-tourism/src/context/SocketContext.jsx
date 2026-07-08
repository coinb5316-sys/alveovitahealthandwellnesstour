// src/context/SocketContext.jsx
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [connectionError, setConnectionError] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    // Get socket URL from environment or use production default
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'https://alveovitahealthandwellnesstour.onrender.com';
    
    console.log('🔌 [Socket] Connecting to server at:', socketUrl);
    console.log('🔌 [Socket] User authenticated:', !!user);
    console.log('📱 [Socket] Environment:', import.meta.env.MODE || 'development');
    
    // Socket.IO configuration optimized for mobile
    const newSocket = io(socketUrl, {
      path: '/socket.io/',
      transports: ['websocket', 'polling'], // polling works better on mobile
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10, // More attempts for mobile
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000, // Longer timeout for mobile
      upgrade: true,
      forceNew: true,
      // Auth data
      auth: {
        token: user?.token || null,
        userId: user?.id || null
      },
      // Query parameters
      query: {
        userId: user?.id || '',
        userType: user?.role || 'guest',
        platform: 'mobile'
      }
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('🟢 [Socket] Connected successfully! ID:', newSocket.id);
      setIsConnected(true);
      setConnectionError(null);
      
      // If user is authenticated, join a room
      if (user?.id) {
        console.log('🔐 [Socket] Authenticating user:', user.id);
        newSocket.emit('authenticate', { 
          userId: user.id,
          userRole: user.role,
          userName: user.name
        });
      }
    });

    newSocket.on('disconnect', (reason) => {
      console.log('🔴 [Socket] Disconnected. Reason:', reason);
      setIsConnected(false);
      
      // Handle specific disconnect reasons
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, try to reconnect
        console.log('🔄 [Socket] Server disconnected, attempting reconnect...');
        newSocket.connect();
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ [Socket] Connection error:', error.message);
      console.error('❌ [Socket] Error details:', error);
      setConnectionError(error.message);
      
      // Check for specific error types
      if (error.message === 'Invalid namespace') {
        console.error('💡 [Socket] The namespace does not exist on the server.');
        console.error('💡 [Socket] Try connecting without a namespace or check server configuration.');
      }
      
      if (error.message.includes('404')) {
        console.error('💡 [Socket] The server endpoint might be wrong. Check your VITE_SOCKET_URL.');
        console.error('💡 [Socket] Current URL:', socketUrl);
      }
      
      if (error.message.includes('ECONNREFUSED')) {
        console.error('💡 [Socket] Connection refused. Make sure the server is running.');
      }
    });

    // Handle reconnection attempts
    newSocket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 [Socket] Reconnection attempt ${attemptNumber}`);
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log(`✅ [Socket] Reconnected after ${attemptNumber} attempts`);
    });

    newSocket.on('reconnect_failed', () => {
      console.error('❌ [Socket] Failed to reconnect to socket server');
      setConnectionError('Failed to reconnect after multiple attempts');
    });

    // Handle authentication response
    newSocket.on('authenticated', (data) => {
      console.log('✅ [Socket] User authenticated:', data);
      if (data.sessionId) {
        setSessionId(data.sessionId);
      }
    });

    newSocket.on('auth_error', (error) => {
      console.error('❌ [Socket] Authentication error:', error);
      setConnectionError(error.message);
    });

    // Handle chat events
    newSocket.on('chat-joined', (data) => {
      console.log('📥 [Socket] Chat joined:', data);
    });

    newSocket.on('new-message', (data) => {
      console.log('📥 [Socket] New message received:', data);
    });

    newSocket.on('chat-error', (error) => {
      console.error('❌ [Socket] Chat error:', error);
    });

    return () => {
      console.log('🧹 [Socket] Cleaning up connection');
      if (newSocket) {
        newSocket.disconnect();
        newSocket.close();
      }
    };
  }, [user]); // Reconnect when user changes

  // Join a chat room
  const joinChat = (data) => {
    if (socket && isConnected) {
      console.log('📤 [Socket] Joining chat:', data);
      socket.emit('join-chat', data);
    } else {
      console.warn('⚠️ [Socket] Cannot join chat - socket not connected');
      console.warn('⚠️ [Socket] Connection status:', { socket: !!socket, isConnected });
    }
  };

  // Send a message
  const sendMessage = (data) => {
    if (socket && isConnected) {
      console.log('📤 [Socket] Sending message:', data);
      socket.emit('send-message', data);
    } else {
      console.warn('⚠️ [Socket] Cannot send message - socket not connected');
    }
  };

  // Send admin message
  const sendAdminMessage = (data) => {
    if (socket && isConnected) {
      console.log('📤 [Socket] Sending admin message:', data);
      socket.emit('admin-message', data);
    } else {
      console.warn('⚠️ [Socket] Cannot send admin message - socket not connected');
    }
  };

  // Send typing indicator
  const sendTyping = (data) => {
    if (socket && isConnected) {
      socket.emit('typing', data);
    }
  };

  // Resolve a session
  const resolveSession = (sessionId) => {
    if (socket && isConnected) {
      console.log('📤 [Socket] Resolving session:', sessionId);
      socket.emit('resolve-session', { sessionId });
    } else {
      console.warn('⚠️ [Socket] Cannot resolve session - socket not connected');
    }
  };

  const value = {
    socket,
    isConnected,
    sessionId,
    connectionError,
    setSessionId,
    joinChat,
    sendMessage,
    sendAdminMessage,
    sendTyping,
    resolveSession,
    // Helper to manually reconnect
    reconnect: () => {
      if (socket) {
        console.log('🔄 [Socket] Manual reconnect requested');
        socket.disconnect();
        socket.connect();
      }
    }
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;