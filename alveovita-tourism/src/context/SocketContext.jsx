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
  const socketRef = useRef(null);

  useEffect(() => {
    // Get the API URL from environment or use default
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    
    console.log('🔌 Connecting to Socket.IO server at:', socketUrl);
    console.log('🔌 User authenticated:', !!user);
    
    // Create socket connection - REMOVE the namespace
    // The server uses the root namespace by default
    const newSocket = io(socketUrl, {
      // Remove the path if it's causing issues, or keep it to match server
      path: '/socket.io/',
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      // Add auth data if needed
      auth: {
        token: user?.token || null,
        userId: user?.id || null
      },
      // Add query parameters if needed
      query: {
        userId: user?.id || '',
        userType: user?.role || 'guest'
      }
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('🟢 Socket connected successfully! ID:', newSocket.id);
      setIsConnected(true);
      
      // If user is authenticated, join a room
      if (user?.id) {
        console.log('🔐 Authenticating user:', user.id);
        newSocket.emit('authenticate', { 
          userId: user.id,
          userRole: user.role,
          userName: user.name
        });
      }
    });

    newSocket.on('disconnect', (reason) => {
      console.log('🔴 Socket disconnected. Reason:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
      console.error('Error details:', error);
      
      // Check for specific error types
      if (error.message === 'Invalid namespace') {
        console.error('💡 The namespace you are trying to connect to does not exist on the server.');
        console.error('💡 Try connecting without a namespace or check server configuration.');
      }
      
      if (error.message.includes('404')) {
        console.error('💡 The server endpoint might be wrong. Check your VITE_API_URL.');
      }
    });

    // Handle reconnection attempts
    newSocket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`🔄 Reconnection attempt ${attemptNumber}`);
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log(`✅ Reconnected after ${attemptNumber} attempts`);
    });

    newSocket.on('reconnect_failed', () => {
      console.error('❌ Failed to reconnect to socket server');
    });

    // Handle authentication response
    newSocket.on('authenticated', (data) => {
      console.log('✅ User authenticated on socket server:', data);
      if (data.sessionId) {
        setSessionId(data.sessionId);
      }
    });

    newSocket.on('auth_error', (error) => {
      console.error('❌ Authentication error:', error);
    });

    return () => {
      console.log('🧹 Cleaning up socket connection');
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [user]); // Reconnect when user changes

  // Join a chat room
  const joinChat = (data) => {
    if (socket && isConnected) {
      console.log('📤 Joining chat:', data);
      socket.emit('join-chat', data);
    } else {
      console.warn('⚠️ Cannot join chat - socket not connected');
    }
  };

  // Send a message
  const sendMessage = (data) => {
    if (socket && isConnected) {
      console.log('📤 Sending message:', data);
      socket.emit('send-message', data);
    } else {
      console.warn('⚠️ Cannot send message - socket not connected');
    }
  };

  // Send admin message
  const sendAdminMessage = (data) => {
    if (socket && isConnected) {
      console.log('📤 Sending admin message:', data);
      socket.emit('admin-message', data);
    } else {
      console.warn('⚠️ Cannot send admin message - socket not connected');
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
      console.log('📤 Resolving session:', sessionId);
      socket.emit('resolve-session', { sessionId });
    } else {
      console.warn('⚠️ Cannot resolve session - socket not connected');
    }
  };

  const value = {
    socket,
    isConnected,
    sessionId,
    setSessionId,
    joinChat,
    sendMessage,
    sendAdminMessage,
    sendTyping,
    resolveSession,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;