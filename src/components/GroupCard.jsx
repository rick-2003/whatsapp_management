import { MessageCircle, Eye } from 'lucide-react'
import { Link } from 'react-router-dom'

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
          </Link>
          <button
            onClick={handleJoinGroup}
            className="flex-1 bg-green-500 text-white px-4 py-3 rounded-xl text-sm font-medium hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.503"/>
            </svg>
            <span>Join Now</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default GroupCard
