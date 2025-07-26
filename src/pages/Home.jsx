import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Users, ExternalLink, MessageCircle, Calendar } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { supabase } from '../lib/supabase'
import cachedDB from '../lib/cachedDatabase'
import { APP_CONFIG } from '../config/app'
import GroupCard from '../components/GroupCard'
import { Spinner } from '@/components/ui/spinner'
import WhatsAppIcon from '../components/WhatsAppIcon'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

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

const Home = () => {
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [randomAdmin, setRandomAdmin] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const ITEMS_PER_PAGE = 10

  const handleWhatsAppContact = (admin) => {
    window.open(admin.whatsappDeepLink, '_blank')
  }

  // Randomly select an admin on page load
  useEffect(() => {
    const admins = APP_CONFIG.admins
    const randomIndex = Math.floor(Math.random() * admins.length)
    setRandomAdmin(admins[randomIndex])
  }, [])

  useEffect(() => {
    fetchGroups()    // Subscribe to real-time changes
    const subscription = supabase
      .channel('groups-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'groups' 
        },        (payload) => {
          logger.log('🔄 Database change detected, invalidating cache...')
          cachedDB.invalidateGroupsCache() // Invalidate cache on changes
          fetchGroups() // Refetch data when changes occur
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])
  const fetchGroups = async (page = 1, reset = false) => {
    try {
      if (page === 1) {
        setLoading(true)
      } else {
        setLoadingMore(true)
      }
      
      logger.log(`🔍 Fetching groups page ${page} with smart cache...`)
      
      // Use cached database service instead of direct Supabase call
      const data = await cachedDB.getAllGroups()
      
      if (!data) {
        setGroups([])
        setHasMore(false)
        return
      }
      
      // Filter for active groups only
      const activeGroups = data.filter(group => group.is_active !== false)
      
      // Calculate pagination
      const startIndex = (page - 1) * ITEMS_PER_PAGE
      const endIndex = startIndex + ITEMS_PER_PAGE
      const paginatedData = activeGroups.slice(0, endIndex) // Get all items up to current page
      
      if (reset || page === 1) {
        setGroups(paginatedData)
      } else {
        // This shouldn't happen with our slice approach, but keeping for safety
        setGroups(paginatedData)
      }
      
      // Check if there are more items
      setHasMore(endIndex < activeGroups.length)
      setCurrentPage(page)
      
      logger.log(`✅ Loaded page ${page}, showing ${paginatedData.length} of ${activeGroups.length} total groups`)
    } catch (error) {
      logger.error('❌ Error fetching groups:', error)
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

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || group.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = ['all', 'common', 'cse', 'it', 'ece', 'eee', 'mechanical', 'civil', 'other']

  if (loading) {
    return <Spinner className="mx-auto h-8 w-8" />
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

      <div className="container mx-auto py-8 px-4">
        {/* Hero Section */}
        <Card className="mb-8 text-center bg-card border-border">
          <CardHeader>
            <Avatar className="mx-auto h-24 w-24 mb-4">
              <AvatarImage src={APP_CONFIG.logo} alt={APP_CONFIG.name} />
              <AvatarFallback>{APP_CONFIG.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <CardTitle className="text-3xl font-bold">{APP_CONFIG.name}</CardTitle>
            <CardDescription className="text-muted-foreground">Student Community Hub</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            <div className="p-3">
              <div className="text-2xl font-bold">{groups.length}</div>
              <div className="text-sm text-muted-foreground">Study Groups</div>
            </div>
            <div className="p-3">
              <div className="text-2xl font-bold">{groups.filter(g => g.is_active).length}</div>
              <div className="text-sm text-muted-foreground">Active</div>
            </div>
            <div className="p-3">
              <div className="text-2xl font-bold">{new Set(groups.map(g => g.category)).size}</div>
              <div className="text-sm text-muted-foreground">Subjects</div>
            </div>
          </CardContent>
        </Card>

        {/* Admin Contact Panel */}
        <Card className="mb-8 bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold">Contact Admin</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-x-0 space-y-4">
            <div className="flex items-center space-x-4 w-full">
              <Avatar className="h-12 w-12">
                <AvatarImage src={APP_CONFIG.logo} alt={randomAdmin?.name} />
                <AvatarFallback>{randomAdmin?.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                {randomAdmin && (
                  <p className="text-sm font-medium leading-none">{randomAdmin.name}</p>
                )}
                <p className="text-sm text-muted-foreground">{randomAdmin?.department}</p>
              </div>
            </div>
            <div className="flex w-full space-x-2">
              <Button variant="outline" className="w-1/2" asChild>
                <Link to="/admin-contact">
                  <Users className="mr-2 h-4 w-4" />
                  All Admins
                </Link>
              </Button>
              <Button
                onClick={() => randomAdmin && handleWhatsAppContact(randomAdmin)}
                className="w-1/2 bg-whatsapp hover:bg-whatsapp_dark"
              >
                <WhatsAppIcon className="mr-2 h-4 w-4" />
                Chat
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Search and Filter Section */}
        <div className="mb-8">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search engineering groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <ScrollArea className="w-full whitespace-nowrap rounded-md border">
            <div className="flex w-max space-x-2 p-4">
              {categories.map(category => (
                <Button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className="rounded-full"
                >
                  {category === 'all' ? 'All' : category.toUpperCase()}
                </Button>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>

        {/* Groups Section */}
        <div>
          {filteredGroups.length === 0 ? (
            <div className="text-center py-16">
              <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="text-xl font-semibold text-foreground mb-2">No groups found</h3>
              <p className="text-muted-foreground text-sm">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Try adjusting your search or filter criteria' 
                  : 'No groups available at the moment'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredGroups.map(group => (
                <GroupCard key={group.id} group={group} />
              ))}
              
              {/* Load More Indicator */}
              {loadingMore && (
                <div className="col-span-full flex justify-center items-center py-8">
                  <div className="flex items-center space-x-2 text-muted-foreground">
                    <div className="w-4 h-4 border-2 border-border border-t-primary rounded-full animate-spin"></div>
                    <span className="text-sm">Loading more groups...</span>
                  </div>
                </div>
              )}
              
              {/* End of Results Indicator */}
              {!hasMore && filteredGroups.length > 0 && (
                <div className="col-span-full flex justify-center items-center py-8">
                  <div className="text-muted-foreground text-sm">
                    You've reached the end of the list
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default Home
