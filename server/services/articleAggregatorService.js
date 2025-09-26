const Parser = require('rss-parser');
const NodeCache = require('node-cache');
const cheerio = require('cheerio');
const fetch = require('node-fetch');
const db = require('../database/db'); // PostgreSQL connection


// Memory cache for recent articles (24 hours max, 500 articles limit)
const articleCache = new NodeCache({ 
  stdTTL: 24 * 60 * 60, // 24 hours in seconds
  maxKeys: 500 // Maximum 500 articles in memory
});

// RSS parser configuration
const parser = new Parser({
  customFields: {
    item: ['content:encoded', 'description', 'dc:creator', 'media:thumbnail']
  }
});

// Predefined health categories for auto-categorization
const PREDEFINED_CATEGORIES = {
  'Mental Health': ['anxiety', 'depression', 'stress', 'mental', 'therapy', 'psychology', 'mood', 'suicide'],
  'Nutrition': ['diet', 'food', 'nutrition', 'vitamin', 'mineral', 'eating', 'recipe', 'weight'],
  'Heart Disease': ['heart', 'cardiac', 'cardiovascular', 'blood pressure', 'cholesterol', 'stroke'],
  'Diabetes': ['diabetes', 'blood sugar', 'insulin', 'glucose', 'diabetic'],
  'Fitness': ['exercise', 'workout', 'fitness', 'gym', 'physical activity', 'sports'],
  'Cancer': ['cancer', 'tumor', 'oncology', 'chemotherapy', 'radiation', 'malignant'],
  'Women\'s Health': ['pregnancy', 'menstruation', 'menopause', 'breast', 'ovarian', 'maternal'],
  'Public Health': ['epidemic', 'pandemic', 'vaccination', 'immunization', 'outbreak', 'disease prevention'],
  'Infectious Diseases': ['virus', 'bacteria', 'infection', 'flu', 'covid', 'malaria', 'tuberculosis']
};

// Dynamic categories storage (will grow based on content analysis)
let dynamicCategories = new Set();

 /**
 * STEP 1: RSS DISCOVERY
 * First try to find RSS feeds from web page URLs
 */
const discoverRSSFeed = async (pageUrl) => {
  try {
    console.log(`Discovering RSS feed for: ${pageUrl}`);
    
    const response = await fetch(pageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Look for RSS feed links in HTML (multiple patterns)
    const rssUrl = 
      $('link[type="application/rss+xml"]').attr('href') ||
      $('link[type="application/atom+xml"]').attr('href') ||
      $('link[rel="alternate"][type*="rss"]').attr('href') ||
      $('link[rel="alternate"][type*="xml"]').attr('href') ||
      $('a[href*="/rss"]').attr('href') ||
      $('a[href*="/feed"]').attr('href') ||
      $('a[href*="rss.xml"]').attr('href');
    
    if (rssUrl) {
      // Convert relative URLs to absolute
      const absoluteRssUrl = rssUrl.startsWith('http') 
        ? rssUrl 
        : new URL(rssUrl, pageUrl).href;
        
      console.log(`RSS feed discovered: ${absoluteRssUrl}`);
      return absoluteRssUrl;
    }
    
    console.log(`No RSS feed found for: ${pageUrl}`);
    return null;
    
  } catch (error) {
    console.log(`RSS discovery failed for ${pageUrl}:`, error.message);
    return null;
  }
};

/**
 * STEP 2: RSS PARSING
 * Parse discovered RSS feeds for articles
 */
const parseRSSFeed = async (rssUrl, sourceKey) => {
  try {
    console.log(` Parsing RSS feed: ${rssUrl}`);
    
    const feed = await parser.parseURL(rssUrl);
    const articles = [];
    
    for (const item of feed.items) {
      // Extract Open Graph data for featured image
      const ogData = await extractOpenGraphData(item.link);
      
      const article = {
        id: item.guid || item.link || `${sourceKey}_${Date.now()}`,
        title: item.title,
        summary: item.contentSnippet || item.description?.substring(0, 300) + '...' || '',
        link: item.link,
        author: item['dc:creator'] || feed.title,
        publishDate: item.pubDate ? new Date(item.pubDate) : new Date(),
        source: sourceKey,
        sourceName: feed.title,
        featuredImage: ogData?.image || item['media:thumbnail'] || null,
        fetchedAt: new Date().toISOString()
      };
      
      // Auto-categorize based on content analysis
      article.category = categorizeArticle(article.title, article.summary);
      
      articles.push(article);
    }
    
    console.log(`RSS parsing successful: ${articles.length} articles from ${rssUrl}`);
    return articles;
    
  } catch (error) {
    console.log(`RSS parsing failed for ${rssUrl}:`, error.message);
    return [];
  }
};

/**
 * STEP 3: WEB SCRAPING FALLBACK
 * Scrape web pages directly when RSS feeds aren't available ("fallback to scraping" part of hybrid approach)
 */
const scrapeWebPage = async (pageUrl, sourceKey) => {
  try {
    console.log(` Scraping web page: ${pageUrl}`);
    
    const response = await fetch(pageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 15000
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    const articles = [];
    
    // Source-specific scraping logic
    switch (sourceKey) {
      case 'healthywomen':
        articles.push(...scrapeHealthyWomen($));
        break;
      case 'healthcom':
        articles.push(...scrapeHealthCom($));
        break;
      case 'guardian':
        articles.push(...scrapeGuardian($));
        break;
      case 'bbc':
        articles.push(...scrapeBBC($));
        break;
      default:
        articles.push(...scrapeGeneric($));
    }
    
    // Process each scraped article
    for (const article of articles) {
      article.source = sourceKey;
      article.fetchedAt = new Date().toISOString();
      article.publishDate = article.publishDate || new Date();
      article.id = article.id || `${sourceKey}_${Date.now()}_${Math.random()}`;
      
      // Get Open Graph data for featured image
      if (article.link && !article.featuredImage) {
        const ogData = await extractOpenGraphData(article.link);
        article.featuredImage = ogData?.image || null;
      }
      
      // Auto-categorize
      article.category = categorizeArticle(article.title, article.summary);
    }
    
    console.log(`Web scraping successful: ${articles.length} articles from ${pageUrl}`);
    return articles;
    
  } catch (error) {
    console.log(`Web scraping failed for ${pageUrl}:`, error.message);
    return [];
  }
};

/**
 * SOURCE-SPECIFIC SCRAPING FUNCTIONS
 * Each source has different HTML structure, so we need custom scraping logic
 */

// Scrape HealthyWomen directory page
const scrapeHealthyWomen = ($) => {
  const articles = [];
  
  // Look for common article selectors on HealthyWomen
  $('.css-1wy8uaa, .css-article-card, article, .post').each((i, element) => {
    const $el = $(element);
    const title = $el.find('h2, h3, .title, .headline').first().text().trim();
    const link = $el.find('a').first().attr('href');
    const summary = $el.find('p, .summary, .excerpt').first().text().trim();
    
    if (title && link) {
      articles.push({
        title,
        summary: summary.substring(0, 300) + '...',
        link: link.startsWith('http') ? link : `https://www.healthywomen.org${link}`,
        sourceName: 'HealthyWomen'
      });
    }
  });
  
  return articles;
};

// Scrape HealthCom blog page
const scrapeHealthCom = ($) => {
  const articles = [];
  
  // Look for HealthCom blog post selectors
  $('article, .post, .blog-post, .entry').each((i, element) => {
    const $el = $(element);
    const title = $el.find('h2, h3, .entry-title, .post-title').first().text().trim();
    const link = $el.find('a').first().attr('href');
    const summary = $el.find('p, .excerpt, .entry-summary').first().text().trim();
    
    if (title && link) {
      articles.push({
        title,
        summary: summary.substring(0, 300) + '...',
        link: link.startsWith('http') ? link : `https://www.health.com${link}`,
        sourceName: 'HealthCom'
      });
    }
  });
  
  return articles;
};

// Scrape Guardian Nigeria health section
const scrapeGuardian = ($) => {
  const articles = [];
  
  // Look for Guardian Nigeria article selectors
  $('article, .post, .ng-post, .entry').each((i, element) => {
    const $el = $(element);
    const title = $el.find('h2, h3, .post-title, .entry-title').first().text().trim();
    const link = $el.find('a').first().attr('href');
    const summary = $el.find('p, .excerpt, .post-excerpt').first().text().trim();
    
    if (title && link) {
      articles.push({
        title,
        summary: summary.substring(0, 300) + '...',
        link: link.startsWith('http') ? link : `https://guardian.ng${link}`,
        sourceName: 'Guardian Nigeria'
      });
    }
  });
  
  return articles;
};

// Scrape BBC Health news page
const scrapeBBC = ($) => {
  const articles = [];
  
  // Look for BBC news article selectors
  $('article, .media, .story-body, .gs-c-promo').each((i, element) => {
    const $el = $(element);
    const title = $el.find('h3, h2, .gs-c-promo-heading, .media__title').first().text().trim();
    const link = $el.find('a').first().attr('href');
    const summary = $el.find('p, .gs-c-promo-summary, .media__summary').first().text().trim();
    
    if (title && link) {
      articles.push({
        title,
        summary: summary.substring(0, 300) + '...',
        link: link.startsWith('http') ? link : `https://www.bbc.com${link}`,
        sourceName: 'BBC Health'
      });
    }
  });
  
  return articles;
};

// Generic scraping for unknown sources
const scrapeGeneric = ($) => {
  const articles = [];
  
  // Generic selectors that work on most news/blog sites
  $('article, .post, .entry, .story').each((i, element) => {
    const $el = $(element);
    const title = $el.find('h1, h2, h3, .title, .headline').first().text().trim();
    const link = $el.find('a').first().attr('href');
    const summary = $el.find('p').first().text().trim();
    
    if (title && link) {
      articles.push({
        title,
        summary: summary.substring(0, 300) + '...',
        link,
        sourceName: 'Unknown Source'
      });
    }
  });
  
  return articles;
};

/**
 * STEP 4: OPEN GRAPH DATA EXTRACTION
 * Extract featured images and metadata using Open Graph Meta Tags
 */
const extractOpenGraphData = async (url) => {
  try {
    // Add delay to be respectful
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 8000
    });
    
    if (!response.ok) return null;
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Extract Open Graph meta tags for featured image
    const ogImage = $('meta[property="og:image"]').attr('content') ||
                   $('meta[name="twitter:image"]').attr('content') ||
                   $('.featured-image img, article img').first().attr('src');
    
    return {
      image: ogImage ? (ogImage.startsWith('http') ? ogImage : new URL(ogImage, url).href) : null,
      title: $('meta[property="og:title"]').attr('content'),
      description: $('meta[property="og:description"]').attr('content')
    };
  } catch (error) {
    console.log(`Failed to extract Open Graph data from ${url}:`, error.message);
    return null;
  }
};

/**
 * STEP 5: AUTO-CATEGORIZATION
 * Categorize articles using predefined categories + dynamic creation
 */
const categorizeArticle = (title, summary) => {
  const text = `${title} ${summary}`.toLowerCase();
  const matchedCategories = [];
  
  // Check predefined categories first
  for (const [category, keywords] of Object.entries(PREDEFINED_CATEGORIES)) {
    const matches = keywords.filter(keyword => text.includes(keyword));
    if (matches.length > 0) {
      matchedCategories.push({
        category,
        strength: matches.length // Keyword matching strength for relevance
      });
    }
  }
  
  // Dynamic category creation based on health terms
  const healthTerms = text.match(/\b(disease|health|medical|clinical|treatment|symptom|diagnosis|therapy|cure|prevention)\w*\b/g);
  if (healthTerms) {
    healthTerms.forEach(term => {
      const normalizedTerm = term.charAt(0).toUpperCase() + term.slice(1);
      dynamicCategories.add(normalizedTerm);
    });
  }
  
  // Return primary category (highest matching strength) or 'General Health'
  if (matchedCategories.length > 0) {
    const primaryCategory = matchedCategories.sort((a, b) => b.strength - a.strength)[0];
    return primaryCategory.category;
  }
  
  return 'General Health';
};

/**
 * STEP 6: HYBRID APPROACH ORCHESTRATOR
 * Main function that tries RSS first, falls back to scraping
 * Our core hybrid approach
 */
const fetchArticlesFromSource = async (source) => {
  console.log(`\n Processing source: ${source.name}`);
  
  let articles = [];
  let method = 'none';
  let rssUrl = source.rss_url;
  
  // PHASE 1: Try RSS approach first
  if (!rssUrl) {
    // Discover RSS feed from page URL
    rssUrl = await discoverRSSFeed(source.page_url);
    
    if (rssUrl) {
      // Update database with discovered RSS URL
      await db.query(
        'UPDATE sources SET rss_url = $1 WHERE source_key = $2',
        [rssUrl, source.source_key]
      );
      console.log(`Saved discovered RSS URL for ${source.name}`);
    }
  }
  
  if (rssUrl) {
    // Try RSS parsing
    articles = await parseRSSFeed(rssUrl, source.source_key);
    if (articles.length > 0) {
      method = 'rss';
      console.log(`RSS method successful for ${source.name}`);
    }
  }
  
  // PHASE 2: Fallback to web scraping if RSS failed
  if (articles.length === 0) {
    console.log(`Falling back to web scraping for ${source.name}`);
    articles = await scrapeWebPage(source.page_url, source.source_key);
    if (articles.length > 0) {
      method = 'scraping';
      console.log(`Web scraping method successful for ${source.name}`);
    }
  }
  
  // Update source statistics
  if (articles.length > 0) {
    await db.query(
      'UPDATE sources SET last_fetched = NOW(), fetch_count = fetch_count + 1, scraping_method = $1 WHERE source_key = $2',
      [method, source.source_key]
    );
  } else {
    await db.query(
      'UPDATE sources SET error_count = error_count + 1 WHERE source_key = $2',
      [source.source_key]
    );
  }
  
  console.log(`${source.name}: ${articles.length} articles via ${method}`);
  return articles;
};

/**
 * STEP 7: MAIN AGGREGATION FUNCTION
 * Does the entire article fetching process for all sources
 * Implements randomized scheduling (10-16 hours) and hybrid caching
 */
const aggregateAllArticles = async () => {
  console.log('\n Starting article aggregation process...');
  
  try {
    // Get all active sources from database
    const sourcesResult = await db.query('SELECT * FROM sources WHERE is_active = true ORDER BY source_key');
    const sources = sourcesResult.rows;
    
    console.log(`Found ${sources.length} active sources to process`);
    
    const allArticles = [];
    const sourceResults = {};
    
    // Process each source with hybrid approach (RSS first, scraping fallback)
    for (const source of sources) {
      try {
        // Add small delay between sources to be respectful
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const articles = await fetchArticlesFromSource(source);
        allArticles.push(...articles);
        sourceResults[source.source_key] = articles;
        
        console.log(`Processed ${source.name}: ${articles.length} articles`);
        
      } catch (sourceError) {
        console.error(`Error processing ${source.name}:`, sourceError.message);
        sourceResults[source.source_key] = []; // Empty array for failed source
        // Continue with other sources (graceful degradation)
      }
    }
    
    // Store articles in database (5-day retention policy)
    if (allArticles.length > 0) {
      await storeArticlesInDatabase(allArticles);
    }
    
    // Update memory cache (24-hour cache, max 500 articles)
    const cacheKey = 'recent_articles';
    const cachedData = {
      bySource: sourceResults,
      all: allArticles,
      lastUpdated: new Date().toISOString(),
      totalCount: allArticles.length
    };
    
    articleCache.set(cacheKey, cachedData);
    console.log(`Updated memory cache: ${allArticles.length} articles`);
    
    // Update system config with last fetch time
    await db.query(
      'UPDATE system_config SET setting_value = $1, updated_at = NOW() WHERE setting_key = $2',
      [new Date().toISOString(), 'last_fetch']
    );
    
    console.log(`Aggregation complete: ${allArticles.length} total articles processed`);
    
    // Schedule next fetch with randomization (10-16 hours)
    scheduleNextFetch();
    
    return sourceResults;
    
  } catch (error) {
    console.error('Aggregation process failed:', error);
    
    // Schedule next fetch even if this one failed
    scheduleNextFetch();
    
    throw error;
  }
};

/**
 * STEP 8: DATABASE STORAGE WITH RETENTION POLICY
 * Store articles in PostgreSQL with 5-day retention only
 */
const storeArticlesInDatabase = async (articles) => {
  try {
    console.log(`Storing ${articles.length} articles in database...`);
    
    // Clean up articles older than 5 days (retention policy)
    const cleanupResult = await db.query('SELECT cleanup_old_articles()');
    const deletedCount = cleanupResult.rows[0].cleanup_old_articles;
    console.log(`Cleaned up ${deletedCount} old articles`);
    
    // Insert new articles with conflict handling
    let insertedCount = 0;
    let updatedCount = 0;
    
    for (const article of articles) {
      try {
        const result = await db.query(`
          INSERT INTO articles (
            id, title, summary, link, author, publish_date, source, source_name,
            featured_image, category, fetched_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          ON CONFLICT (id) DO UPDATE SET
            title = EXCLUDED.title,
            summary = EXCLUDED.summary,
            featured_image = EXCLUDED.featured_image,
            category = EXCLUDED.category,
            fetched_at = EXCLUDED.fetched_at,
            updated_at = NOW()
          RETURNING (xmax = 0) AS inserted
        `, [
          article.id, article.title, article.summary, article.link,
          article.author, article.publishDate, article.source, article.sourceName,
          article.featuredImage, article.category, article.fetchedAt
        ]);
        
        if (result.rows[0].inserted) {
          insertedCount++;
        } else {
          updatedCount++;
        }
        
      } catch (articleError) {
        console.log(`Failed to store article: ${article.title}`, articleError.message);
      }
    }
    
    console.log(`Database storage complete: ${insertedCount} inserted, ${updatedCount} updated`);
    
  } catch (error) {
    console.error('Database storage failed:', error);
  }
};

/**
 * STEP 9: RANDOMIZED SCHEDULING
 * Schedule next fetch with 10-16 hour randomization (all sources together)
 */
const scheduleNextFetch = () => {
  const minHours = 10;
  const maxHours = 16;
  const randomHours = minHours + (Math.random() * (maxHours - minHours));
  const nextFetchTime = new Date(Date.now() + randomHours * 60 * 60 * 1000);
  
  console.log(`Next fetch scheduled for: ${nextFetchTime.toLocaleString()} (in ${randomHours.toFixed(1)} hours)`);
  
  setTimeout(() => {
    aggregateAllArticles();
  }, randomHours * 60 * 60 * 1000);
};

/**
 * STEP 10: ARTICLE RETRIEVAL WITH SEARCH AND FILTERING
 * Get articles from hybrid storage (memory cache + database)
 */
const getArticles = async (searchKeyword = '', category = '', source = '') => {
  try {
    // Try memory cache first (24-hour cache, max 500 articles)
    const cachedData = articleCache.get('recent_articles');
    let articles = [];
    
    if (cachedData && cachedData.all) {
      articles = cachedData.all;
      console.log(`Retrieved ${articles.length} articles from memory cache`);
    } else {
      // Fallback to database
      const query = `
        SELECT * FROM articles 
        WHERE publish_date >= NOW() - INTERVAL '5 days'
        ORDER BY publish_date DESC
      `;
      const result = await db.query(query);
      
      articles = result.rows.map(row => ({
        id: row.id,
        title: row.title,
        summary: row.summary,
        link: row.link,
        author: row.author,
        publishDate: row.publish_date,
        source: row.source,
        sourceName: row.source_name,
        featuredImage: row.featured_image,
        category: row.category,
        fetchedAt: row.fetched_at
      }));
      
      console.log(`Retrieved ${articles.length} articles from database`);
    }
    
    // Apply search and filters
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      articles = articles.filter(article =>
        article.title.toLowerCase().includes(keyword) ||
        article.summary.toLowerCase().includes(keyword) ||
        article.category.toLowerCase().includes(keyword)
      );
    }
    
    if (category) {
      articles = articles.filter(article =>
        article.category.toLowerCase() === category.toLowerCase()
      );
    }
    
    if (source) {
      articles = articles.filter(article => article.source === source);
    }
    
    // Calculate relevance scores based on keyword matching strength
    articles = articles.map(article => ({
      ...article,
      relevanceScore: calculateRelevanceScore(article, searchKeyword)
    })).sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    // Group by source for API response (separated by source in one response)
    const groupedBySource = {
      healthywomen: articles.filter(a => a.source === 'healthywomen'),
      healthcom: articles.filter(a => a.source === 'healthcom'),
      guardian: articles.filter(a => a.source === 'guardian'),
      bbc: articles.filter(a => a.source === 'bbc')
    };
    
    return {
      bySource: groupedBySource,
      total: articles.length,
      searchKeyword,
      category,
      source,
      lastUpdated: cachedData?.lastUpdated || new Date().toISOString()
    };
    
  } catch (error) {
    console.error('Error retrieving articles:', error);
    throw error;
  }
};

/**
 * STEP 11: RELEVANCE SCORING FOR SEARCH RANKING
 * Calculate relevance score based on keyword matching strength
 */
const calculateRelevanceScore = (article, searchKeyword) => {
  if (!searchKeyword) return 1;
  
  const keyword = searchKeyword.toLowerCase();
  const title = article.title.toLowerCase();
  const summary = article.summary.toLowerCase();
  
  let score = 0;
  
  // Title exact match gets highest score
  if (title === keyword) score += 100;
  
  // Title contains keyword
  if (title.includes(keyword)) score += 50;
  
  // Title word match
  const titleWords = title.split(' ');
  if (titleWords.includes(keyword)) score += 30;
  
  // Summary contains keyword (multiple matches increase score)
  const summaryMatches = (summary.match(new RegExp(keyword, 'gi')) || []).length;
  score += summaryMatches * 10;
  
  // Category contains keyword
  if (article.category.toLowerCase().includes(keyword)) score += 20;
  
  // Boost for newer articles (recency factor)
  const hoursOld = (Date.now() - new Date(article.publishDate)) / (1000 * 60 * 60);
  score += Math.max(0, 24 - hoursOld) * 0.5;
  
  return score;
};

/**
 * STEP 12: GET AVAILABLE CATEGORIES
 * Return all categories (predefined + dynamically created)
 */
const getCategories = () => {
  const predefined = Object.keys(PREDEFINED_CATEGORIES);
  const dynamic = Array.from(dynamicCategories);
  return [...predefined, ...dynamic, 'General Health'].sort();
};

/**
 * STEP 13: INITIALIZATION
 * Set up the service and start first fetch
 */
const initializeService = async () => {
  console.log('Initializing Article Aggregator Service...');
  
  try {
    // Test database connection
    await db.query('SELECT 1');
    console.log('Database connection verified');
    
    // Start first aggregation
    await aggregateAllArticles();
    
    console.log('Article Aggregator Service initialized successfully');
    
  } catch (error) {
    console.error('Service initialization failed:', error);
    
    // Try to schedule next fetch even if initialization failed
    setTimeout(() => {
      initializeService();
    }, 30 * 60 * 1000); // Retry in 30 minutes
  }
};

// Export functions for use in API routes
module.exports = {
  initializeService,
  aggregateAllArticles,
  getArticles,
  getCategories,
  discoverRSSFeed, // For manual testing
  scrapeWebPage // For manual testing
};