// src/utils/helpers.js
export const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
}

export const getInitials = (name) => {
  if (!name) return 'U'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export const getRegionName = (regionId) => {
  const regionMap = {
    'greater-accra': 'Greater Accra',
    'ashanti': 'Ashanti',
    'western': 'Western',
    'eastern': 'Eastern',
    'central': 'Central',
    'volta': 'Volta',
    'northern': 'Northern',
    'upper-east': 'Upper East',
    'upper-west': 'Upper West',
    'bono': 'Bono',
    'ahafo': 'Ahafo',
    'savannah': 'Savannah',
    'north-east': 'North East',
    'oti': 'Oti',
    'western-north': 'Western North'
  }
  return regionMap[regionId] || regionId
}

export const truncateText = (text, maxLength = 150) => {
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export const getTimeAgo = (date) => {
  const now = new Date()
  const diff = now - new Date(date)
  
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const weeks = Math.floor(days / 7)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)
  
  if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`
  if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`
  if (weeks > 0) return `${weeks} week${weeks > 1 ? 's' : ''} ago`
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  return 'Just now'
}