import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ExternalLink, MessageCircle, Calendar, Share2, Copy } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { supabase } from '../lib/supabase'
import cachedDB from '../lib/cachedDatabase'
import { APP_CONFIG } from '../config/app'
import LoadingSpinner from '../components/LoadingSpinner'
import WhatsAppIcon from '../components/WhatsAppIcon'

// Check if running in production
const isProduction = process.env.NODE_ENV === 'production'

// Logger utility that respects production environment
const logger = {
  log: (...args) => {
    if (!isProduction) {
      console.log(...args)
    }
  },
  error: (...args) => {
    if (!isProduction) {
      console.error(...args)
    }
  }
}

const GroupDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [group, setGroup] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchGroup()
  }, [id])

  const fetchGroup = async () => {
    try {
      setLoading(true)
      logger.log(`🔍 Fetching group ${id} with smart cache...`)
      
      // Use cached database service instead of direct Supabase call
      const data = await cachedDB.getGroupById(id)
      
      // Check if group is active
      if (data.is_active === false) {
        throw new Error('Group is not active')
      }
      
      setGroup(data)
      logger.log(`✅ Loaded group: ${data.name}`)
    } catch (error) {
      logger.error('❌ Error fetching group:', error)
      setError('Group not found or is not active')
    } finally {
      setLoading(false)
    }
  }

  const handleJoinGroup = () => {
    window.open(group.join_link, '_blank', 'noopener,noreferrer')
  }

  const handleShare = async () => {
    const shareUrl = window.location.href
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: group.name,
          text: group.description,
          url: shareUrl,
        })
      } catch (error) {
        logger.error('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (error) {
        logger.error('Error copying to clipboard:', error)
      }
    }
  }

  const getCategoryColor = (category) => {
    const colors = {
      education: 'bg-blue-100 text-blue-800',
      technology: 'bg-purple-100 text-purple-800',
      business: 'bg-green-100 text-green-800',
      entertainment: 'bg-pink-100 text-pink-800',
      health: 'bg-red-100 text-red-800',
      sports: 'bg-orange-100 text-orange-800',
      other: 'bg-gray-100 text-gray-800'
    }
    return colors[category] || colors.other
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (error || !group) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Group Not Found</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-whatsapp text-white px-4 py-2 rounded-lg hover:bg-whatsapp_dark transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }
  return (
    <>
      <Helmet>
        <title>{group?.name} - {APP_CONFIG.name}</title>
        <meta name="description" content={group?.description || `Join ${group?.name} community group`} />
        <meta name="keywords" content={`${group?.category}, ${group?.name}, community group, ${APP_CONFIG.keywords}`} />
        <meta property="og:title" content={`${group?.name} - ${APP_CONFIG.name}`} />
        <meta property="og:description" content={group?.description} />
        <meta property="og:image" content={`${APP_CONFIG.baseUrl}${APP_CONFIG.logo}`} />
      </Helmet>

      <div className="min-h-screen bg-gray-50">      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 py-4 flex items-center space-x-3">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-bold">Group Details</h1>
        </div>
      </div>      {/* Group Image */}
      {group.image_url && (
        <div className="relative h-52 bg-gradient-to-br from-blue-500 to-purple-600">
          <img 
            src={group.image_url} 
            alt={group.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none'
            }}
          />
          <div className="absolute inset-0 bg-black bg-opacity-30"></div>
          {/* Group Type Badge */}
          <div className="absolute bottom-4 right-4">
            <div className="bg-white/20 backdrop-blur-sm text-white px-3 py-2 rounded-lg text-sm font-medium border border-white/30">
              {group.group_type === 'channel' ? '📢 Channel' : '👥 Group'}
            </div>
          </div>
        </div>
      )}      {/* Group Info */}
      <div className="p-4">
        <div className="bg-white rounded-2xl shadow-lg p-6 -mt-8 relative z-10 border border-gray-100">
          {/* Category and Verification */}
          <div className="flex items-center justify-between mb-4">
            <span className={`px-4 py-2 rounded-full text-sm font-bold ${getCategoryColor(group.category)}`}>
              {group.category.charAt(0).toUpperCase() + group.category.slice(1)}
            </span>
            {group.is_verified && (
              <div className="flex items-center space-x-2 text-green-600">
                <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
                <span className="text-sm font-bold">Verified</span>
              </div>
            )}
          </div>

          {/* Group Name */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{group.name}</h1>          {/* Stats */}
          <div className="flex items-center space-x-6 mb-4 text-gray-600">
            <div className="flex items-center space-x-2">
              <MessageCircle size={16} />
              <span className="text-sm">{group.group_type === 'channel' ? 'Channel' : 'Group'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar size={16} />
              <span className="text-sm">
                {new Date(group.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">About</h2>
            <p className="text-gray-700 leading-relaxed">{group.description}</p>
          </div>          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleJoinGroup}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl hover:scale-[1.02]"
            >
              <WhatsAppIcon className="w-5 h-5" />
              <span>Join {group.group_type === 'channel' ? 'Channel' : 'Group'}</span>
            </button>

            <button
              onClick={handleShare}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200 flex items-center justify-center space-x-2 hover:scale-[1.02]"
            >
              {copied ? (
                <>
                  <Copy size={18} />
                  <span>Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 size={18} />
                  <span>Share Group</span>
                </>
              )}
            </button>
          </div>

          {/* Additional Info */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="font-semibold text-gray-900 mb-2">Group Guidelines</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Be respectful and courteous to all members</li>
              <li>• Stay on topic and avoid spam</li>              <li>• No inappropriate content or behavior</li>
              <li>• Follow the group admin's instructions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

export default GroupDetail
