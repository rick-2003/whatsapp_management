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
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all hover:-translate-y-1">
      {/* Group Image */}
      {group.image_url && (
        <div className="relative h-32 bg-gray-200">
          <img 
            src={group.image_url} 
            alt={group.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none'
            }}
          />
        </div>
      )}

      <div className="p-4">
        {/* Category Badge */}
        <div className="flex items-center justify-between mb-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(group.category)}`}>
            {group.category.toUpperCase()}
          </span>
          {group.is_verified && (
            <div className="flex items-center space-x-1 text-blue-600">
              <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs">✓</span>
              </div>
              <span className="text-xs font-medium">Verified</span>
            </div>
          )}
        </div>

        {/* Group Name */}
        <h3 className="font-semibold text-gray-900 mb-2 text-base leading-tight">{group.name}</h3>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
          {group.description}
        </p>

        {/* Stats */}
        <div className="flex items-center space-x-4 mb-4 text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <MessageCircle size={12} />
            <span>{group.group_type === 'channel' ? 'Channel' : 'Group'}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Link
            to={`/group/${group.id}`}
            className="flex-1 bg-gray-100 text-gray-700 px-4 py-3 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
          >
            <Eye size={16} />
            <span>View Details</span>
          </Link>          <button
            onClick={handleJoinGroup}
            className="flex-1 bg-green-500 text-white px-4 py-3 rounded-xl text-sm font-medium hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
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
