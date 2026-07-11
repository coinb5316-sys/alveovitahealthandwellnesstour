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

  // ============================================
  // FIXED: Get socket URL with proper fallbacks
  // ============================================
  const getSocketUrl = useCallback(() => {
    // Try environment variable first
    const envUrl = import.meta.env.VITE_SOCKET_URL;
    if (envUrl) {
      console.log('🔌 [Socket] Using VITE_SOCKET_URL:', envUrl);
      return envUrl;
    }
    
    // Try API URL
    const apiUrl = import.meta.env.VITE_API_URL;
    if (apiUrl) {
      console.log('🔌 [Socket] Using VITE_API_URL:', apiUrl);
      return apiUrl;
    }
    
    // Fallback to window location
    const origin = window.location.origin;
    console.log('🔌 [Socket] Using window.location.origin:', origin);
    return origin;
  }, []);

  // ============================================
  // Connect to socket
  // ============================================
  const connectSocket = useCallback(() => {
    if (!token) {
      console.log('🔌 [Socket] No token available, skipping connection');
      return null;
    }

    const socketUrl = getSocketUrl();
    console.log('🔌 [Socket] Connecting to:', socketUrl);
    console.log('🔌 [Socket] User:', user?.id, user?.role);
    
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
      auth: {
        token: token,
        userId: user?.id || null
      },
      query: {
        userId: user?.id || '',
        userType: user?.role || 'guest',
        platform: 'mobile'
      }
    });

    return newSocket;
  }, [token, user, getSocketUrl]);

  // ============================================
  // Setup socket event listeners
  // ============================================
  const setupSocketListeners = useCallback((newSocket) => {
    if (!newSocket) return;

    // Connection events
    newSocket.on('connect', () => {
      console.log('🟢 [Socket] Connected! ID:', newSocket.id);
      setIsConnected(true);
      setConnectionError(null);
      reconnectAttempts.current = 0;
      
      if (user?.id) {
        console.log('🔐 [Socket] Joining user room:', user.id);
        newSocket.emit('join-user-room', user.id);
        newSocket.emit('get-unread-count');
        
        if (user?.role === 'admin') {
          newSocket.emit('get-admin-unread-count');
        }
      }
    });

    newSocket.on('disconnect', (reason) => {
      console.log('🔴 [Socket] Disconnected. Reason:', reason);
      setIsConnected(false);
      
      if (reason === 'io server disconnect') {
        setTimeout(() => {
          if (newSocket) {
            newSocket.connect();
          }
        }, 1000);
      }
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ [Socket] Connection error:', error.message);
      setConnectionError(error.message);
      setIsConnected(false);
    });

    newSocket.on('reconnect_attempt', (attemptNumber) => {
      reconnectAttempts.current = attemptNumber;
      console.log(`🔄 [Socket] Reconnection attempt ${attemptNumber}/${maxReconnectAttempts}`);
    });

    newSocket.on('reconnect', (attemptNumber) => {
      console.log(`✅ [Socket] Reconnected after ${attemptNumber} attempts`);
      setIsConnected(true);
      setConnectionError(null);
      
      if (user?.id) {
        newSocket.emit('join-user-room', user.id);
        newSocket.emit('get-unread-count');
        if (user?.role === 'admin') {
          newSocket.emit('get-admin-unread-count');
        }
      }
    });

    newSocket.on('reconnect_failed', () => {
      console.error('❌ [Socket] Failed to reconnect');
      setConnectionError('Failed to reconnect after multiple attempts');
    });

    // ============================================
    // NOTIFICATION EVENTS
    // ============================================
    
    newSocket.on('new-notification', (data) => {
      console.log('🔔 [Socket] New notification:', data);
      if (data.unreadCount !== undefined) {
        setUnreadCount(data.unreadCount);
      } else {
        setUnreadCount(prev => prev + 1);
      }
    });

    newSocket.on('notification-read', (data) => {
      console.log('📖 [Socket] Notification read:', data);
      if (data.unreadCount !== undefined) {
        setUnreadCount(data.unreadCount);
      }
    });

    newSocket.on('all-notifications-read', () => {
      console.log('✅ [Socket] All notifications read');
      setUnreadCount(0);
    });

    newSocket.on('notification-deleted', () => {
      console.log('🗑️ [Socket] Notification deleted');
      newSocket.emit('get-unread-count');
    });

    newSocket.on('all-notifications-deleted', () => {
      console.log('🗑️ [Socket] All notifications deleted');
      setUnreadCount(0);
    });

    newSocket.on('unread-count', (data) => {
      console.log('📊 [Socket] Unread count:', data);
      if (data.count !== undefined) {
        setUnreadCount(data.count);
      }
    });

    newSocket.on('admin-unread-count', (data) => {
      console.log('📊 [Socket] Admin unread count:', data);
      if (data.count !== undefined) {
        setAdminUnreadCount(data.count);
      }
    });

    newSocket.on('admin-notification', (data) => {
      console.log('👑 [Socket] Admin notification:', data);
      newSocket.emit('get-admin-unread-count');
    });

    // ============================================
    // CHAT EVENTS
    // ============================================
    
    newSocket.on('authenticated', (data) => {
      console.log('✅ [Socket] Authenticated:', data);
      if (data.sessionId) {
        setSessionId(data.sessionId);
      }
    });

    newSocket.on('auth_error', (error) => {
      console.error('❌ [Socket] Auth error:', error);
      setConnectionError(error.message);
    });

    newSocket.on('chat-joined', (data) => {
      console.log('📥 [Socket] Chat joined:', data);
      if (data.sessionId) {
        setSessionId(data.sessionId);
      }
    });

    newSocket.on('new-message', (data) => {
      console.log('📥 [Socket] New message:', data);
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
  }, [user]);

  // ============================================
  // Initialize socket connection
  // ============================================
  useEffect(() => {
    if (socketRef.current) {
      console.log('🧹 [Socket] Cleaning up existing connection');
      socketRef.current.disconnect();
      socketRef.current.close();
      socketRef.current = null;
    }

    if (!token) {
      console.log('🔌 [Socket] No token, skipping connection');
      setSocket(null);
      setIsConnected(false);
      return;
    }

    const newSocket = connectSocket();
    if (!newSocket) {
      console.log('🔌 [Socket] Failed to create socket');
      return;
    }

    socketRef.current = newSocket;
    setSocket(newSocket);

    const cleanupListeners = setupSocketListeners(newSocket);

    return () => {
      if (cleanupListeners) {
        cleanupListeners();
      }
      if (socketRef.current) {
        console.log('🧹 [Socket] Cleaning up on unmount');
        socketRef.current.disconnect();
        socketRef.current.close();
        socketRef.current = null;
      }
      setSocket(null);
      setIsConnected(false);
    };
  }, [token, user?.id, connectSocket, setupSocketListeners]);

  // ============================================
  // Socket emit methods
  // ============================================
  
  const joinChat = useCallback((data) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('join-chat', data);
    }
  }, [isConnected]);

  const sendMessage = useCallback((data) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('send-message', data);
    }
  }, [isConnected]);

  const sendAdminMessage = useCallback((data) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('admin-message', data);
    }
  }, [isConnected]);

  const sendTyping = useCallback((data) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('typing', data);
    }
  }, [isConnected]);

  const resolveSession = useCallback((sessionId) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('resolve-session', { sessionId });
    }
  }, [isConnected]);

  const getUnreadCount = useCallback(() => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('get-unread-count');
    }
  }, [isConnected]);

  const getAdminUnreadCount = useCallback(() => {
    if (socketRef.current && isConnected && user?.role === 'admin') {
      socketRef.current.emit('get-admin-unread-count');
    }
  }, [isConnected, user]);

  const reconnect = useCallback(() => {
    if (socketRef.current) {
      console.log('🔄 [Socket] Manual reconnect');
      socketRef.current.disconnect();
      setTimeout(() => {
        if (socketRef.current) {
          socketRef.current.connect();
        }
      }, 500);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      console.log('🔌 [Socket] Manual disconnect');
      socketRef.current.disconnect();
    }
  }, []);

  const emit = useCallback((event, data) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn(`⚠️ [Socket] Cannot emit ${event} - not connected`);
    }
  }, [isConnected]);

  const on = useCallback((event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
      return () => {
        if (socketRef.current) {
          socketRef.current.off(event, callback);
        }
      };
    }
    return () => {};
  }, []);

  // ============================================
  // Context value
  // ============================================
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
    isReady: socketRef.current !== null && isConnected,
    emit,
    on
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;