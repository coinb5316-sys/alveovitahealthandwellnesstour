// src/context/SocketContext.jsx
import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
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
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [connectionError, setConnectionError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [adminUnreadCount, setAdminUnreadCount] = useState(0);
  const socketRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 10;

  // Get socket URL from environment
  const getSocketUrl = useCallback(() => {
    const url = import.meta.env.VITE_SOCKET_URL || 
                import.meta.env.VITE_API_URL || 
                'http://localhost:5000';
    return url;
  }, []);

  // Connect to socket
  const connectSocket = useCallback(() => {
    if (!token) {
      console.log('🔌 [Socket] No token available, skipping connection');
      return null;
    }

    const socketUrl = getSocketUrl();
    console.log('🔌 [Socket] Connecting to server at:', socketUrl);
    console.log('🔌 [Socket] User authenticated:', !!user);
    console.log('📱 [Socket] Environment:', import.meta.env.MODE || 'development');
    
    // Socket.IO configuration optimized for mobile and notifications
    const newSocket = io(socketUrl, {
      path: '/socket.io/',
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      upgrade: true,
      forceNew: true,
      // Auth data - critical for notifications
      auth: {
        token: token,
        userId: user?.id || null
      },
      // Query parameters
      query: {
        userId: user?.id || '',
        userType: user?.role || 'guest',
        platform: 'mobile'
      }
    });

    return newSocket;
  }, [token, user, getSocketUrl]);

  // Setup socket event listeners
  const setupSocketListeners = useCallback((newSocket) => {
    if (!newSocket) return;

    // Connection events
    newSocket.on('connect', () => {
      console.log('🟢 [Socket] Connected successfully! ID:', newSocket.id);
      setIsConnected(true);
      setConnectionError(null);
      reconnectAttempts.current = 0;
      
      // If user is authenticated, join user room
      if (user?.id) {
        console.log('🔐 [Socket] Authenticating user:', user.id);
        newSocket.emit('join-user-room', user.id);
        
        // Get unread count on connection
        newSocket.emit('get-unread-count');
        
        // If admin, get admin unread count
        if (user?.role === 'admin') {
          newSocket.emit('get-admin-unread-count');
        }
      }
    });

    newSocket.on('disconnect', (reason) => {
      console.log('🔴 [Socket] Disconnected. Reason:', reason);
      setIsConnected(false);
      
      // Handle specific disconnect reasons
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, try to reconnect
        console.log('🔄 [Socket] Server disconnected, attempting reconnect...');
        setTimeout(() => {
          if (newSocket) {
            newSocket.connect();
          }
        }, 1000);
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ [Socket] Connection error:', error.message);
      console.error('❌ [Socket] Error details:', error);
      setConnectionError(error.message);
      setIsConnected(false);
      
      // Check for specific error types
      if (error.message === 'Invalid namespace') {
        console.error('💡 [Socket] The namespace does not exist on the server.');
        console.error('💡 [Socket] Try connecting without a namespace or check server configuration.');
      }
      
      if (error.message.includes('404')) {
        console.error('💡 [Socket] The server endpoint might be wrong. Check your VITE_SOCKET_URL.');
        console.error('💡 [Socket] Current URL:', getSocketUrl());
      }
      
      if (error.message.includes('ECONNREFUSED')) {
        console.error('💡 [Socket] Connection refused. Make sure the server is running.');
      }
    });

    // Handle reconnection attempts
    newSocket.on('reconnect_attempt', (attemptNumber) => {
      reconnectAttempts.current = attemptNumber;
      console.log(`🔄 [Socket] Reconnection attempt ${attemptNumber}/${maxReconnectAttempts}`);
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log(`✅ [Socket] Reconnected after ${attemptNumber} attempts`);
      setIsConnected(true);
      setConnectionError(null);
      
      // Re-join rooms after reconnection
      if (user?.id) {
        newSocket.emit('join-user-room', user.id);
        newSocket.emit('get-unread-count');
        if (user?.role === 'admin') {
          newSocket.emit('get-admin-unread-count');
        }
      }
    });

    newSocket.on('reconnect_failed', () => {
      console.error('❌ [Socket] Failed to reconnect to socket server');
      setConnectionError('Failed to reconnect after multiple attempts');
    });

    // ==================== NOTIFICATION EVENTS ====================
    
    // New notification received
    newSocket.on('new-notification', (data) => {
      console.log('🔔 [Socket] New notification received:', data);
      if (data.unreadCount !== undefined) {
        setUnreadCount(data.unreadCount);
      } else {
        // Increment unread count
        setUnreadCount(prev => prev + 1);
      }
    });

    // Notification marked as read
    newSocket.on('notification-read', (data) => {
      console.log('📖 [Socket] Notification read:', data);
      if (data.unreadCount !== undefined) {
        setUnreadCount(data.unreadCount);
      }
    });

    // All notifications marked as read
    newSocket.on('all-notifications-read', (data) => {
      console.log('✅ [Socket] All notifications read:', data);
      setUnreadCount(0);
    });

    // Notification deleted
    newSocket.on('notification-deleted', (data) => {
      console.log('🗑️ [Socket] Notification deleted:', data);
      // Unread count will be updated by the server
      newSocket.emit('get-unread-count');
    });

    // All notifications deleted
    newSocket.on('all-notifications-deleted', (data) => {
      console.log('🗑️ [Socket] All notifications deleted:', data);
      setUnreadCount(0);
    });

    // Unread count update
    newSocket.on('unread-count', (data) => {
      console.log('📊 [Socket] Unread count update:', data);
      if (data.count !== undefined) {
        setUnreadCount(data.count);
      }
    });

    // Admin unread count update
    newSocket.on('admin-unread-count', (data) => {
      console.log('📊 [Socket] Admin unread count update:', data);
      if (data.count !== undefined) {
        setAdminUnreadCount(data.count);
      }
    });

    // Admin notification
    newSocket.on('admin-notification', (data) => {
      console.log('👑 [Socket] Admin notification:', data);
      // Update admin unread count
      newSocket.emit('get-admin-unread-count');
    });

    // ==================== CHAT EVENTS ====================
    
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

    newSocket.on('chat-joined', (data) => {
      console.log('📥 [Socket] Chat joined:', data);
      if (data.sessionId) {
        setSessionId(data.sessionId);
      }
    });

    newSocket.on('new-message', (data) => {
      console.log('📥 [Socket] New message received:', data);
    });

    newSocket.on('user-typing', (data) => {
      console.log('⌨️ [Socket] User typing:', data);
    });

    newSocket.on('admin-typing', (data) => {
      console.log('⌨️ [Socket] Admin typing:', data);
    });

    newSocket.on('session-resolved', (data) => {
      console.log('✅ [Socket] Session resolved:', data);
    });

    newSocket.on('chat-error', (error) => {
      console.error('❌ [Socket] Chat error:', error);
    });

    return () => {
      // Cleanup listeners
      newSocket.off('connect');
      newSocket.off('disconnect');
      newSocket.off('connect_error');
      newSocket.off('reconnect_attempt');
      newSocket.off('reconnect');
      newSocket.off('reconnect_failed');
      newSocket.off('new-notification');
      newSocket.off('notification-read');
      newSocket.off('all-notifications-read');
      newSocket.off('notification-deleted');
      newSocket.off('all-notifications-deleted');
      newSocket.off('unread-count');
      newSocket.off('admin-unread-count');
      newSocket.off('admin-notification');
      newSocket.off('authenticated');
      newSocket.off('auth_error');
      newSocket.off('chat-joined');
      newSocket.off('new-message');
      newSocket.off('user-typing');
      newSocket.off('admin-typing');
      newSocket.off('session-resolved');
      newSocket.off('chat-error');
    };
  }, [user, getSocketUrl]);

  // Initialize socket connection
  useEffect(() => {
    // Clean up existing socket
    if (socketRef.current) {
      console.log('🧹 [Socket] Cleaning up existing connection');
      socketRef.current.disconnect();
      socketRef.current.close();
      socketRef.current = null;
    }

    // Don't connect if no token
    if (!token) {
      console.log('🔌 [Socket] No token available, skipping connection');
      setSocket(null);
      setIsConnected(false);
      return;
    }

    // Create new socket
    const newSocket = connectSocket();
    if (!newSocket) {
      console.log('🔌 [Socket] Failed to create socket connection');
      return;
    }

    socketRef.current = newSocket;
    setSocket(newSocket);

    // Setup event listeners
    const cleanupListeners = setupSocketListeners(newSocket);

    return () => {
      if (cleanupListeners) {
        cleanupListeners();
      }
      if (socketRef.current) {
        console.log('🧹 [Socket] Cleaning up socket on unmount');
        socketRef.current.disconnect();
        socketRef.current.close();
        socketRef.current = null;
      }
      setSocket(null);
      setIsConnected(false);
    };
  }, [token, user?.id, connectSocket, setupSocketListeners]);

  // ==================== SOCKET EMIT METHODS ====================

  // Join a chat room
  const joinChat = useCallback((data) => {
    if (socketRef.current && isConnected) {
      console.log('📤 [Socket] Joining chat:', data);
      socketRef.current.emit('join-chat', data);
    } else {
      console.warn('⚠️ [Socket] Cannot join chat - socket not connected');
    }
  }, [isConnected]);

  // Send a message
  const sendMessage = useCallback((data) => {
    if (socketRef.current && isConnected) {
      console.log('📤 [Socket] Sending message:', data);
      socketRef.current.emit('send-message', data);
    } else {
      console.warn('⚠️ [Socket] Cannot send message - socket not connected');
    }
  }, [isConnected]);

  // Send admin message
  const sendAdminMessage = useCallback((data) => {
    if (socketRef.current && isConnected) {
      console.log('📤 [Socket] Sending admin message:', data);
      socketRef.current.emit('admin-message', data);
    } else {
      console.warn('⚠️ [Socket] Cannot send admin message - socket not connected');
    }
  }, [isConnected]);

  // Send typing indicator
  const sendTyping = useCallback((data) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('typing', data);
    }
  }, [isConnected]);

  // Resolve a session
  const resolveSession = useCallback((sessionId) => {
    if (socketRef.current && isConnected) {
      console.log('📤 [Socket] Resolving session:', sessionId);
      socketRef.current.emit('resolve-session', { sessionId });
    } else {
      console.warn('⚠️ [Socket] Cannot resolve session - socket not connected');
    }
  }, [isConnected]);

  // Get unread count
  const getUnreadCount = useCallback(() => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('get-unread-count');
    }
  }, [isConnected]);

  // Get admin unread count
  const getAdminUnreadCount = useCallback(() => {
    if (socketRef.current && isConnected && user?.role === 'admin') {
      socketRef.current.emit('get-admin-unread-count');
    }
  }, [isConnected, user]);

  // Manual reconnect
  const reconnect = useCallback(() => {
    if (socketRef.current) {
      console.log('🔄 [Socket] Manual reconnect requested');
      socketRef.current.disconnect();
      setTimeout(() => {
        if (socketRef.current) {
          socketRef.current.connect();
        }
      }, 500);
    }
  }, []);

  // Disconnect socket
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      console.log('🔌 [Socket] Manual disconnect requested');
      socketRef.current.disconnect();
    }
  }, []);

  // ==================== CONTEXT VALUE ====================
  const value = {
    socket: socketRef.current,
    isConnected,
    sessionId,
    connectionError,
    unreadCount,
    adminUnreadCount,
    setSessionId,
    joinChat,
    sendMessage,
    sendAdminMessage,
    sendTyping,
    resolveSession,
    getUnreadCount,
    getAdminUnreadCount,
    reconnect,
    disconnect,
    // Helper to check if socket is ready
    isReady: socketRef.current !== null && isConnected,
    // Emit generic event
    emit: (event, data) => {
      if (socketRef.current && isConnected) {
        socketRef.current.emit(event, data);
      } else {
        console.warn(`⚠️ [Socket] Cannot emit ${event} - socket not connected`);
      }
    },
    // Listen for event (returns cleanup function)
    on: (event, callback) => {
      if (socketRef.current) {
        socketRef.current.on(event, callback);
        return () => {
          if (socketRef.current) {
            socketRef.current.off(event, callback);
          }
        };
      }
      return () => {};
    }
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;