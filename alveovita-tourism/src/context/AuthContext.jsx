// src/context/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react'
import { googleLogout } from '@react-oauth/google'
import { useNavigate } from 'react-router-dom'
import API from '../api/axios'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  // ============================================================
  // INITIALIZATION - Check for stored user on mount
  // ============================================================
  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser))
        verifyToken(token)
      } catch (e) {
        clearAuthData()
      }
    }
    setLoading(false)
  }, [])

  // ============================================================
  // TOKEN MANAGEMENT
  // ============================================================
  const clearAuthData = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    setUser(null)
  }

  const setAuthData = (token, refreshToken, userData) => {
    localStorage.setItem('token', token)
    localStorage.setItem('refreshToken', refreshToken)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  const verifyToken = async (token) => {
    try {
      const response = await API.get('/auth/verify', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.data.success) {
        setUser(response.data.user)
        localStorage.setItem('user', JSON.stringify(response.data.user))
      } else {
        clearAuthData()
      }
    } catch (error) {
      console.error('Token verification failed:', error)
      if (error.response?.status === 401) {
        tryRefreshToken()
      } else {
        clearAuthData()
      }
    }
  }

  const tryRefreshToken = async () => {
    const refreshToken = localStorage.getItem('refreshToken')
    if (!refreshToken) {
      clearAuthData()
      return
    }

    try {
      const response = await API.post('/auth/refresh-token', { refreshToken })
      if (response.data.success) {
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('refreshToken', response.data.refreshToken)
        await verifyToken(response.data.token)
      }
    } catch (error) {
      clearAuthData()
    }
  }

  // ============================================================
  // AUTHENTICATION METHODS
  // ============================================================

  const login = async (email, password) => {
    try {
      setLoading(true)
      setError(null)

      const response = await API.post('/auth/login', { email, password })
      
      if (response.data.success) {
        const { token, refreshToken, user } = response.data
        setAuthData(token, refreshToken, user)
        setLoading(false)
        
        if (user.role === 'admin') {
          navigate('/admin')
        } else {
          navigate('/dashboard')
        }
        
        return { success: true, user }
      } else {
        setError(response.data.message || 'Login failed')
        setLoading(false)
        return { success: false, error: response.data.message }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Login failed'
      setError(errorMessage)
      setLoading(false)
      return { success: false, error: errorMessage }
    }
  }

  const register = async (userData) => {
    try {
      setLoading(true)
      setError(null)

      const response = await API.post('/auth/register', userData)
      
      if (response.data.success) {
        const { token, refreshToken, user } = response.data
        setAuthData(token, refreshToken, user)
        setLoading(false)
        navigate('/dashboard')
        return { success: true, user }
      } else {
        setError(response.data.message || 'Registration failed')
        setLoading(false)
        return { success: false, error: response.data.message }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Registration failed'
      setError(errorMessage)
      setLoading(false)
      return { success: false, error: errorMessage }
    }
  }

  const googleLogin = async (credentialResponse) => {
    try {
      setLoading(true)
      setError(null)

      const response = await API.post('/auth/google', {
        credential: credentialResponse.credential
      })
      
      if (response.data.success) {
        const { token, refreshToken, user } = response.data
        setAuthData(token, refreshToken, user)
        setLoading(false)
        navigate('/dashboard')
        return { success: true, user }
      } else {
        setError(response.data.message || 'Google login failed')
        setLoading(false)
        return { success: false, error: response.data.message }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Google login failed'
      setError(errorMessage)
      setLoading(false)
      return { success: false, error: errorMessage }
    }
  }

  const logout = async () => {
    try {
      const token = localStorage.getItem('token')
      if (token) {
        await API.post('/auth/logout', {}, {
          headers: { Authorization: `Bearer ${token}` }
        })
      }
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      googleLogout()
      clearAuthData()
      navigate('/')
    }
  }

  // ============================================================
  // PROFILE MANAGEMENT
  // ============================================================

  const updateUser = async (updatedData) => {
    try {
      setLoading(true)
      const response = await API.put('/users/profile', updatedData)
      
      if (response.data.success) {
        const updatedUser = response.data.user
        localStorage.setItem('user', JSON.stringify(updatedUser))
        setUser(updatedUser)
        setLoading(false)
        return { success: true, user: updatedUser }
      } else {
        setError(response.data.message || 'Update failed')
        setLoading(false)
        return { success: false, error: response.data.message }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Update failed'
      setError(errorMessage)
      setLoading(false)
      return { success: false, error: errorMessage }
    }
  }

  // Upload profile avatar
  const uploadAvatar = async (file) => {
    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('avatar', file)

      const response = await API.post('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      if (response.data.success) {
        const updatedUser = response.data.user || { ...user, avatar: response.data.avatar }
        localStorage.setItem('user', JSON.stringify(updatedUser))
        setUser(updatedUser)
        setLoading(false)
        return { success: true, avatar: response.data.avatar, user: updatedUser }
      } else {
        setError(response.data.message || 'Upload failed')
        setLoading(false)
        return { success: false, error: response.data.message }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Upload failed'
      setError(errorMessage)
      setLoading(false)
      return { success: false, error: errorMessage }
    }
  }

  const changePassword = async (currentPassword, newPassword) => {
    try {
      setLoading(true)
      setError(null)

      const response = await API.post('/users/change-password', {
        currentPassword,
        newPassword
      })
      
      if (response.data.success) {
        setLoading(false)
        return { success: true, message: response.data.message }
      } else {
        setError(response.data.message || 'Password change failed')
        setLoading(false)
        return { success: false, error: response.data.message }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Password change failed'
      setError(errorMessage)
      setLoading(false)
      return { success: false, error: errorMessage }
    }
  }

  const getUserStats = async () => {
    try {
      const response = await API.get('/users/stats')
      if (response.data.success) {
        return { success: true, stats: response.data.stats }
      }
      return { success: false, error: response.data.message }
    } catch (err) {
      console.error('Get stats error:', err)
      return { success: false, error: err.message }
    }
  }

  // ============================================================
  // ADMIN PROFILE MANAGEMENT
  // ============================================================

  const updateAdminProfile = async (updatedData) => {
    try {
      setLoading(true)
      const response = await API.put('/admin/profile', updatedData)
      
      if (response.data.success) {
        const updatedUser = response.data.user
        localStorage.setItem('user', JSON.stringify(updatedUser))
        setUser(updatedUser)
        setLoading(false)
        return { success: true, user: updatedUser }
      } else {
        setError(response.data.message || 'Update failed')
        setLoading(false)
        return { success: false, error: response.data.message }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Update failed'
      setError(errorMessage)
      setLoading(false)
      return { success: false, error: errorMessage }
    }
  }

  // Upload admin avatar (ONLY ONE DECLARATION)
  const uploadAdminAvatar = async (file) => {
    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('avatar', file)

      const response = await API.post('/admin/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      if (response.data.success) {
        const updatedUser = response.data.user || { ...user, avatar: response.data.avatar }
        localStorage.setItem('user', JSON.stringify(updatedUser))
        setUser(updatedUser)
        setLoading(false)
        return { success: true, avatar: response.data.avatar, user: updatedUser }
      } else {
        setError(response.data.message || 'Upload failed')
        setLoading(false)
        return { success: false, error: response.data.message }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Upload failed'
      setError(errorMessage)
      setLoading(false)
      return { success: false, error: errorMessage }
    }
  }

  const changeAdminPassword = async (currentPassword, newPassword) => {
    try {
      setLoading(true)
      setError(null)

      const response = await API.post('/admin/change-password', {
        currentPassword,
        newPassword
      })
      
      if (response.data.success) {
        setLoading(false)
        return { success: true, message: response.data.message }
      } else {
        setError(response.data.message || 'Password change failed')
        setLoading(false)
        return { success: false, error: response.data.message }
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Password change failed'
      setError(errorMessage)
      setLoading(false)
      return { success: false, error: errorMessage }
    }
  }

  // ============================================================
  // HELPER METHODS
  // ============================================================

  const getDemoAccounts = () => {
    return [
      { email: 'user@alveovita.com', password: 'password123', role: 'user', name: 'John Doe' },
      { email: 'admin@alveovita.com', password: 'admin123', role: 'admin', name: 'Admin User' }
    ]
  }

  const refreshUser = async () => {
    const token = localStorage.getItem('token')
    if (token) {
      await verifyToken(token)
    }
  }

  // ============================================================
  // CONTEXT PROVIDER
  // ============================================================
  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      
      login,
      register,
      googleLogin,
      logout,
      
      updateUser,
      uploadAvatar,
      changePassword,
      getUserStats,
      refreshUser,
      
      updateAdminProfile,
      uploadAdminAvatar,
      changeAdminPassword,
      
      getDemoAccounts
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}