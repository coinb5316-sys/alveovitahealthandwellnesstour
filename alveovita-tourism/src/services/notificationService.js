// src/services/notificationService.js
import axios from '../api/axios';

/**
 * Notification Service - Single source of truth for all notification operations
 * This service handles all API calls and business logic for notifications
 */
class NotificationService {
  constructor() {
    this._unreadCount = 0;
    this._adminUnreadCount = 0;
    this._listeners = [];
    this._isInitialized = false;
  }

  // ============================================
  // INITIALIZE
  // ============================================
  initialize() {
    if (this._isInitialized) return;
    this._isInitialized = true;
    console.log('🔔 [NotificationService] Initialized');
  }

  // ============================================
  // EVENT LISTENERS (Alveoly Pattern)
  // ============================================
  addListener(callback) {
    this._listeners.push(callback);
    return () => {
      this._listeners = this._listeners.filter(cb => cb !== callback);
    };
  }

  _notifyListeners(event, data) {
    this._listeners.forEach(callback => {
      try {
        callback(event, data);
      } catch (error) {
        console.error('❌ [NotificationService] Listener error:', error);
      }
    });
  }

  // ============================================
  // FETCH NOTIFICATIONS
  // ============================================
  async fetchNotifications(params = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        filter = 'all',
        type = null,
        search = '',
        sort = 'desc',
        read = null
      } = params;

      const queryParams = new URLSearchParams({
        page,
        limit,
        sort
      });

      if (read !== null) {
        queryParams.append('read', read);
      } else if (filter === 'unread') {
        queryParams.append('read', 'false');
      } else if (filter === 'read') {
        queryParams.append('read', 'true');
      } else if (filter !== 'all' && filter !== 'unread' && filter !== 'read') {
        queryParams.append('type', filter);
      }

      if (type && type !== 'all') {
        queryParams.append('type', type);
      }

      if (search && search.trim()) {
        queryParams.append('search', search.trim());
      }

      const response = await axios.get(`/notifications?${queryParams}`);
      
      if (response.data.success) {
        return {
          success: true,
          notifications: response.data.notifications || [],
          pagination: response.data.pagination || {},
          unreadCount: response.data.unreadCount || 0,
          total: response.data.total || 0,
          hasMore: response.data.pagination?.hasMore || false
        };
      }
      
      return {
        success: false,
        notifications: [],
        pagination: {},
        unreadCount: 0,
        total: 0,
        hasMore: false,
        error: 'Failed to fetch notifications'
      };
    } catch (error) {
      console.error('❌ [NotificationService] fetchNotifications error:', error);
      return {
        success: false,
        notifications: [],
        pagination: {},
        unreadCount: 0,
        total: 0,
        hasMore: false,
        error: error.response?.data?.message || 'Failed to fetch notifications'
      };
    }
  }

  // ============================================
  // FETCH UNREAD COUNT
  // ============================================
  async fetchUnreadCount() {
    try {
      const response = await axios.get('/notifications/count');
      if (response.data.success) {
        this._unreadCount = response.data.unreadCount || 0;
        this._notifyListeners('count-updated', { 
          unreadCount: this._unreadCount,
          adminUnreadCount: this._adminUnreadCount
        });
        return {
          success: true,
          unreadCount: this._unreadCount
        };
      }
      return {
        success: false,
        unreadCount: 0,
        error: 'Failed to fetch unread count'
      };
    } catch (error) {
      console.error('❌ [NotificationService] fetchUnreadCount error:', error);
      return {
        success: false,
        unreadCount: 0,
        error: error.response?.data?.message || 'Failed to fetch unread count'
      };
    }
  }

  // ============================================
  // MARK AS READ
  // ============================================
  async markAsRead(notificationId) {
    if (!notificationId) {
      return { success: false, error: 'Notification ID is required' };
    }

    try {
      const response = await axios.put(`/notifications/${notificationId}/read`);
      if (response.data.success) {
        this._unreadCount = response.data.unreadCount || Math.max(0, this._unreadCount - 1);
        this._notifyListeners('notification-read', {
          notificationId,
          unreadCount: this._unreadCount
        });
        return {
          success: true,
          notification: response.data.notification,
          unreadCount: this._unreadCount
        };
      }
      return {
        success: false,
        error: 'Failed to mark as read'
      };
    } catch (error) {
      console.error('❌ [NotificationService] markAsRead error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to mark as read'
      };
    }
  }

  // ============================================
  // MARK ALL AS READ
  // ============================================
  async markAllAsRead() {
    try {
      const response = await axios.put('/notifications/read-all');
      if (response.data.success) {
        this._unreadCount = 0;
        this._notifyListeners('all-read', { unreadCount: 0 });
        return {
          success: true,
          unreadCount: 0
        };
      }
      return {
        success: false,
        error: 'Failed to mark all as read'
      };
    } catch (error) {
      console.error('❌ [NotificationService] markAllAsRead error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to mark all as read'
      };
    }
  }

  // ============================================
  // DELETE NOTIFICATION
  // ============================================
  async deleteNotification(notificationId) {
    if (!notificationId) {
      return { success: false, error: 'Notification ID is required' };
    }

    try {
      const response = await axios.delete(`/notifications/${notificationId}`);
      if (response.data.success) {
        this._unreadCount = response.data.unreadCount || this._unreadCount;
        this._notifyListeners('notification-deleted', {
          notificationId,
          unreadCount: this._unreadCount
        });
        return {
          success: true,
          unreadCount: this._unreadCount
        };
      }
      return {
        success: false,
        error: 'Failed to delete notification'
      };
    } catch (error) {
      console.error('❌ [NotificationService] deleteNotification error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete notification'
      };
    }
  }

  // ============================================
  // DELETE ALL READ
  // ============================================
  async deleteAllRead() {
    try {
      const response = await axios.delete('/notifications/read-all');
      if (response.data.success) {
        this._unreadCount = response.data.unreadCount || 0;
        this._notifyListeners('all-deleted', { unreadCount: this._unreadCount });
        return {
          success: true,
          unreadCount: this._unreadCount
        };
      }
      return {
        success: false,
        error: 'Failed to delete read notifications'
      };
    } catch (error) {
      console.error('❌ [NotificationService] deleteAllRead error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete read notifications'
      };
    }
  }

  // ============================================
  // DELETE ALL NOTIFICATIONS
  // ============================================
  async deleteAllNotifications() {
    try {
      const response = await axios.delete('/notifications/delete-all');
      if (response.data.success) {
        this._unreadCount = 0;
        this._notifyListeners('all-deleted', { unreadCount: 0 });
        return {
          success: true,
          unreadCount: 0
        };
      }
      return {
        success: false,
        error: 'Failed to delete all notifications'
      };
    } catch (error) {
      console.error('❌ [NotificationService] deleteAllNotifications error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete all notifications'
      };
    }
  }

  // ============================================
  // FETCH NOTIFICATION TYPES
  // ============================================
  async fetchTypes() {
    try {
      const response = await axios.get('/notifications/types');
      if (response.data.success) {
        return {
          success: true,
          types: response.data.types || []
        };
      }
      return {
        success: false,
        types: [],
        error: 'Failed to fetch types'
      };
    } catch (error) {
      console.error('❌ [NotificationService] fetchTypes error:', error);
      return {
        success: false,
        types: [],
        error: error.response?.data?.message || 'Failed to fetch types'
      };
    }
  }

  // ============================================
  // FETCH STATS (Admin only)
  // ============================================
  async fetchStats() {
    try {
      const response = await axios.get('/notifications/stats');
      if (response.data.success) {
        return {
          success: true,
          stats: response.data.stats || {}
        };
      }
      return {
        success: false,
        stats: {},
        error: 'Failed to fetch stats'
      };
    } catch (error) {
      if (error.response?.status === 403) {
        return {
          success: false,
          stats: {},
          error: 'Admin access required'
        };
      }
      console.error('❌ [NotificationService] fetchStats error:', error);
      return {
        success: false,
        stats: {},
        error: error.response?.data?.message || 'Failed to fetch stats'
      };
    }
  }

  // ============================================
  // BULK OPERATIONS
  // ============================================
  async markMultipleAsRead(notificationIds) {
    if (!notificationIds || notificationIds.length === 0) {
      return { success: false, error: 'No notifications selected' };
    }

    try {
      const promises = notificationIds.map(id => 
        axios.put(`/notifications/${id}/read`)
      );
      await Promise.all(promises);
      
      // Fetch updated count
      await this.fetchUnreadCount();
      
      this._notifyListeners('multiple-read', {
        count: notificationIds.length,
        unreadCount: this._unreadCount
      });
      
      return {
        success: true,
        unreadCount: this._unreadCount
      };
    } catch (error) {
      console.error('❌ [NotificationService] markMultipleAsRead error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to mark multiple as read'
      };
    }
  }

  async deleteMultiple(notificationIds) {
    if (!notificationIds || notificationIds.length === 0) {
      return { success: false, error: 'No notifications selected' };
    }

    try {
      const promises = notificationIds.map(id => 
        axios.delete(`/notifications/${id}`)
      );
      await Promise.all(promises);
      
      // Fetch updated count
      await this.fetchUnreadCount();
      
      this._notifyListeners('multiple-deleted', {
        count: notificationIds.length,
        unreadCount: this._unreadCount
      });
      
      return {
        success: true,
        unreadCount: this._unreadCount
      };
    } catch (error) {
      console.error('❌ [NotificationService] deleteMultiple error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete multiple notifications'
      };
    }
  }

  // ============================================
  // GET UNREAD COUNT
  // ============================================
  getUnreadCount() {
    return this._unreadCount;
  }

  // ============================================
  // SET UNREAD COUNT
  // ============================================
  setUnreadCount(count) {
    this._unreadCount = Math.max(0, count);
    this._notifyListeners('count-updated', { 
      unreadCount: this._unreadCount,
      adminUnreadCount: this._adminUnreadCount
    });
  }

  // ============================================
  // GET ADMIN UNREAD COUNT
  // ============================================
  getAdminUnreadCount() {
    return this._adminUnreadCount;
  }

  // ============================================
  // SET ADMIN UNREAD COUNT
  // ============================================
  setAdminUnreadCount(count) {
    this._adminUnreadCount = Math.max(0, count);
    this._notifyListeners('count-updated', { 
      unreadCount: this._unreadCount,
      adminUnreadCount: this._adminUnreadCount
    });
  }

  // ============================================
  // HANDLE SOCKET EVENTS (Alveoly Pattern)
  // ============================================
  handleSocketEvent(event, data) {
    switch (event) {
      case 'new_notification':
      case 'new-notification':
        if (data.notification) {
          this._notifyListeners('new-notification', data);
        }
        if (data.unreadCount !== undefined) {
          this.setUnreadCount(data.unreadCount);
        } else {
          this.setUnreadCount(this._unreadCount + 1);
        }
        break;

      case 'notification-read':
        if (data.notificationId) {
          this._notifyListeners('notification-read', data);
        }
        if (data.unreadCount !== undefined) {
          this.setUnreadCount(data.unreadCount);
        } else {
          this.fetchUnreadCount();
        }
        break;

      case 'all-notifications-read':
        this.setUnreadCount(0);
        this._notifyListeners('all-read', { unreadCount: 0 });
        break;

      case 'notification-deleted':
        if (data.notificationId) {
          this._notifyListeners('notification-deleted', data);
        }
        if (data.unreadCount !== undefined) {
          this.setUnreadCount(data.unreadCount);
        } else {
          this.fetchUnreadCount();
        }
        break;

      case 'all-notifications-deleted':
        this.setUnreadCount(0);
        this._notifyListeners('all-deleted', { unreadCount: 0 });
        break;

      case 'unread-count':
        if (data.count !== undefined) {
          this.setUnreadCount(data.count);
        }
        break;

      case 'admin-unread-count':
        if (data.count !== undefined) {
          this.setAdminUnreadCount(data.count);
        }
        break;

      case 'new_admin_notification':
        this._notifyListeners('admin-notification', data);
        this.fetchUnreadCount();
        break;

      default:
        console.log(`ℹ️ [NotificationService] Unhandled socket event: ${event}`, data);
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();

// Export default for convenience
export default notificationService;