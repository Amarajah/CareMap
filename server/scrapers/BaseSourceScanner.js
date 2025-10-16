class BaseSourceScanner {
  constructor(config = {}) {
    this.sourceKey = config.sourceKey || '';
    this.sourceName = config.sourceName || '';
    this.domain = config.domain || '';
    this.defaultCategories = config.defaultCategories || ['General Health'];
    this.pageUrl = config.pageUrl || '';
    this.rssUrl = config.rssUrl || null;
  }

  /**
   * Main scraping method implemented by child classes
   * @param {CheerioStatic} $ - Cheerio instance
   * @returns {Array} - Array of scraped articles
   */
  scrape($) {
    throw new Error(`scrape() method must be implemented in ${this.sourceName}`);
  }

  /**
   * Get scanner metadata
   * @returns {Object}
   */
  getInfo() {
    return {
      sourceKey: this.sourceKey,
      sourceName: this.sourceName,
      domain: this.domain,
      defaultCategories: this.defaultCategories,
      pageUrl: this.pageUrl,
      rssUrl: this.rssUrl
    };
  }
}

module.exports = BaseSourceScanner;