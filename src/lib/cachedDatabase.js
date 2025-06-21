import { supabase } from './supabase'
import smartCache, { cacheKeys, cacheTTL } from './cache'

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

/**
 * Cached Database Service
 * Provides intelligent caching for all database operations
 */
class CachedDatabaseService {
  
  /**
   * Fetch all groups with caching
   */
  async getAllGroups() {
    const cacheKey = smartCache.generateKey(cacheKeys.GROUPS_ALL)
    
    return await smartCache.withCache(
      cacheKey,
      async () => {
        const { data, error } = await supabase
          .from('groups')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (error) throw error
        return data
      },
      cacheTTL.LONG
    )
  }

  /**
   * Fetch groups by category with caching
   */
  async getGroupsByCategory(category) {
    const cacheKey = smartCache.generateKey(cacheKeys.GROUPS_BY_CATEGORY, { category })
    
    return await smartCache.withCache(
      cacheKey,
      async () => {
        const { data, error } = await supabase
          .from('groups')
          .select('*')
          .eq('category', category)
          .order('created_at', { ascending: false })
        
        if (error) throw error
        return data
      },
      cacheTTL.LONG
    )
  }

  /**
   * Fetch single group by ID with caching
   */
  async getGroupById(id) {
    const cacheKey = smartCache.generateKey(cacheKeys.GROUP_BY_ID, { id })
    
    return await smartCache.withCache(
      cacheKey,
      async () => {
        const { data, error } = await supabase
          .from('groups')
          .select('*')
          .eq('id', id)
          .single()
        
        if (error) throw error
        return data
      },
      cacheTTL.LONG
    )
  }

  /**
   * Search groups with caching
   */
  async searchGroups(searchTerm, category = null) {
    const cacheKey = smartCache.generateKey('groups:search', { 
      searchTerm: searchTerm.toLowerCase(),
      category 
    })
    
    return await smartCache.withCache(
      cacheKey,
      async () => {
        let query = supabase
          .from('groups')
          .select('*')
        
        if (category && category !== 'all') {
          query = query.eq('category', category)
        }
        
        if (searchTerm) {
          query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        }
        
        const { data, error } = await query.order('created_at', { ascending: false })
        
        if (error) throw error
        return data
      },
      cacheTTL.MEDIUM // Search results cache for 30 minutes
    )
  }

  /**
   * Get admin data with caching
   */
  async getAdminData() {
    const cacheKey = smartCache.generateKey(cacheKeys.ADMIN_DATA)
    
    return await smartCache.withCache(
      cacheKey,
      async () => {
        // Since admin data is from config, return it directly
        // This can be extended if admin data comes from database
        const { APP_CONFIG } = await import('../config/app')
        return APP_CONFIG.admins
      },
      cacheTTL.EXTRA_LONG // Admin data rarely changes
    )
  }

  /**
   * Create a new group and invalidate related cache
   */
  async createGroup(groupData) {
    const { data, error } = await supabase
      .from('groups')
      .insert([groupData])
      .select()
      .single()
    
    if (error) throw error
    
    // Invalidate related cache entries
    this.invalidateGroupsCache()
    
    return data
  }

  /**
   * Update a group and invalidate related cache
   */
  async updateGroup(id, groupData) {
    const { data, error } = await supabase
      .from('groups')
      .update(groupData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    
    // Invalidate related cache entries
    this.invalidateGroupsCache()
    smartCache.delete(smartCache.generateKey(cacheKeys.GROUP_BY_ID, { id }))
    
    return data
  }

  /**
   * Delete a group and invalidate related cache
   */
  async deleteGroup(id) {
    const { error } = await supabase
      .from('groups')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    
    // Invalidate related cache entries
    this.invalidateGroupsCache()
    smartCache.delete(smartCache.generateKey(cacheKeys.GROUP_BY_ID, { id }))
    
    return true
  }

  /**
   * Invalidate all groups-related cache entries
   */
  invalidateGroupsCache() {
    smartCache.invalidatePattern('groups:')
  }
  /**
   * Manual cache refresh for groups
   */
  async refreshGroupsCache() {
    this.invalidateGroupsCache()
    
    // Pre-warm the cache with fresh data
    await this.getAllGroups()
    
    logger.log('🔄 Groups cache refreshed')
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return smartCache.getStats()
  }

  /**
   * Clear all cache
   */
  clearCache() {
    smartCache.clear()
    logger.log('🗑️ All cache cleared')
  }
}

// Create singleton instance
const cachedDB = new CachedDatabaseService()

export default cachedDB

// Export for convenience
export { smartCache, cacheKeys, cacheTTL }
