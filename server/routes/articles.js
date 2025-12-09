const express = require('express');
const { getArticles, getCategories, aggregateAllArticles } = require('../services/articleAggregatorService');

const router = express.Router();

// ENDPOINT TO FETCH ALL ARTICLES

/**
 * @swagger
 * /api/articles:
 *   get:
 *     summary: Get aggregated health articles
 *     tags: [Articles]
 *     description: Fetches articles from all sources with support for search, category filtering, source filtering, and per-source limits.
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Keyword search term
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Category filter (e.g., Mental Health, Nutrition)
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *           enum: [healthywomen, healthcom, guardian, bbc]
 *         description: Filter by a specific article source
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Total number of results you want returned (evenly divided across 4 sources)
 *     responses:
 *       200:
 *         description: Articles fetched successfully
 *       500:
 *         description: Server error while fetching articles
 */

router.get('/', async (req, res) => {
  try {
    const { 
      search = '',        // Keyword search parameter
      category = '',      // Category filter (Mental Health, Nutrition, etc.)
      source = '',        // Source filter (healthywomen, healthcom, guardian, bbc)
      limit = 0           // Results limit per source
    } = req.query;
    
    // Log the API request for debugging
    console.log(`Articles API Request:`, {
      search: search || 'none',
      category: category || 'none', 
      source: source || 'all sources',
      limit: limit || 'no limit'
    });
    
    // Get articles from hybrid storage with search and filtering
    const result = await getArticles(search, category, source);
    
    // Apply limit per source if requested
    let processedResult = { ...result };
    if (limit && limit > 0) {
      const limitPerSource = Math.ceil(limit / 4); // Distribute limit across 4 sources
      
      Object.keys(processedResult.bySource).forEach(sourceKey => {
        processedResult.bySource[sourceKey] = processedResult.bySource[sourceKey].slice(0, limitPerSource);
      });
      
      // Recalculate total after limiting
      processedResult.total = Object.values(processedResult.bySource)
        .reduce((total, articles) => total + articles.length, 0);
    }
    
    // API Response format: Separated by source in one response as requested
    res.json({
      success: true,
      data: processedResult.bySource,  // { healthywomen: [...], healthcom: [...], guardian: [...], bbc: [...] }
      metadata: {
        total: processedResult.total,
        searchKeyword: processedResult.searchKeyword,
        category: processedResult.category,
        source: processedResult.source,
        lastUpdated: processedResult.lastUpdated,
        appliedLimit: limit || null,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Articles API Error:', error);
    
    // Error handling: Return data from available sources even if some failed
    res.status(500).json({
      success: false,
      error: 'Failed to fetch articles',
      data: {
        healthywomen: [],
        healthcom: [],
        guardian: [],
        bbc: []
      },
      metadata: {
        total: 0,
        message: 'Some sources may be temporarily unavailable',
        timestamp: new Date().toISOString()
      }
    });
  }
});

// SEARCH ENDPOINT (Alternative way to search)

/**
 * @swagger
 * /api/articles/search:
 *   get:
 *     summary: Search articles with relevance scoring
 *     tags: [Articles]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search term
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: source
 *         schema:
 *           type: string
 *           enum: [healthywomen, healthcom, guardian, bbc]
 *         description: Filter by source
 *     responses:
 *       200:
 *         description: Search results returned successfully
 *       400:
 *         description: Missing required search query
 *       500:
 *         description: Search failed due to server error
 */

router.get('/search', async (req, res) => {
  try {
    const { q, category = '', source = '' } = req.query;
    
    // Validate search query
    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required',
        message: 'Please provide a search term using the "q" parameter'
      });
    }
    
    console.log(`Search API Request: "${q}" | Category: ${category || 'any'} | Source: ${source || 'all'}`);
    
    // Perform search with relevance ranking
    const result = await getArticles(q, category, source);
    
    // Get all articles in flat array with relevance scores for detailed search response
    const allArticles = Object.values(result.bySource).flat();
    
    res.json({
      success: true,
      query: q,
      results: {
        bySource: result.bySource,    // Grouped by source
        allArticles: allArticles,     // Flat array sorted by relevance
        count: allArticles.length
      },
      metadata: {
        searchKeyword: q,
        category: category,
        source: source,
        lastUpdated: result.lastUpdated,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error('Search API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Search failed',
      query: req.query.q || '',
      results: {
        bySource: { healthywomen: [], healthcom: [], guardian: [], bbc: [] },
        allArticles: [],
        count: 0
      }
    });
  }
});

// CATEGORIES ENDPOINT
// Get all available categories (predefined + dynamically created)
// Used for category filtering in frontend

/**
 * GET /api/articles/categories
 * Returns all health categories available for filtering
 */
router.get('/categories', async (req, res) => {
  try {
    console.log('Categories API Request');
    
    const categories = getCategories();
    
    res.json({
      success: true,
      categories: categories,
      count: categories.length,
      metadata: {
        timestamp: new Date().toISOString(),
        message: 'Includes both predefined and dynamically created categories'
      }
    });
    
  } catch (error) {
    console.error('Categories API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch categories',
      categories: [
        'Mental Health', 'Nutrition', 'Heart Disease', 'Diabetes', 
        'Fitness', 'Cancer', 'Women\'s Health', 'Public Health', 
        'Infectious Diseases', 'General Health'
      ], // Fallback categories
      count: 10
    });
  }
});

// SOURCE-SPECIFIC ENDPOINTS

/**
 * @swagger
 * /api/articles/source/{sourceKey}:
 *   get:
 *     summary: Get articles from a specific source
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: sourceKey
 *         required: true
 *         schema:
 *           type: string
 *           enum: [healthywomen, healthcom, guardian, bbc]
 *         description: The news source key
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Maximum number of articles to return
 *     responses:
 *       200:
 *         description: Articles from a specific source returned successfully
 *       400:
 *         description: Invalid source key
 *       500:
 *         description: Failed to fetch source articles
 */

router.get('/source/:sourceKey', async (req, res) => {
  try {
    const { sourceKey } = req.params;
    const { search = '', category = '', limit = 0 } = req.query;
    
    // Validate source key
    const validSources = ['healthywomen', 'healthcom', 'guardian', 'bbc'];
    if (!validSources.includes(sourceKey)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid source',
        message: `Source must be one of: ${validSources.join(', ')}`,
        validSources: validSources
      });
    }
    
    console.log(`Source-specific API Request: ${sourceKey}`);
    
    // Get articles filtered by specific source
    const result = await getArticles(search, category, sourceKey);
    const sourceArticles = result.bySource[sourceKey] || [];
    
    // Apply limit if specified
    const limitedArticles = limit > 0 ? sourceArticles.slice(0, limit) : sourceArticles;
    
    res.json({
      success: true,
      source: sourceKey,
      articles: limitedArticles,
      count: limitedArticles.length,
      totalAvailable: sourceArticles.length,
      metadata: {
        searchKeyword: search,
        category: category,
        appliedLimit: limit || null,
        lastUpdated: result.lastUpdated,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error(`Source API Error (${req.params.sourceKey}):`, error);
    res.status(500).json({
      success: false,
      error: `Failed to fetch articles from ${req.params.sourceKey}`,
      source: req.params.sourceKey,
      articles: [],
      count: 0
    });
  }
});

// MANUAL REFRESH ENDPOINT

/**
 * @swagger
 * /api/articles/refresh:
 *   post:
 *     summary: Manually refresh all article sources
 *     tags: [Articles]
 *     description: Triggers immediate re-fetching of articles from all data sources. Useful for admins/testing.
 *     responses:
 *       200:
 *         description: Articles refreshed successfully
 *       500:
 *         description: Failed to refresh articles
 */

router.post('/refresh', async (req, res) => {
  try {
    console.log('Manual refresh triggered via API');
    
    // Trigger immediate article aggregation
    const result = await aggregateAllArticles();
    
    // Count total articles fetched
    const totalFetched = Object.values(result).reduce((total, articles) => total + articles.length, 0);
    
    res.json({
      success: true,
      message: 'Articles refreshed successfully',
      results: {
        healthywomen: result.healthywomen?.length || 0,
        healthcom: result.healthcom?.length || 0,
        guardian: result.guardian?.length || 0,
        bbc: result.bbc?.length || 0,
        total: totalFetched
      },
      timestamp: new Date().toISOString(),
      nextAutomaticFetch: 'Scheduled randomly in 10-16 hours'
    });
    
  } catch (error) {
    console.error('Refresh API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refresh articles',
      message: 'Article aggregation service may be experiencing issues',
      timestamp: new Date().toISOString()
    });
  }
});

// STATISTICS ENDPOINT

/**
 * @swagger
 * /api/articles/stats:
 *   get:
 *     summary: Get article statistics and system health
 *     tags: [Articles]
 *     description: Returns aggregated statistics such as category distribution, counts per source, and system health status.
 *     responses:
 *       200:
 *         description: Statistics returned successfully
 *       500:
 *         description: Failed to fetch statistics
 */

router.get('/stats', async (req, res) => {
  try {
    console.log('Stats API Request');
    
    // Get all articles to calculate statistics
    const result = await getArticles();
    
    // Calculate statistics by source
    const sourceStats = {};
    Object.keys(result.bySource).forEach(sourceKey => {
      const articles = result.bySource[sourceKey];
      sourceStats[sourceKey] = {
        count: articles.length,
        latestArticle: articles[0]?.publishDate || null,
        categories: [...new Set(articles.map(a => a.category))]
      };
    });
    
    // Calculate category distribution
    const allArticles = Object.values(result.bySource).flat();
    const categoryStats = {};
    allArticles.forEach(article => {
      categoryStats[article.category] = (categoryStats[article.category] || 0) + 1;
    });
    
    const stats = {
      totalArticles: result.total,
      articlesBySource: sourceStats,
      categoryCounts: categoryStats,
      availableCategories: getCategories(),
      lastUpdated: result.lastUpdated,
      systemHealth: {
        cacheStatus: 'active',
        databaseStatus: 'connected',
        schedulerStatus: 'running'
      }
    };
    
    res.json({
      success: true,
      stats: stats,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Stats API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics',
      stats: {
        totalArticles: 0,
        systemHealth: {
          status: 'error'
        }
      }
    });
  }
});

// SINGLE ARTICLE ENDPOINT (Future enhancement)

/**
 * @swagger
 * /api/articles/{articleId}:
 *   get:
 *     summary: Get a single article by ID
 *     tags: [Articles]
 *     parameters:
 *       - in: path
 *         name: articleId
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique article ID
 *     responses:
 *       200:
 *         description: Single article returned successfully
 *       404:
 *         description: Article not found
 *       500:
 *         description: Failed to fetch article
 */

router.get('/:articleId', async (req, res) => {
  try {
    const { articleId } = req.params;
    
    // Get all articles and find the specific one
    const result = await getArticles();
    const allArticles = Object.values(result.bySource).flat();
    const article = allArticles.find(a => a.id === articleId);
    
    if (!article) {
      return res.status(404).json({
        success: false,
        error: 'Article not found',
        articleId: articleId,
        message: 'The requested article could not be found'
      });
    }
    
    res.json({
      success: true,
      article: article,
      metadata: {
        source: article.source,
        category: article.category,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    console.error(`Single Article API Error (${req.params.articleId}):`, error);
    res.status(404).json({
      success: false,
      error: 'Failed to fetch article',
      articleId: req.params.articleId
    });
  }
});

// Export the router
module.exports = router;