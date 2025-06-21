import { useState } from 'react'
import { X, Save, Link as LinkIcon, Image, Users, MessageCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'

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
        // Update existing group
        const { error } = await supabase
          .from('groups')
          .update(formData)
          .eq('id', group.id)

        if (error) throw error
      } else {
        // Create new group
        const { data, error } = await supabase
          .from('groups')
          .insert([formData])
          .select()

        if (error) throw error
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
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">
            {group ? 'Edit Group' : 'Add New Group'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          {/* Group Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter group name"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}              onChange={handleChange}
              required
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe what this group is about"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Group Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type *
            </label>
            <select
              name="group_type"
              value={formData.group_type}
              onChange={handleChange}              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="group">Group</option>
              <option value="channel">Channel</option>
            </select>
          </div>

          {/* Join Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              WhatsApp Join Link *
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="url"
                name="join_link"
                value={formData.join_link}
                onChange={handleChange}
                required
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://chat.whatsapp.com/..."
              />
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group Image URL (Optional)
            </label>
            <div className="relative">
              <Image className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="url"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
            </div>
          </div>

          {/* Checkboxes */}
          <div className="space-y-4">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="is_verified"
                checked={formData.is_verified}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Verified Group</span>
            </label>

            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">Active (Visible to users)</span>
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex space-x-3 pt-6">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-500 text-white px-4 py-3 rounded-xl hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2 font-medium"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <Save size={16} />
                  <span>{group ? 'Update' : 'Create'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default GroupForm
