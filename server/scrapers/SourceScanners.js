const BaseSourceScanner = require('./BaseSourceScanner');

/**
 * HealthyWomen Scanner
 */
class HealthyWomenScanner extends BaseSourceScanner {
  constructor() {
    super({
      sourceKey: 'healthywomen',
      sourceName: 'HealthyWomen',
      domain: 'healthywomen.org',
      defaultCategories: ['Women\'s Health'],
      pageUrl: 'https://www.healthywomen.org'
    });
  }

  scrape($) {
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
          sourceName: this.sourceName
        });
      }
    });
    
    return articles;
  }
}

/**
 * HealthCom Scanner
 */
class HealthComScanner extends BaseSourceScanner {
  constructor() {
    super({
      sourceKey: 'healthcom',
      sourceName: 'HealthCom',
      domain: 'health.com',
      defaultCategories: ['General Health', 'Wellness'],
      pageUrl: 'https://www.health.com'
    });
  }

  scrape($) {
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
          sourceName: this.sourceName
        });
      }
    });
    
    return articles;
  }
}

/**
 * Guardian Nigeria Scanner
 */
class GuardianScanner extends BaseSourceScanner {
  constructor() {
    super({
      sourceKey: 'guardian',
      sourceName: 'Guardian Nigeria',
      domain: 'guardian.ng',
      defaultCategories: ['Public Health', 'News'],
      pageUrl: 'https://guardian.ng'
    });
  }

  scrape($) {
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
          sourceName: this.sourceName
        });
      }
    });
    
    return articles;
  }
}

/**
 * BBC Health Scanner
 */
class BBCScanner extends BaseSourceScanner {
  constructor() {
    super({
      sourceKey: 'bbc',
      sourceName: 'BBC Health',
      domain: 'bbc.com',
      defaultCategories: ['Public Health', 'News', 'Medical Research'],
      pageUrl: 'https://www.bbc.com'
    });
  }

  scrape($) {
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
          sourceName: this.sourceName
        });
      }
    });
    
    return articles;
  }
}

/**
 * Generic Scanner (fallback for unknown sources)
 */
class GenericScanner extends BaseSourceScanner {
  constructor() {
    super({
      sourceKey: 'generic',
      sourceName: 'Unknown Source',
      domain: '',
      defaultCategories: ['General Health']
    });
  }

  scrape($) {
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
          sourceName: this.sourceName
        });
      }
    });
    
    return articles;
  }
}

module.exports = {
  HealthyWomenScanner,
  HealthComScanner,
  GuardianScanner,
  BBCScanner,
  GenericScanner
};