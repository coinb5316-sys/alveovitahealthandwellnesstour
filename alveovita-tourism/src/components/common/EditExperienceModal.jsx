// src/components/common/EditExperienceModal.jsx
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, Upload, Image, Video, Mic, FileText, MapPin, 
  Loader2, AlertCircle, Trash2, Edit
} from 'lucide-react'
import { useToast } from '../../hooks/useToast'
import { useSocket } from '../../context/SocketContext'
import { regions } from '../../data/tourismData'
import axios from '../../api/axios'

const EditExperienceModal = ({
  isOpen,
  onClose,
  experience,
  isDark,
  onUpdate
}) => {
  const { showToast } = useToast()
  const { socket, isConnected } = useSocket()
  const fileInputRef = useRef(null)
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'text',
    region: 'greater-accra',
    tourName: '',
  })
  const [mediaFile, setMediaFile] = useState(null)
  const [mediaPreview, setMediaPreview] = useState(null)
  const [existingMediaUrl, setExistingMediaUrl] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  // Populate form with experience data when it changes
  useEffect(() => {
    if (experience) {
      setFormData({
        title: experience.title || '',
        content: experience.content || '',
        type: experience.type || 'text',
        region: experience.region || 'greater-accra',
        tourName: experience.tourName || '',
      })
      setExistingMediaUrl(experience.mediaUrl || null)
      setMediaPreview(experience.mediaUrl || null)
    }
  }, [experience])

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      showToast('File size must be less than 50MB', 'error')
      return
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 
      'video/mp4', 'video/quicktime', 'video/x-msvideo',
      'audio/mp3', 'audio/wav', 'audio/mpeg']
    if (!validTypes.includes(file.type)) {
      showToast('Please upload an image, video, or audio file', 'error')
      return
    }

    setMediaFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setMediaPreview(reader.result)
    }
    reader.readAsDataURL(file)

    // Auto-detect type
    if (file.type.startsWith('image/')) {
      setFormData(prev => ({ ...prev, type: 'image' }))
    } else if (file.type.startsWith('video/')) {
      setFormData(prev => ({ ...prev, type: 'video' }))
    } else if (file.type.startsWith('audio/')) {
      setFormData(prev => ({ ...prev, type: 'audio' }))
    }
  }

  const removeMedia = () => {
    setMediaFile(null)
    setMediaPreview(null)
    setExistingMediaUrl(null)
    setFormData(prev => ({ ...prev, type: 'text' }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    // Validate
    if (!formData.title.trim()) {
      setError('Please enter a title')
      return
    }
    if (!formData.content.trim()) {
      setError('Please enter content')
      return
    }
    if (!formData.region) {
      setError('Please select a region')
      return
    }

    setSubmitting(true)
    try {
      const formDataToSend = new FormData()
      formDataToSend.append('title', formData.title.trim())
      formDataToSend.append('content', formData.content.trim())
      formDataToSend.append('type', formData.type)
      formDataToSend.append('region', formData.region)
      formDataToSend.append('tourName', formData.tourName.trim() || 'General Experience')
      
      if (mediaFile) {
        formDataToSend.append('media', mediaFile)
      }

      if (onUpdate) {
        await onUpdate(experience._id, formDataToSend)
      } else {
        await axios.put(`/experiences/${experience._id}`, formDataToSend, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
      }
      
      showToast('Experience updated successfully!', 'success')
      
      // Socket.IO will broadcast the update via experience-updated event
      
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to update experience')
      showToast('Failed to update experience', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const getRegionName = (id) => {
    const region = regions.find(r => r.id === id)
    return region ? region.name : id
  }

  if (!isOpen || !experience) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className={`max-w-2xl w-full max-h-[90vh] rounded-2xl overflow-hidden ${
          isDark ? 'bg-gray-900' : 'bg-white'
        } shadow-2xl flex flex-col`}
      >
        {/* Connection Status */}
        {isConnected && (
          <div className={`px-4 py-1 text-center text-xs ${
            isDark ? 'bg-green-500/10 text-green-400' : 'bg-green-100 text-green-600'
          }`}>
            🔴 Live • Your changes will be updated in real-time
          </div>
        )}

        {/* Header */}
        <div className={`flex items-center justify-between p-4 border-b ${
          isDark ? 'border-gray-800' : 'border-gray-200'
        }`}>
          <div>
            <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Edit Experience
            </h2>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Update your travel story
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form - Rest remains the same */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Give your experience a title..."
                className={`w-full px-4 py-2.5 rounded-lg outline-none ${
                  isDark 
                    ? 'bg-gray-800 text-white placeholder-gray-400 border-gray-700' 
                    : 'bg-gray-100 text-gray-800 placeholder-gray-400 border-gray-200'
                } border focus:border-amber-500 transition-colors`}
                disabled={submitting}
              />
            </div>

            {/* Content */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Content *
              </label>
              <textarea
                rows={4}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Tell your story..."
                className={`w-full px-4 py-2.5 rounded-lg outline-none ${
                  isDark 
                    ? 'bg-gray-800 text-white placeholder-gray-400 border-gray-700' 
                    : 'bg-gray-100 text-gray-800 placeholder-gray-400 border-gray-200'
                } border focus:border-amber-500 transition-colors resize-none`}
                disabled={submitting}
              />
            </div>

            {/* Post Type */}
            <div>
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Post Type
              </label>
              <div className="flex flex-wrap gap-2">
                {['text', 'image', 'video', 'audio'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, type })
                      if (type === 'text') {
                        removeMedia()
                      }
                    }}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                      formData.type === type
                        ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                        : isDark
                          ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {type === 'text' && <FileText className="w-4 h-4" />}
                    {type === 'image' && <Image className="w-4 h-4" />}
                    {type === 'video' && <Video className="w-4 h-4" />}
                    {type === 'audio' && <Mic className="w-4 h-4" />}
                    <span className="capitalize">{type}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Media Upload */}
            {formData.type !== 'text' && (
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Media File {!existingMediaUrl && '*'}
                </label>
                {mediaPreview ? (
                  <div className="relative">
                    {formData.type === 'image' && (
                      <img 
                        src={mediaPreview} 
                        alt="Preview" 
                        className="w-full max-h-64 object-cover rounded-lg"
                      />
                    )}
                    {formData.type === 'video' && (
                      <video 
                        src={mediaPreview} 
                        className="w-full max-h-64 object-cover rounded-lg" 
                        controls
                      />
                    )}
                    {formData.type === 'audio' && (
                      <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                        <audio src={mediaPreview} controls className="w-full" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={removeMedia}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    {existingMediaUrl && mediaPreview === existingMediaUrl && (
                      <span className="absolute bottom-2 left-2 text-xs bg-black/50 text-white px-2 py-1 rounded">
                        Current Media
                      </span>
                    )}
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                      isDark 
                        ? 'border-gray-700 hover:border-amber-500/50' 
                        : 'border-gray-300 hover:border-amber-500/50'
                    }`}
                  >
                    <Upload className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Click to upload new media or keep existing
                    </p>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      Supported: JPG, PNG, GIF, MP4, MP3 (max 50MB)
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*,audio/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Region */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Region *
              </label>
              <select
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className={`w-full px-4 py-2.5 rounded-lg outline-none ${
                  isDark 
                    ? 'bg-gray-800 text-white border-gray-700' 
                    : 'bg-gray-100 text-gray-800 border-gray-200'
                } border focus:border-amber-500 transition-colors`}
                disabled={submitting}
              >
                {regions.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tour Name */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Tour/Hotel Name (optional)
              </label>
              <input
                type="text"
                value={formData.tourName}
                onChange={(e) => setFormData({ ...formData, tourName: e.target.value })}
                placeholder="Which tour or hotel is this about?"
                className={`w-full px-4 py-2.5 rounded-lg outline-none ${
                  isDark 
                    ? 'bg-gray-800 text-white placeholder-gray-400 border-gray-700' 
                    : 'bg-gray-100 text-gray-800 placeholder-gray-400 border-gray-200'
                } border focus:border-amber-500 transition-colors`}
                disabled={submitting}
              />
            </div>

            {/* Error */}
            {error && (
              <div className={`p-3 rounded-lg flex items-center gap-2 ${
                isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-600'
              } border border-red-500/30`}>
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Submit */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className={`flex-1 px-4 py-2.5 rounded-lg ${
                  isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                } transition-all`}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg font-medium hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4" />
                    Update Experience
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

export default EditExperienceModal