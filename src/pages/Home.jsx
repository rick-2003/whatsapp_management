import { useState, useEffect } from 'react'
import { Search, Users, ExternalLink, MessageCircle } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { supabase } from '../lib/supabase'
import { APP_CONFIG } from '../config/app'
import GroupCard from '../components/GroupCard'
import LoadingSpinner from '../components/LoadingSpinner'
import WhatsAppIcon from '../components/WhatsAppIcon'

const Home = () => {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [randomAdmin, setRandomAdmin] = useState(null)

  // Randomly select an admin on page load
  useEffect(() => {
    const admins = APP_CONFIG.admins
    const randomIndex = Math.floor(Math.random() * admins.length)
    setRandomAdmin(admins[randomIndex])
  }, [])

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
    <>
      <Helmet>
        <title>{APP_CONFIG.name}</title>
        <meta name="description" content={APP_CONFIG.description} />
        <meta name="keywords" content={APP_CONFIG.keywords} />
        <meta property="og:title" content={APP_CONFIG.name} />
        <meta property="og:description" content={APP_CONFIG.description} />
        <meta property="og:image" content={`${APP_CONFIG.baseUrl}${APP_CONFIG.logo}`} />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
      {/* Hero Section - One UI Style */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">        <div className="px-6 py-8">
          <div className="text-center mb-6">
            {/* App Logo */}
            <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-full flex items-center justify-center shadow-lg p-2">
              <img 
                src={APP_CONFIG.logo} 
                alt={APP_CONFIG.name} 
                className="w-full h-full rounded-full object-cover"
              />
            </div>            <h1 className="text-3xl font-light mb-2 tracking-wide">FUTURE MINDS</h1>
            <p className="text-blue-100 text-sm font-light mb-6">Student Community Hub</p>
            
            {/* Stats Cards - One UI Style */}
            <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
              <div className="bg-white/10 backdrop-blur rounded-2xl p-3">
                <div className="text-2xl font-light">{groups.length}</div>
                <div className="text-xs text-blue-100 font-medium">Study Groups</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-2xl p-3">
                <div className="text-2xl font-light">{groups.filter(g => g.is_active).length}</div>
                <div className="text-xs text-blue-100 font-medium">Active</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-2xl p-3">
                <div className="text-2xl font-light">{new Set(groups.map(g => g.category)).size}</div>
                <div className="text-xs text-blue-100 font-medium">Subjects</div>
              </div>
            </div>
          </div>
        </div>
      </div>      {/* Admin Contact Panel */}
      <div className="px-6 py-4 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl border border-green-100">
          <div className="flex items-center space-x-3">
            <img 
              src={APP_CONFIG.logo} 
              alt={APP_CONFIG.name} 
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="text-left">
              {randomAdmin && (
                <>
                  <p className="font-semibold text-gray-900 text-sm">{randomAdmin.name}</p>
                  <p className="text-xs text-gray-600">{randomAdmin.department}</p>
                </>
              )}
            </div>
          </div>
          <div className="flex space-x-2">            <button
              onClick={() => randomAdmin && window.open(randomAdmin.whatsappDeepLink, '_blank')}
              className="bg-green-500 text-white px-3 py-2 rounded-full text-sm font-medium hover:bg-green-600 transition-colors flex items-center space-x-1"
            >
              <WhatsAppIcon className="w-4 h-4" />
              <span>Chat</span>
            </button>
            <button
              onClick={() => window.location.href = '/admin-contact'}
              className="bg-blue-500 text-white px-3 py-2 rounded-full text-sm font-medium hover:bg-blue-600 transition-colors flex items-center space-x-1"
            >
              <Users size={14} />
              <span>All</span>
            </button>
          </div>
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
          </div>        ) : (
          <div className="space-y-4">
            {filteredGroups.map(group => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  )
}

export default Home
