import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Edit, Trash2, Eye, EyeOff, BarChart3, RefreshCw } from 'lucide-react'
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
  const [showForm, setShowForm] = useState(false)
  const [editingGroup, setEditingGroup] = useState(null)
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0 })
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
  const fetchGroups = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setGroups(data || [])
    } catch (error) {
      console.error('Error fetching groups:', error)
    } finally {
      setLoading(false)
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

      <div className="min-h-screen bg-gray-50">
      {/* Header - One UI Style */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="px-6 py-8">
          <div className="flex items-center justify-between">            <div>
              <h1 className="text-3xl font-light mb-2 tracking-wide">Admin Dashboard</h1>
              <p className="text-blue-100 text-sm font-light">Manage Community Hub Groups</p>
            </div>            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setLoading(true)
                  fetchGroups()
                  fetchStats()
                }}
                className="bg-white/10 backdrop-blur text-white px-4 py-3 rounded-2xl flex items-center space-x-2 hover:bg-white/20 transition-colors"
              >
                <RefreshCw size={18} />
                <span>Refresh</span>
              </button>
              <button
                onClick={() => setShowForm(true)}
                className="bg-green-500 text-white px-5 py-3 rounded-2xl flex items-center space-x-2 hover:bg-green-600 transition-colors shadow-lg"
              >
                <Plus size={20} />
                <span>Add Group</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats - One UI Style */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm text-center border border-gray-100">
            <div className="text-3xl font-light text-gray-900 mb-1">{stats.total}</div>
            <div className="text-sm text-gray-600 font-medium">Total Groups</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm text-center border border-gray-100">
            <div className="text-3xl font-light text-green-600 mb-1">{stats.active}</div>
            <div className="text-sm text-gray-600 font-medium">Active</div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm text-center border border-gray-100">
            <div className="text-3xl font-light text-red-600 mb-1">{stats.inactive}</div>
            <div className="text-sm text-gray-600 font-medium">Inactive</div>
          </div>
        </div>        {/* Groups List - One UI Style */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">Groups Management</h2>
          </div>
          
          {groups.length === 0 ? (
            <div className="p-12 text-center">
              <BarChart3 className="mx-auto mb-6 text-gray-400" size={64} />
              <h3 className="text-xl font-medium text-gray-900 mb-3">No groups yet</h3>
              <p className="text-gray-500 mb-6 text-sm">Get started by adding your first group</p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-green-500 text-white px-6 py-3 rounded-2xl hover:bg-green-600 transition-colors font-medium"
              >
                Add First Group
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {groups.map(group => (
                <div key={group.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold text-gray-900 text-lg">{group.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          group.is_active 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {group.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3 leading-relaxed">{group.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="bg-gray-100 px-2 py-1 rounded-lg">Category: {group.category.toUpperCase()}</span>
                        <span className="bg-gray-100 px-2 py-1 rounded-lg">Type: {group.group_type}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleActive(group.id, group.is_active)}
                        className={`p-3 rounded-xl transition-colors ${
                          group.is_active 
                            ? 'text-green-600 hover:bg-green-50' 
                            : 'text-red-600 hover:bg-red-50'
                        }`}
                        title={group.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {group.is_active ? <Eye size={20} /> : <EyeOff size={20} />}
                      </button>
                      <button
                        onClick={() => {
                          setEditingGroup(group)
                          setShowForm(true)
                        }}
                        className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                        title="Edit"
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        onClick={() => handleDelete(group.id)}
                        className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
