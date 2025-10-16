const registry = require('./SourceRegistry');
const {
  HealthyWomenScanner,
  HealthComScanner,
  GuardianScanner,
  BBCScanner,
  GenericScanner
} = require('./SourceScanners');

/**
 * Initialize and register all source scanners
 */
function initializeScanners() {
  console.log('Initializing source scanners...');

  try {
    // Register each scanner with its key
    registry.register('healthywomen', HealthyWomenScanner);
    registry.register('healthcom', HealthComScanner);
    registry.register('guardian', GuardianScanner);
    registry.register('bbc', BBCScanner);
    registry.register('generic', GenericScanner); // Fallback scanner

    console.log(`Successfully registered ${registry.getAllKeys().length} source scanners`);
    console.log('Available scanners:', registry.getAllKeys().join(', '));
    
  } catch (error) {
    console.error('Error initializing source scanners:', error.message);
    throw error;
  }
}

// Auto-initialize when module is imported
initializeScanners();

// Export the registry and scanners
module.exports = {
  registry,
  HealthyWomenScanner,
  HealthComScanner,
  GuardianScanner,
  BBCScanner,
  GenericScanner
};