// services/__tests__/articleAggregatorService.test.js
const { 
  discoverRSSFeed, 
  parseRSSFeed, 
  scrapeWebPage, 
  categorizeArticle, 
  getArticles, 
  getCategories 
} = require('../articleAggregatorService');

const db = require('../../database/db');
const fetch = require('node-fetch');
const Parser = require('rss-parser');
const cheerio = require('cheerio');
const { registry } = require('../../scrapers');


jest.mock('node-fetch', () => jest.fn());
jest.mock('rss-parser', () => {
  return jest.fn().mockImplementation(() => {
    return {
      parseURL: jest.fn()  // Override later
    };
  });
});
jest.mock('cheerio', () => ({
  load: jest.fn()
}));
jest.mock('../../database/db', () => ({
  query: jest.fn()
}));
jest.mock('../../scrapers', () => ({
  registry: {
    scrape: jest.fn()
  }
}));

describe('Article Aggregator Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('discoverRSSFeed()', () => {
    it('should return discovered RSS URL', async () => {
      // Mock Fetch to return HTML
      fetch.mockResolvedValue({
        ok: true,
        text: async () => `<link type="application/rss+xml" href="/feed.xml">`,
      });

      cheerio.load.mockImplementation((html) => {
        return (selector) => {
          // If the service asks for the RSS link, return an object with an attr function
          if (selector.includes('application/rss+xml')) {
            return {
              attr: jest.fn().mockReturnValue('https://example.com/feed.xml') 
            };
          }
          // specific fallback
          return { attr: jest.fn().mockReturnValue(null) };
        };
      });

      const result = await discoverRSSFeed('https://example.com', { fetch });
      expect(result).toBe('https://example.com/feed.xml');
    });

    it('should return null when no RSS link found', async () => {
      fetch.mockResolvedValue({
        ok: true,
        text: async () => '<html></html>'
      });

      // Mock cheerio to return nothing found
      cheerio.load.mockImplementation(() => {
        return () => ({ attr: jest.fn().mockReturnValue(null) });
      });

      const result = await discoverRSSFeed('https://example.com', { fetch });
      expect(result).toBeNull();
    });

    it('should handle fetch failure', async () => {
      fetch.mockRejectedValue(new Error('Network Fail'));
      const result = await discoverRSSFeed('https://example.com', { fetch });
      expect(result).toBeNull();
    });
  });

  describe('parseRSSFeed()', () => {
    // Declare the mock function here to control the instance
    let mockParseURL; 

    beforeEach(() => {
        jest.clearAllMocks();
        
        // Initialize the mock function for this specific test suite
        mockParseURL = jest.fn();
        
        // Tell the Parser Class Mock (the constructor) to return 
        //   an instance that uses our specific mockParseURL function.
        Parser.mockImplementation(() => {
            return {
                parseURL: mockParseURL
            };
        });
    });

    it('should parse RSS feed and return articles', async () => {
      
      // Mock the global 'fetch' once for the internal OG call
      fetch.mockResolvedValueOnce({
        ok: true,
        text: async () => `
          <html>
            <meta property="og:image" content="https://img.com">
          </html>
        `,
      });
      
      // Mock Cheerio to handle the OG tag discovery
      // This implementation ensures that when the real extractOpenGraphData uses cheerio, 
      // it finds the correct OG tag.
      cheerio.load.mockImplementation((html) => {
        return (selector) => {
          // If the selector targets the OG image, return the mock value.
          if (selector === 'meta[property="og:image"]') {
            return {
              attr: jest.fn().mockReturnValue('https://img.com')
            };
          }
          // Default fallback for any other selector call
          return { attr: jest.fn().mockReturnValue(null) };
        };
      });

      // Mock RSS Parser data
      mockParseURL.mockResolvedValue({
        title: 'FeedTitle',
        items: [
          {
            link: 'https://article.com',
            title: 'Test',
            'dc:creator': 'Author',
            pubDate: new Date().toISOString(),
            isoDate: new Date().toISOString(), 
            content: 'Test content summary.',
            description: 'This is the article summary expected by the service.',
            'media:thumbnail': null // Match the service code's logic
          }
        ]
      });

      const articles = await parseRSSFeed('https://feed.com', 'source1');

      expect(articles.length).toBe(1);
      expect(articles[0].title).toBe('Test');
      expect(articles[0].source).toBe('source1');
      expect(articles[0].featuredImage).toBe('https://img.com');
    });

    it('should return empty array on failure', async () => {
      mockParseURL.mockRejectedValue(new Error('RSS Error'));

      const articles = await parseRSSFeed('bad-url', 'src');

      expect(articles).toEqual([]);
    });
  });
  afterEach(() => {
  jest.restoreAllMocks(); // A general purpose function to restore spies
});

  describe('scrapeWebPage()', () => {
    it('should scrape webpage successfully', async () => {
      const fake$ = { 
        html: () => '', 
        find: jest.fn(),
      };
      cheerio.load.mockReturnValue(fake$);
      registry.scrape.mockReturnValue([{ title: 'Scraped Article', summary: 'Summary' }]);
      const service = require('../articleAggregatorService');
      service.extractOpenGraphData = jest.fn().mockResolvedValue({ image: 'img.jpg' });

      fetch.mockResolvedValue({ ok: true, text: async () => '<html></html>' });
      const articles = await scrapeWebPage('https://site.com', 'source1');
      expect(articles.length).toBe(1);
      expect(articles[0].title).toBe('Scraped Article');
    });

    it('should return [] if fetch fails', async () => {
      fetch.mockRejectedValue(new Error('Fail'));
      const articles = await scrapeWebPage('https://bad.com', 'source1');
      expect(articles).toEqual([]);
    });
  });

  describe('categorizeArticle()', () => {
    it('should match predefined category', () => {
      const category = categorizeArticle('Heart Attack', 'Symptoms of heart disease');
      expect(category).toBe('Heart Disease');
    });

    it('should return General Health when no match', () => {
      const category = categorizeArticle('Random', 'Unrelated content');
      expect(category).toBe('General Health');
    });
  });

  describe('getCategories()', () => {
    it('should include predefined and dynamic categories', () => {
      const cats = getCategories();
      expect(cats).toContain('Mental Health');
      expect(cats).toContain('General Health');
    });
  });

  describe('getArticles()', () => {
    it('should fetch from cache', async () => {
      const service = require('../articleAggregatorService');
      service.articleCache.set('recent_articles', { all: [{ title: 'Cached' }] });

      const result = await getArticles();
      expect(result.total).toBe(1);
      expect(result.bySource).toBeDefined();
    });
  });
});
