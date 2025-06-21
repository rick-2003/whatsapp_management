import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Edit, Trash2, Eye, EyeOff, BarChart3, RefreshCw, Search, Filter } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { supabase } from '../lib/supabase'
import cachedDB from '../lib/cachedDatabase'
import { APP_CONFIG } from '../config/app'
import LoadingSpinner from '../components/LoadingSpinner'
import GroupForm from '../components/GroupForm'

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

const AdminDashboard = ({ session }) => {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingGroup, setEditingGroup] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 })
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const ITEMS_PER_PAGE = 10
  const navigate = useNavigate()
  useEffect(() => {
    if (!session) {
      navigate('/login')
      return
    }
    fetchGroups()
    fetchStats()    // Subscribe to real-time changes
    const subscription = supabase
      .channel('admin-groups-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'groups' 
        },        (payload) => {
          logger.log('🔄 Admin: Database change detected, invalidating cache...')
          cachedDB.invalidateGroupsCache() // Invalidate cache on changes
          fetchGroups()
          fetchStats()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [session, navigate])

  // Scroll event listener for infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop
        >= document.documentElement.offsetHeight - 1000 // Load more when 1000px from bottom
        && hasMore
        && !loadingMore
        && !loading
      ) {
        loadMoreGroups()
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [hasMore, loadingMore, loading, currentPage])

  // Reset pagination when search or filter changes
  useEffect(() => {
    setCurrentPage(1)
    setHasMore(true)
    fetchGroups(1, true)
  }, [searchTerm, selectedCategory, selectedStatus])

  const fetchGroups = async (page = 1, reset = false) => {
    try {
      if (page === 1) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }
      
      logger.log(`🔍 Admin: Fetching groups page ${page} with smart cache...`)
      
      // For pagination, we need to get all groups first, then slice
      const allData = await cachedDB.getAllGroups()
      
      if (!allData) {
        setGroups([])
        setHasMore(false)
        return
      }
      
      // Calculate pagination
      const startIndex = (page - 1) * ITEMS_PER_PAGE
      const endIndex = startIndex + ITEMS_PER_PAGE
      const paginatedData = allData.slice(0, endIndex) // Get all items up to current page
      
      if (reset || page === 1) {
        setGroups(paginatedData)
      } else {
        // This shouldn't happen with our slice approach, but keeping for safety
        setGroups(paginatedData)
      }
      
      // Check if there are more items
      setHasMore(endIndex < allData.length)
      setCurrentPage(page)
      
      logger.log(`✅ Admin: Loaded page ${page}, showing ${paginatedData.length} of ${allData.length} total groups`)
    } catch (error) {
      logger.error('❌ Admin: Error fetching groups:', error)
      setGroups([])
      setHasMore(false)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  const loadMoreGroups = () => {
    if (!loadingMore && hasMore) {
      fetchGroups(currentPage + 1)
    }
  }

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('is_active')

      if (error) throw error
      
      const total = data.length
      const active = data.filter(g => g.is_active).length
      const inactive = total - active

      setStats({ total, active, inactive })
    } catch (error) {
      logger.error('Error fetching stats:', error)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this group?')) return

    try {
      logger.log(`🗑️ Deleting group ${id} and invalidating cache...`)
      
      // Use cached database service for deletion
      await cachedDB.deleteGroup(id)
      
      setGroups(groups.filter(g => g.id !== id))
      fetchStats()
      
      logger.log('✅ Group deleted successfully')
    } catch (error) {
      logger.error('❌ Error deleting group:', error)
      alert('Error deleting group')
    }
  }

  const handleToggleActive = async (id, currentStatus) => {
    try {
      logger.log(`🔄 Toggling group ${id} status and invalidating cache...`)
      
      // Use cached database service for update
      await cachedDB.updateGroup(id, { is_active: !currentStatus })
      
      setGroups(groups.map(g => 
        g.id === id ? { ...g, is_active: !currentStatus } : g
      ))
      fetchStats()
      
      logger.log('✅ Group status updated successfully')
    } catch (error) {
      logger.error('❌ Error updating group status:', error)
      alert('Error updating group status')
    }
  }

  const handleFormSuccess = async () => {
    setShowForm(false)
    setEditingGroup(null)
    
    // Force a complete re-fetch
    setLoading(true)
    await fetchGroups()
    await fetchStats()
  }

  // Filter groups based on search and filters
  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || group.category === selectedCategory
    const matchesStatus = selectedStatus === 'all' || 
                         (selectedStatus === 'active' ? group.is_active : !group.is_active)
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  const categories = ['all', 'common', 'cse', 'it', 'ece', 'eee', 'mechanical', 'civil', 'other']

  if (!session) {
    return null
  }

  if (loading) {
    return <LoadingSpinner />
  }  return (
    <>
      <Helmet>
        <title>Admin Dashboard - {APP_CONFIG.name}</title>
        <meta name="description" content="Administrative dashboard for managing community groups" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">      {/* Header - One UI Style */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="px-6 py-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-light mb-2 tracking-wide">Admin Dashboard</h1>
            <p className="text-blue-100 text-sm font-light">Manage Community Hub Groups</p>
          </div>
          
          {/* Action Buttons - Horizontal Layout */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => {
                setLoading(true)
                fetchGroups()
                fetchStats()
              }}
              className="flex-1 sm:flex-none bg-white/10 backdrop-blur text-white px-6 py-3 rounded-2xl flex items-center justify-center space-x-2 hover:bg-white/20 transition-all duration-200 font-medium"
            >
              <RefreshCw size={18} />
              <span>Refresh</span>
            </button>
            
            <button
              onClick={() => setShowForm(true)}
              className="flex-1 sm:flex-none bg-green-500 text-white px-6 py-3 rounded-2xl flex items-center justify-center space-x-2 hover:bg-green-600 transition-all duration-200 shadow-lg font-medium"
            >
              <Plus size={20} />
              <span>Add Group</span>
            </button>
          </div>
        </div>
      </div>      {/* Stats - One UI Style */}
      <div className="px-4 sm:px-6 py-6">
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm text-center border border-gray-100">
            <div className="text-2xl sm:text-3xl font-light text-gray-900 mb-1">{stats.total}</div>
            <div className="text-xs sm:text-sm text-gray-600 font-medium">Total Groups</div>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm text-center border border-gray-100">
            <div className="text-2xl sm:text-3xl font-light text-green-600 mb-1">{stats.active}</div>
            <div className="text-xs sm:text-sm text-gray-600 font-medium">Active</div>
          </div>
          <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm text-center border border-gray-100">
            <div className="text-2xl sm:text-3xl font-light text-red-600 mb-1">{stats.inactive}</div>
            <div className="text-xs sm:text-sm text-gray-600 font-medium">Inactive</div>
          </div>
        </div>{/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 mb-6">
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search groups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>
            
            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Category Filter */}
              <div className="flex-1">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                >
                  <option value="all">All</option>                  {categories.slice(1).map(category => (
                    <option key={category} value={category}>
                      {category === 'common' ? 'Common' : category.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Status Filter */}
              <div className="flex-1">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        {/* Groups List - Enhanced Design */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">          <div className="p-4 sm:p-6 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h2 className="text-xl font-bold text-gray-900">Groups Management</h2>
              <div className="text-sm text-gray-500">
                Showing {filteredGroups.length} of {groups.length} groups
              </div>
            </div>
          </div>
          
          {filteredGroups.length === 0 ? (
            <div className="p-8 sm:p-12 text-center">
              {groups.length === 0 ? (
                <>
                  <BarChart3 className="mx-auto mb-6 text-gray-400" size={48} />
                  <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-3">No groups yet</h3>
                  <p className="text-gray-500 mb-6 text-sm">Get started by adding your first group</p>
                  <button
                    onClick={() => setShowForm(true)}
                    className="bg-green-500 text-white px-6 py-3 rounded-2xl hover:bg-green-600 transition-colors font-medium"
                  >
                    Add First Group
                  </button>
                </>
              ) : (
                <>                  <Search className="mx-auto mb-6 text-gray-400" size={48} />
                  <h3 className="text-lg sm:text-xl font-medium text-gray-900 mb-3">No groups found</h3>
                  <p className="text-gray-500 text-sm">Try adjusting your search or filter criteria</p>
                </>
              )}
            </div>          ) : (
            <>
              <div className="grid gap-4 p-4 sm:p-6">
                {filteredGroups.map(group => (
                  <div key={group.id} className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 hover:shadow-lg transition-all duration-200 shadow-sm">
                    <div className="flex flex-col h-full">
                      {/* Group Header */}
                      <div className="flex items-start space-x-3 mb-4">
                        {/* Group Avatar */}
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-lg sm:text-xl">
                            {group.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 text-base sm:text-lg leading-tight mb-2">{group.name}</h3>
                          <div className="flex items-center flex-wrap gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              group.is_active 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {group.is_active ? 'Active' : 'Inactive'}
                            </span>
                            {group.is_verified && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                Verified
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Group Description */}
                      <p className="text-gray-600 mb-4 leading-relaxed text-sm line-clamp-2">{group.description}</p>
                      
                      {/* Group Meta Info - Horizontal Layout Optimized for Mobile */}
                      <div className="flex items-center justify-between gap-2 mb-6 p-3 bg-gray-50 rounded-xl border">
                        <div className="flex items-center space-x-1 text-xs text-gray-600">
                          <span>📚</span>
                          <span className="font-medium">{group.category === 'common' ? 'Common' : group.category.charAt(0).toUpperCase() + group.category.slice(1)}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-gray-600">
                          <span>{group.group_type === 'channel' ? '📢' : '👥'}</span>
                          <span className="font-medium">{group.group_type === 'channel' ? 'Channel' : 'Group'}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-gray-600">
                          <span>📅</span>
                          <span className="font-medium">{new Date(group.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                      </div>
                      
                      {/* Action Buttons - Bottom Center with Better Mobile Layout */}
                      <div className="flex items-center justify-center space-x-4 pt-4 border-t border-gray-100 mt-auto">
                        <button
                          onClick={() => handleToggleActive(group.id, group.is_active)}
                          className={`flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 ${
                            group.is_active 
                              ? 'text-green-600 hover:bg-green-100 bg-green-50' 
                              : 'text-red-600 hover:bg-red-100 bg-red-50'
                          }`}
                          title={group.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {group.is_active ? <Eye size={18} /> : <EyeOff size={18} />}
                        </button>
                        
                        <button
                          onClick={() => {
                            setEditingGroup(group)
                            setShowForm(true)
                          }}
                          className="flex items-center justify-center w-12 h-12 text-blue-600 hover:bg-blue-100 bg-blue-50 rounded-xl transition-all duration-200"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        
                        <button
                          onClick={() => handleDelete(group.id)}
                          className="flex items-center justify-center w-12 h-12 text-red-600 hover:bg-red-100 bg-red-50 rounded-xl transition-all duration-200"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Load More Indicator */}
              {loadingMore && (
                <div className="flex justify-center items-center py-8">
                  <div className="flex items-center space-x-2 text-gray-500">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                    <span className="text-sm">Loading more groups...</span>
                  </div>
                </div>
              )}
              
              {/* End of Results Indicator */}
              {!hasMore && filteredGroups.length > 0 && (
                <div className="flex justify-center items-center py-8">
                  <div className="text-gray-500 text-sm">
                    You've reached the end of the list
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Group Form Modal */}
      {showForm && (
        <GroupForm
          group={editingGroup}          onSuccess={handleFormSuccess}
          onCancel={() => {
            setShowForm(false)
            setEditingGroup(null)
          }}
        />
      )}
    </div>
    </>
  )
}

export default AdminDashboard
