import { MessageCircle, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'
import WhatsAppIcon from './WhatsAppIcon'

const GroupCard = ({ group }) => {
  const handleJoinGroup = (e) => {
    e.stopPropagation()
    window.open(group.join_link, '_blank', 'noopener,noreferrer')
  }
  const getCategoryColor = (category) => {
    const colors = {
      common: 'bg-indigo-100 text-indigo-800',
      cse: 'bg-blue-100 text-blue-800',
      it: 'bg-purple-100 text-purple-800', 
      ece: 'bg-green-100 text-green-800',
      eee: 'bg-yellow-100 text-yellow-800',
      mechanical: 'bg-red-100 text-red-800',
      civil: 'bg-orange-100 text-orange-800',
      other: 'bg-gray-100 text-gray-800'
    }
    return colors[category] || colors.other
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
      {/* Group Image with Overlay */}
      <div className="relative h-40 bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden">
        {group.image_url ? (
          <img 
            src={group.image_url} 
            alt={group.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.style.display = 'none'
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-white text-4xl font-bold opacity-80">
              {group.name.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
        
        {/* Category Badge */}
        <div className="absolute top-3 left-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold text-white bg-black/30 backdrop-blur-sm border border-white/20">
            {group.category.toUpperCase()}
          </span>
        </div>
        
        {/* Verification Badge */}
        {group.is_verified && (
          <div className="absolute top-3 right-3">
            <div className="flex items-center space-x-1 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
              <div className="w-3 h-3 bg-white rounded-full flex items-center justify-center">
                <span className="text-green-500 text-xs font-bold">✓</span>
              </div>
              <span className="font-medium">Verified</span>
            </div>
          </div>
        )}
        
        {/* Group Type Indicator */}
        <div className="absolute bottom-3 right-3">
          <div className="bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-xs font-medium border border-white/30">
            {group.group_type === 'channel' ? '📢 Channel' : '👥 Group'}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5">
        {/* Group Name */}
        <h3 className="font-bold text-gray-900 mb-2 text-lg leading-tight group-hover:text-green-600 transition-colors">
          {group.name}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
          {group.description}
        </p>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Link
            to={`/group/${group.id}`}
            className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-xl text-sm font-medium hover:bg-gray-200 transition-all duration-200 flex items-center justify-center space-x-2 hover:scale-[1.02]"
          >
            <Eye size={16} />
            <span>View Details</span>
          </Link>
          <button
            onClick={handleJoinGroup}
            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-xl text-sm font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center justify-center space-x-2 hover:scale-[1.02] shadow-lg group-hover:shadow-xl"
          >
            <WhatsAppIcon className="w-4 h-4" />
            <span>Join Now</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default GroupCard
