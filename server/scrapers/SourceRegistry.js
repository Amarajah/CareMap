class SourceRegistry {
  constructor() {
    this.sources = new Map();
  }

  /**
   * Register a new source scanner
   * @param {string} key - Unique identifier (e.g., 'healthywomen', 'bbc')
   * @param {BaseSourceScanner} ScannerClass - The scanner class to register
   */
  register(key, ScannerClass) {
    if (this.sources.has(key)) {
      console.warn(`Source scanner '${key}' already registered. Overwriting...`);
    }

    try {
      const scannerInstance = new ScannerClass();
      this.sources.set(key, scannerInstance);
      console.log(`Registered source scanner: ${key} (${scannerInstance.sourceName})`);
    } catch (error) {
      console.error(`Failed to register source scanner '${key}':`, error.message);
      throw error;
    }
  }

  /**
   * Get a scanner by key
   * @param {string} key 
   * @returns {BaseSourceScanner|null}
   */
  getScanner(key) {
    return this.sources.get(key) || null;
  }

  /**
   * Check if a scanner exists
   * @param {string} key 
   * @returns {boolean}
   */
  hasScanner(key) {
    return this.sources.has(key);
  }

  /**
   * Get all registered scanner keys
   * @returns {Array<string>}
   */
  getAllKeys() {
    return Array.from(this.sources.keys());
  }

  /**
   * Get information about all registered scanners
   * @returns {Array<Object>}
   */
  getAllInfo() {
    return Array.from(this.sources.entries()).map(([key, scanner]) => ({
      key,
      ...scanner.getInfo()
    }));
  }

  /**
   * Scrape using a specific scanner
   * @param {string} key - Scanner key
   * @param {CheerioStatic} $ - Cheerio instance
   * @returns {Array}
   */
  scrape(key, $) {
    const scanner = this.getScanner(key);
    
    if (!scanner) {
      // Fallback to generic scanner
      const genericScanner = this.getScanner('generic');
      if (genericScanner) {
        console.log(`No scanner found for '${key}', using generic scanner`);
        return genericScanner.scrape($);
      }
      throw new Error(`Scanner not found: ${key} and no generic fallback available`);
    }

    return scanner.scrape($);
  }

  /**
   * Remove a scanner from the registry
   * @param {string} key 
   * @returns {boolean}
   */
  unregister(key) {
    return this.sources.delete(key);
  }

  /**
   * Clear all registered scanners
   */
  clear() {
    this.sources.clear();
  }
}

// Create singleton instance
const registry = new SourceRegistry();

module.exports = registry;