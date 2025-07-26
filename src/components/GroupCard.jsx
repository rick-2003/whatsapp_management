import { MessageCircle, Eye, Share2, Calendar } from 'lucide-react'
import { Link } from 'react-router-dom'
import WhatsAppIcon from './WhatsAppIcon'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

const GroupCard = ({ group }) => {
  const handleJoinGroup = (e) => {
    e.stopPropagation()
    window.open(group.join_link, '_blank', 'noopener,noreferrer')
  }

  const handleShare = async (e) => {
    e.stopPropagation()
    const shareUrl = `${window.location.origin}/group/${group.id}`
    const shareText = `${group.description}\n\n${shareUrl}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: group.name,
          text: shareText,
        })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareText)
        // You could add a toast notification here
      } catch (error) {
        console.error('Error copying to clipboard:', error)
      }
    }
  }

  return (
    <Card className="w-full rounded-lg shadow-sm hover:shadow-md transition-all duration-200 bg-card border-border">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center space-x-3 mb-2">
          {group.image_url ? (
            <img 
              src={group.image_url} 
              alt={group.name}
              className="w-12 h-12 rounded-md object-cover"
              onError={(e) => {
                e.target.style.display = 'none'
              }}
            />
          ) : (
            <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center text-muted-foreground text-xl font-bold">
              {group.name.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold leading-tight">{group.name}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {group.group_type === 'channel' ? '📢 Channel' : '👥 Group'}
            </CardDescription>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{group.category.toUpperCase()}</Badge>
          {group.is_verified && <Badge variant="default">Verified</Badge>}
          <Badge variant={group.is_active ? "outline" : "destructive"}>
            {group.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{group.description}</p>
        <div className="flex items-center text-xs text-muted-foreground">
          <Calendar className="mr-1 h-3 w-3" />
          <span>Created: {new Date(group.created_at).toLocaleDateString()}</span>
        </div>
      </CardContent>
      <Separator className="mx-4" />
      <CardFooter className="p-4 flex justify-between space-x-2">
        <Button variant="outline" className="flex-1" asChild>
          <Link to={`/group/${group.id}`}>
            <Eye className="mr-2 h-4 w-4" />
            View
          </Link>
        </Button>
        <Button onClick={handleJoinGroup} className="flex-1 bg-whatsapp hover:bg-whatsapp_dark">
          <WhatsAppIcon className="mr-2 h-4 w-4" />
          Join
        </Button>
        <Button variant="ghost" size="icon" onClick={handleShare}>
          <Share2 className="h-4 w-4" />
          <span className="sr-only">Share</span>
        </Button>
      </CardFooter>
    </Card>
  )
}

export default GroupCard
