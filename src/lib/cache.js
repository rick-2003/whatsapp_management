/**
 * Smart Cache System for Database Operations
 * Provides intelligent caching with TTL and automatic invalidation
 */

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

class SmartCache {
  constructor() {
    this.cache = new Map()
    this.cacheExpiry = new Map()
    this.defaultTTL = 60 * 60 * 1000 // 1 hour in milliseconds
  }

  /**
   * Generate a cache key from function name and parameters
   */
  generateKey(prefix, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key]
        return result
      }, {})
    
    return `${prefix}:${JSON.stringify(sortedParams)}`
  }

  /**
   * Set a value in cache with TTL
   */
  set(key, value, ttl = this.defaultTTL) {
    const expiryTime = Date.now() + ttl
    this.cache.set(key, value)
    this.cacheExpiry.set(key, expiryTime)
    
    // Clean up expired entries periodically
    this.cleanupExpired()
  }

  /**
   * Get a value from cache if not expired
   */
  get(key) {
    const expiryTime = this.cacheExpiry.get(key)
    
    if (!expiryTime || Date.now() > expiryTime) {
      // Cache expired or doesn't exist
      this.delete(key)
      return null
    }
    
    return this.cache.get(key)
  }

  /**
   * Delete a specific cache entry
   */
  delete(key) {
    this.cache.delete(key)
    this.cacheExpiry.delete(key)
  }

  /**
   * Clear cache entries matching a pattern
   */
  invalidatePattern(pattern) {
    const keysToDelete = []
    
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        keysToDelete.push(key)
      }
    }
    
    keysToDelete.forEach(key => this.delete(key))
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear()
    this.cacheExpiry.clear()
  }

  /**
   * Clean up expired entries
   */
  cleanupExpired() {
    const now = Date.now()
    const expiredKeys = []
    
    for (const [key, expiryTime] of this.cacheExpiry.entries()) {
      if (now > expiryTime) {
        expiredKeys.push(key)
      }
    }
    
    expiredKeys.forEach(key => this.delete(key))
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.keys()),
      memory: JSON.stringify(Array.from(this.cache.entries())).length
    }
  }
  /**
   * Wrapper for caching database operations
   */
  async withCache(key, fetchFunction, ttl = this.defaultTTL) {
    // Try to get from cache first
    const cachedResult = this.get(key)
    if (cachedResult !== null) {
      logger.log(`🚀 Cache HIT for: ${key}`)
      return cachedResult
    }

    logger.log(`💾 Cache MISS for: ${key} - Fetching from database`)
    
    try {
      // Fetch from database
      const result = await fetchFunction()
      
      // Store in cache
      this.set(key, result, ttl)
      
      return result
    } catch (error) {
      logger.error(`❌ Error fetching data for ${key}:`, error)
      throw error
    }
  }
}

// Create a singleton instance
const smartCache = new SmartCache()

export default smartCache

// Export cache utilities
export const cacheKeys = {
  GROUPS_ALL: 'groups:all',
  GROUPS_BY_CATEGORY: 'groups:category',
  GROUP_BY_ID: 'groups:id',
  ADMIN_DATA: 'admin:data'
}

export const cacheTTL = {
  SHORT: 5 * 60 * 1000,    // 5 minutes
  MEDIUM: 30 * 60 * 1000,  // 30 minutes  
  LONG: 60 * 60 * 1000,    // 1 hour
  EXTRA_LONG: 2 * 60 * 60 * 1000 // 2 hours
}
