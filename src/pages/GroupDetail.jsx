import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, ExternalLink, MessageCircle, Calendar, Share2, Copy } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import { supabase } from '../lib/supabase'
import cachedDB from '../lib/cachedDatabase'
import { APP_CONFIG } from '../config/app'
import { Spinner } from '@/components/ui/spinner'
import WhatsAppIcon from '../components/WhatsAppIcon'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast()

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
    const shareText = `${group.description}\n\n${shareUrl}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: group.name,
          text: shareText,
        })
      } catch (error) {
        logger.error('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareText)
        toast({
          title: "Link Copied!",
          description: "Group link copied to clipboard.",
        })
      } catch (error) {
        logger.error('Error copying to clipboard:', error)
        toast({
          title: "Failed to copy",
          description: "Could not copy link to clipboard.",
          variant: "destructive",
        })
      }
    }
  }

  if (loading) {
    return <Spinner className="mx-auto h-8 w-8" />
  }

  if (error || !group) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h2 className="text-2xl font-bold text-foreground mb-4">Group Not Found</h2>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button asChild>
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
        </Button>
      </div>
    )
  }
  return (
    <div className="container mx-auto py-8 px-4">
      <Helmet>
        <title>{group?.name} - {APP_CONFIG.name}</title>
        <meta name="description" content={group?.description || `Join ${group?.name} community group`} />
        <meta name="keywords" content={`${group?.category}, ${group?.name}, community group, ${APP_CONFIG.keywords}`} />
        <meta property="og:title" content={`${group?.name} - ${APP_CONFIG.name}`} />
        <meta property="og:description" content={group?.description} />
        <meta property="og:image" content={`${APP_CONFIG.baseUrl}${APP_CONFIG.logo}`} />
      </Helmet>

      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/">
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold text-foreground">Group Details</h1>
      </div>

      <Card>
        {group.image_url && (
          <div className="relative h-52 w-full overflow-hidden rounded-t-lg">
            <img 
              src={group.image_url} 
              alt={group.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
            <div className="absolute inset-0 bg-black/30"></div>
            <Badge className="absolute bottom-4 right-4 text-sm px-3 py-1">
              {group.group_type === 'channel' ? '📢 Channel' : '👥 Group'}
            </Badge>
          </div>
        )}
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <Badge variant="secondary" className="text-sm px-3 py-1">
              {group.category.charAt(0).toUpperCase() + group.category.slice(1)}
            </Badge>
            {group.is_verified && (
              <Badge variant="default" className="flex items-center space-x-1">
                <span className="text-xs font-bold">✓</span>
                <span>Verified</span>
              </Badge>
            )}
          </div>
          <CardTitle className="text-3xl font-bold mb-2">{group.name}</CardTitle>
          <CardDescription className="flex items-center space-x-4 text-muted-foreground text-sm">
            <div className="flex items-center space-x-1">
              <MessageCircle className="h-4 w-4" />
              <span>{group.group_type === 'channel' ? 'Channel' : 'Group'}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date(group.created_at).toLocaleDateString()}</span>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <h2 className="text-lg font-semibold mb-2">About</h2>
          <p className="text-muted-foreground mb-6">{group.description}</p>

          <div className="grid gap-4">
            <Button
              onClick={handleJoinGroup}
              className="w-full bg-whatsapp hover:bg-whatsapp_dark"
            >
              <WhatsAppIcon className="mr-2 h-4 w-4" />
              Join {group.group_type === 'channel' ? 'Channel' : 'Group'}
            </Button>
            <Button
              onClick={handleShare}
              variant="outline"
              className="w-full"
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share Group
            </Button>
          </div>

          <Separator className="my-6" />

          <h3 className="font-semibold mb-2">Group Guidelines</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Be respectful and courteous to all members</li>
            <li>• Stay on topic and avoid spam</li>
            <li>• No inappropriate content or behavior</li>
            <li>• Follow the group admin's instructions</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

export default GroupDetail
