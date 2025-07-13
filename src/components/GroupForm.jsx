import { useState } from 'react'
import { X, Save, Link as LinkIcon, Image, Users, MessageCircle } from 'lucide-react'
import cachedDB from '../lib/cachedDatabase'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

const GroupForm = ({ group, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: group?.name || '',
    description: group?.description || '',
    category: group?.category || 'common',
    group_type: group?.group_type || 'group',
    join_link: group?.join_link || '',
    image_url: group?.image_url || '',
    is_verified: group?.is_verified || false,
    is_active: group?.is_active ?? true
  })
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const categories = [
    { value: 'common', label: 'Common' },
    { value: 'cse', label: 'Computer Science & Engineering' },
    { value: 'it', label: 'Information Technology' },
    { value: 'ece', label: 'Electronics & Communication' },
    { value: 'eee', label: 'Electrical & Electronics' },
    { value: 'mechanical', label: 'Mechanical Engineering' },
    { value: 'civil', label: 'Civil Engineering' },
    { value: 'other', label: 'Other Departments' }
  ]
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {      // Validate WhatsApp link
      if (!formData.join_link.includes('chat.whatsapp.com') && !formData.join_link.includes('wa.me')) {
        throw new Error('Please enter a valid WhatsApp group/channel link')
      }

      if (group) {
        // Update existing group using cached database service
        await cachedDB.updateGroup(group.id, formData)
      } else {
        // Create new group using cached database service
        await cachedDB.createGroup(formData)
      }

      onSuccess()
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseInt(value) || 0 : value
    }))
  }

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{group ? 'Edit Group' : 'Add New Group'}</DialogTitle>
          <DialogDescription>
            {group ? 'Make changes to this group here. Click save when you\'re done.' : 'Fill in the details to add a new group to the community hub.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          {error && (
            <div className="bg-destructive/10 text-destructive border border-destructive rounded-md px-4 py-2 text-sm">
              {error}
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="name">Group Name *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter group name"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={3}
              placeholder="Describe what this group is about"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category">Department *</Label>
            <Select
              name="category"
              value={formData.category}
              onValueChange={(value) => handleSelectChange('category', value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="group_type">Type *</Label>
            <Select
              name="group_type"
              value={formData.group_type}
              onValueChange={(value) => handleSelectChange('group_type', value)}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select group type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="group">Group</SelectItem>
                <SelectItem value="channel">Channel</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="join_link">WhatsApp Join Link *</Label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="join_link"
                type="url"
                name="join_link"
                value={formData.join_link}
                onChange={handleChange}
                required
                className="pl-10"
                placeholder="https://chat.whatsapp.com/..."
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="image_url">Group Image URL (Optional)</Label>
            <div className="relative">
              <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="image_url"
                type="url"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                className="pl-10"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_verified"
              name="is_verified"
              checked={formData.is_verified}
              onCheckedChange={(checked) => handleChange({ target: { name: 'is_verified', type: 'checkbox', checked } })}
            />
            <Label htmlFor="is_verified">Verified Group</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_active"
              name="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => handleChange({ target: { name: 'is_active', type: 'checkbox', checked } })}
            />
            <Label htmlFor="is_active">Active Group</Label>
          </div>

          <DialogDescription className="text-right text-sm text-muted-foreground">
            Fields marked with * are required.
          </DialogDescription>

          <Separator />

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              <X size={16} className="mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              <Save size={16} className="mr-2" />
              {loading ? 'Saving...' : group ? 'Save Changes' : 'Add Group'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default GroupForm
