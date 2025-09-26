// Backend server URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// API endpoints
const ENDPOINTS = {
  // Main articles endpoints
  articles: '/api/articles',
  search: '/api/articles/search',
  categories: '/api/articles/categories',
  stats: '/api/articles/stats',
  refresh: '/api/articles/refresh',
  
  // Source-specific endpoints
  healthywomen: '/api/articles/source/healthywomen',
  healthcom: '/api/articles/source/healthcom',
  guardian: '/api/articles/source/guardian',
  bbc: '/api/articles/source/bbc',
  
  // Dynamic source endpoint for programmatic access
  sourceSpecific: (source) => `/api/articles/source/${source}`,
  
  // Single article endpoint
  singleArticle: (articleId) => `/api/articles/${articleId}`,
  
  // Health check
  health: '/health'
};


// HTTP CLIENT CLASS
// Centralized API communication with error handling

class ApiClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  /**
   * Generic HTTP request method
   * Handles all HTTP methods with consistent error handling
   */
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      method: 'GET',
      headers: { ...this.defaultHeaders },
      ...options
    };

    console.log(`API Request: ${config.method} ${url}`);
    
    try {
      const response = await fetch(url, config);
      
      // Log response status for debugging
      console.log(`API Response: ${response.status} ${response.statusText}`);
      
      // Handle non-JSON responses (like health check HTML)
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error(`Expected JSON response, got ${contentType}`);
      }
      
      const data = await response.json();
      
      // Handle HTTP error status codes
      if (!response.ok) {
        throw new Error(data.message || data.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      // Log successful responses in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`API Success:`, data);
      }
      
      return data;
      
    } catch (error) {
      // Enhanced error logging
      console.error(`API Error for ${config.method} ${url}:`, error.message);
      
      // Re-throw with more context
      throw new Error(`API Request Failed: ${error.message}`);
    }
  }

  /**
   * GET request helper
   */
  async get(endpoint, params = {}) {
    // Build query string from parameters
    const queryString = new URLSearchParams(params).toString();
    const fullEndpoint = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.makeRequest(fullEndpoint, { method: 'GET' });
  }

  /**
   * POST request helper
   */
  async post(endpoint, body = {}) {
    return this.makeRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }
}

// Create singleton instance
const apiClient = new ApiClient();

// HEALTH ARTICLES API METHODS
// Specific methods for interacting with health articles

export const articlesApi = {
  /**
   * Get all articles from all 4 sources
   * Returns articles grouped by source: { healthywomen: [...], healthcom: [...], guardian: [...], bbc: [...] }
   * 
   * @param {Object} filters - Optional filters
   * @param {string} filters.search - Search keyword
   * @param {string} filters.category - Health category filter
   * @param {string} filters.source - Source filter
   * @param {number} filters.limit - Limit results per source
   */
  async getAllArticles(filters = {}) {
    try {
      console.log('Fetching all articles with filters:', filters);
      
      const response = await apiClient.get(ENDPOINTS.articles, filters);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch articles');
      }
      
      console.log(`Fetched articles: ${response.metadata.total} total`);
      
      return {
        articles: response.data,      // { healthywomen: [...], healthcom: [...], ... }
        metadata: response.metadata,  // { total, lastUpdated, searchKeyword, etc. }
        success: true
      };
      
    } catch (error) {
      console.error('Error fetching all articles:', error.message);
      
      return {
        articles: { healthywomen: [], healthcom: [], guardian: [], bbc: [] },
        metadata: { total: 0, error: error.message },
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Search articles across all sources with keyword
   * Returns articles ranked by relevance
   * 
   * @param {string} query - Search keyword (required)
   * @param {Object} filters - Optional additional filters
   */
  async searchArticles(query, filters = {}) {
    try {
      if (!query || query.trim().length === 0) {
        throw new Error('Search query is required');
      }
      
      console.log(`Searching articles for: "${query}"`);
      
      const params = { q: query.trim(), ...filters };
      const response = await apiClient.get(ENDPOINTS.search, params);
      
      if (!response.success) {
        throw new Error(response.error || 'Search failed');
      }
      
      console.log(`Search results: ${response.results.count} articles found`);
      
      return {
        articles: response.results.bySource,    // Grouped by source
        allArticles: response.results.allArticles, // Flat array sorted by relevance
        count: response.results.count,
        query: response.query,
        metadata: response.metadata,
        success: true
      };
      
    } catch (error) {
      console.error('Search error:', error.message);
      
      return {
        articles: { healthywomen: [], healthcom: [], guardian: [], bbc: [] },
        allArticles: [],
        count: 0,
        query: query || '',
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Get articles from a specific source only
   * 
   * @param {string} source - Source key (healthywomen, healthcom, guardian, bbc)
   * @param {Object} filters - Optional filters (search, category, limit)
   */
  async getArticlesBySource(source, filters = {}) {
    try {
      const validSources = ['healthywomen', 'healthcom', 'guardian', 'bbc'];
      if (!validSources.includes(source)) {
        throw new Error(`Invalid source. Must be one of: ${validSources.join(', ')}`);
      }
      
      console.log(`Fetching articles from ${source} with filters:`, filters);
      
      const response = await apiClient.get(ENDPOINTS.sourceSpecific(source), filters);
      
      if (!response.success) {
        throw new Error(response.error || `Failed to fetch ${source} articles`);
      }
      
      console.log(`Fetched ${response.count} articles from ${source}`);
      
      return {
        source: response.source,
        articles: response.articles,
        count: response.count,
        totalAvailable: response.totalAvailable,
        metadata: response.metadata,
        success: true
      };
      
    } catch (error) {
      console.error(`Error fetching ${source} articles:`, error.message);
      
      return {
        source: source,
        articles: [],
        count: 0,
        totalAvailable: 0,
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Get all available health categories
   * Used for category filter dropdowns
   */
  async getCategories() {
    try {
      console.log('Fetching health categories');
      
      const response = await apiClient.get(ENDPOINTS.categories);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch categories');
      }
      
      console.log(`Fetched ${response.count} categories`);
      
      return {
        categories: response.categories,
        count: response.count,
        success: true
      };
      
    } catch (error) {
      console.error('Error fetching categories:', error.message);
      
      // Return fallback categories if API fails
      const fallbackCategories = [
        'Mental Health', 'Nutrition', 'Heart Disease', 'Diabetes',
        'Fitness', 'Cancer', 'Women\'s Health', 'Public Health',
        'Infectious Diseases', 'General Health'
      ];
      
      return {
        categories: fallbackCategories,
        count: fallbackCategories.length,
        success: false,
        error: error.message,
        fallback: true
      };
    }
  },

  /**
   * Get system statistics and health information
   * Useful for admin/debug purposes
   */
  async getStats() {
    try {
      console.log('Fetching system statistics');
      
      const response = await apiClient.get(ENDPOINTS.stats);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch statistics');
      }
      
      console.log('Fetched system statistics');
      
      return {
        stats: response.stats,
        success: true
      };
      
    } catch (error) {
      console.error('Error fetching statistics:', error.message);
      
      return {
        stats: {
          totalArticles: 0,
          systemHealth: { status: 'error' }
        },
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Manually refresh articles from all sources
   * Triggers immediate article aggregation
   */
  async refreshArticles() {
    try {
      console.log('Triggering manual article refresh');
      
      const response = await apiClient.post(ENDPOINTS.refresh);
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to refresh articles');
      }
      
      console.log('Article refresh successful:', response.results);
      
      return {
        results: response.results,
        message: response.message,
        success: true
      };
      
    } catch (error) {
      console.error('Error refreshing articles:', error.message);
      
      return {
        results: { total: 0 },
        success: false,
        error: error.message
      };
    }
  },

  /**
   * Get a single article by ID
   * 
   * @param {string} articleId - Unique article identifier
   */
  async getArticleById(articleId) {
    try {
      if (!articleId) {
        throw new Error('Article ID is required');
      }
      
      console.log(`Fetching article: ${articleId}`);
      
      const response = await apiClient.get(ENDPOINTS.singleArticle(articleId));
      
      if (!response.success) {
        throw new Error(response.error || 'Article not found');
      }
      
      console.log('Fetched single article');
      
      return {
        article: response.article,
        metadata: response.metadata,
        success: true
      };
      
    } catch (error) {
      console.error(`Error fetching article ${articleId}:`, error.message);
      
      return {
        article: null,
        success: false,
        error: error.message
      };
    }
  }
};

// SYSTEM API METHODS
// General system health and utility methods
export const systemApi = {
  /**
   * Check if the backend server is healthy
   * Tests both server and database connectivity
   */
  async checkHealth() {
    try {
      console.log('Checking server health');
      
      const response = await apiClient.get(ENDPOINTS.health);
      
      // Health endpoint might return different format
      const isHealthy = response.status === 'healthy' || response.message?.includes('running');
      
      console.log(`Server health check: ${isHealthy ? 'Healthy' : 'Unhealthy'}`);
      
      return {
        healthy: isHealthy,
        status: response.status || 'unknown',
        message: response.message || 'Health check completed',
        database: response.database || 'unknown',
        timestamp: response.timestamp,
        success: true
      };
      
    } catch (error) {
      console.error('Health check failed:', error.message);
      
      return {
        healthy: false,
        status: 'unhealthy',
        message: 'Server is not responding',
        success: false,
        error: error.message
      };
    }
  }
};

// UTILITY FUNCTIONS
// Helper functions for common operations
export const apiUtils = {
  /**
   * Check if the API client is properly configured
   */
  getConfig() {
    return {
      baseURL: API_BASE_URL,
      endpoints: ENDPOINTS,
      environment: process.env.NODE_ENV,
      apiUrl: process.env.REACT_APP_API_URL || 'default (localhost:8000)'
    };
  },

  /**
   * Test API connectivity
   * Useful for debugging and setup verification
   */
  async testConnection() {
    console.log('Testing API connection...');
    
    try {
      const healthCheck = await systemApi.checkHealth();
      const categoriesTest = await articlesApi.getCategories();
      
      return {
        server: healthCheck.success,
        articles: categoriesTest.success,
        overall: healthCheck.success && categoriesTest.success,
        details: {
          health: healthCheck,
          categories: categoriesTest
        }
      };
      
    } catch (error) {
      console.error('Connection test failed:', error.message);
      
      return {
        server: false,
        articles: false,
        overall: false,
        error: error.message
      };
    }
  }
};

// DEFAULT EXPORT
// Main API interface for components to use

const api = {
  articles: articlesApi,
  system: systemApi,
  utils: apiUtils
};

export default api;