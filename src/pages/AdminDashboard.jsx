import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Edit, Trash2, Eye, EyeOff, BarChart3, RefreshCw, Search, Filter, MessageCircle, Calendar } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { supabase } from '../lib/supabase'
import cachedDB from '../lib/cachedDatabase'
import { APP_CONFIG } from '../config/app'
import { Spinner } from '@/components/ui/spinner'
import GroupForm from '../components/GroupForm'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'

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
  const [realtimeStatus, setRealtimeStatus] = useState('connecting')
  const ITEMS_PER_PAGE = 10
  const navigate = useNavigate()
  
  useEffect(() => {
    if (!session) {
      navigate('/login')
      return
    }
    fetchGroups()
    fetchStats()    
    
    // Subscribe to real-time changes with improved error handling
    const subscription = supabase
      .channel('admin-groups-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'groups' 
        },        
        (payload) => {
          logger.log('🔄 Admin: Database change detected:', payload.eventType, payload.new || payload.old)
          
          // Invalidate cache immediately
          cachedDB.invalidateGroupsCache()
          
          // Update UI based on the change type
          if (payload.eventType === 'INSERT') {
            logger.log('📝 New group added, refreshing data...')
          } else if (payload.eventType === 'UPDATE') {
            logger.log('✏️ Group updated, refreshing data...')
          } else if (payload.eventType === 'DELETE') {
            logger.log('🗑️ Group deleted, refreshing data...')
          }
          
          // Refresh data
          fetchGroups()
          fetchStats()
        }
      )      .subscribe((status) => {
        logger.log('📡 Real-time subscription status:', status)
        setRealtimeStatus(status)
      })

    return () => {
      logger.log('🔌 Unsubscribing from real-time updates')
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
      logger.log('📊 Fetching fresh stats (no cache)...')
      
      const { data, error } = await supabase
        .from('groups')
        .select('is_active')

      if (error) throw error
      
      const total = data.length
      const active = data.filter(g => g.is_active).length
      const inactive = total - active

      setStats({ total, active, inactive })
      logger.log(`📊 Stats updated: ${total} total, ${active} active, ${inactive} inactive`)
    } catch (error) {
      logger.error('❌ Error fetching stats:', error)
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
    
    // Immediately invalidate cache and force refresh
    logger.log('📝 Form submitted successfully, forcing immediate refresh...')
    cachedDB.invalidateGroupsCache()
    
    // Force a complete re-fetch with loading state
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
    return <Spinner className="mx-auto h-8 w-8" />
  }  return (
    <div className="container mx-auto py-8 px-4">
      <Helmet>
        <title>Admin Dashboard - {APP_CONFIG.name}</title>
        <meta name="description" content="Administrative dashboard for managing community groups" />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <div className={`w-2 h-2 rounded-full ${
            realtimeStatus === 'SUBSCRIBED' ? 'bg-green-500' : 
            realtimeStatus === 'CHANNEL_ERROR' ? 'bg-destructive' : 
            'bg-yellow-500'
          }`}></div>
          <span>Real-time: {realtimeStatus === 'SUBSCRIBED' ? 'Connected' : 
                    realtimeStatus === 'CHANNEL_ERROR' ? 'Error' : 'Connecting...'}
          </span>
        </div>
      </div>

      {/* Action Buttons and Stats */}
      <div className="grid grid-cols-1 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button
              onClick={() => {
                logger.log('🔄 Manual refresh triggered')
                cachedDB.invalidateGroupsCache()
                setLoading(true)
                fetchGroups()
                fetchStats()
              }}
              variant="outline"
              className="flex-1"
            >
              <RefreshCw size={18} className="mr-2" />
              <span>Refresh Data</span>
            </Button>
            <Button
              onClick={() => setShowForm(true)}
              className="flex-1"
            >
              <Plus size={20} className="mr-2" />
              <span>Add New Group</span>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">Group Stats</CardTitle>
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <div className="text-xs text-muted-foreground">Active</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-destructive">{stats.inactive}</div>
              <div className="text-xs text-muted-foreground">Inactive</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Filter Groups</CardTitle>
          <CardDescription>Search and filter groups by category or status.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search groups by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Filters Row */}
          <div className="grid grid-cols-1 gap-4">
            {/* Category Filter */}
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>                  {categories.slice(1).map(category => (
                  <SelectItem key={category} value={category}>
                    {category === 'common' ? 'Common' : category.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {/* Status Filter */}
            <Select
              value={selectedStatus}
              onValueChange={setSelectedStatus}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="inactive">Inactive Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Groups List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All Groups</CardTitle>
          <CardDescription>
            Showing {filteredGroups.length} of {groups.length} groups
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredGroups.length === 0 ? (
            <div className="text-center py-8">
              {groups.length === 0 ? (
                <>
                  <BarChart3 className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">No groups yet</h3>
                  <p className="text-muted-foreground text-sm mb-4">Get started by adding your first group</p>
                  <Button
                    onClick={() => setShowForm(true)}
                  >
                    <Plus size={16} className="mr-2" />
                    Add First Group
                  </Button>
                </>
              ) : (
                <>
                  <Search className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">No groups found</h3>
                  <p className="text-muted-foreground text-sm">Try adjusting your search or filter criteria</p>
                </>
              )}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Verified</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGroups.map(group => (
                    <TableRow key={group.id}>
                      <TableCell className="font-medium">{group.name}</TableCell>
                      <TableCell>{group.category.toUpperCase()}</TableCell>
                      <TableCell>{group.group_type === 'channel' ? 'Channel' : 'Group'}</TableCell>
                      <TableCell>
                        <Badge variant={group.is_active ? "default" : "destructive"}>
                          {group.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {group.is_verified ? <Badge variant="secondary">Yes</Badge> : <Badge variant="outline">No</Badge>}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleToggleActive(group.id, group.is_active)}
                            title={group.is_active ? 'Deactivate' : 'Activate'}
                          >
                            {group.is_active ? <Eye size={16} /> : <EyeOff size={16} />}
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              setEditingGroup(group)
                              setShowForm(true)
                            }}
                            title="Edit"
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => handleDelete(group.id)}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {/* Load More Indicator */}
              {loadingMore && (
                <div className="flex justify-center items-center py-8">
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <div className="w-4 h-4 border-2 border-border border-t-primary rounded-full animate-spin"></div>
                    <span className="text-sm">Loading more groups...</span>
                  </div>
                </div>
              )}
              
              {/* End of Results Indicator */}
              {!hasMore && filteredGroups.length > 0 && (
                <div className="flex justify-center items-center py-8">
                  <div className="text-muted-foreground text-sm">
                    You've reached the end of the list
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

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
  )
}

export default AdminDashboard
