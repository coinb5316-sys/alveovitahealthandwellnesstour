// src/hooks/useToast.js
import { useContext } from 'react'
import { NotificationContext } from '../context/NotificationContext'

export const useToast = () => {
  const { showToast } = useContext(NotificationContext)
  return { showToast }
}