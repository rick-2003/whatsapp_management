import { useState, useEffect } from 'react'
import { Search, Users, ExternalLink, MessageCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import GroupCard from '../components/GroupCard'
import LoadingSpinner from '../components/LoadingSpinner'

const Home = () => {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    fetchGroups()

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('groups-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'groups' 
        }, 
        (payload) => {
          fetchGroups() // Refetch data when changes occur
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setGroups(data || [])
    } catch (error) {
      console.error('Error fetching groups:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || group.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = ['all', 'cse', 'it', 'ece', 'eee', 'mechanical', 'civil', 'other']

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - One UI Style */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="px-6 py-8">
          <div className="text-center mb-6">
            {/* WhatsApp Icon */}
            <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-lg">
              <svg viewBox="0 0 24 24" className="w-10 h-10 text-green-500" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.503"/>
              </svg>
            </div>
            <h1 className="text-3xl font-light mb-2 tracking-wide">FUTURE MINDS</h1>
            <p className="text-blue-100 text-sm font-light mb-6">Engineering Groups Management</p>
            
            {/* Stats Cards - One UI Style */}
            <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
              <div className="bg-white/10 backdrop-blur rounded-2xl p-3">
                <div className="text-2xl font-light">{groups.length}</div>
                <div className="text-xs text-blue-100 font-medium">Groups</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-2xl p-3">
                <div className="text-2xl font-light">{groups.filter(g => g.category === 'cse').length}</div>
                <div className="text-xs text-blue-100 font-medium">CSE</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-2xl p-3">
                <div className="text-2xl font-light">{groups.filter(g => g.category === 'it').length}</div>
                <div className="text-xs text-blue-100 font-medium">IT</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Contact Panel */}
      <div className="px-6 py-4 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl border border-green-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.503"/>
              </svg>
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900 text-sm">Admin Contact</p>
              <p className="text-xs text-gray-600">Get help or report issues</p>
            </div>
          </div>          <button
            onClick={() => window.open('https://wa.me/+919876543210', '_blank')}
            className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-green-600 transition-colors flex items-center space-x-1"
          >
            <MessageCircle size={16} />
            <span>Contact</span>
          </button>
        </div>
      </div>

      {/* Search and Filter Section - One UI Style */}
      <div className="px-6 py-4 bg-white">
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search engineering groups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-gray-50 border-0 rounded-2xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>

        {/* Category Filter - One UI Style */}
        <div className="flex overflow-x-auto space-x-2 pb-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category === 'all' ? 'All Departments' : category.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Groups Section */}
      <div className="px-6 pb-8">
        {filteredGroups.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Users className="text-gray-400" size={32} />
            </div>
            <h3 className="text-xl font-light text-gray-900 mb-2">No groups found</h3>
            <p className="text-gray-500 text-sm">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filter criteria' 
                : 'No groups available at the moment'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredGroups.map(group => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Home
