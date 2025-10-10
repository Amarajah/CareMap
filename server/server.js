const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

const db = require('./database/db');
const { initializeService } = require('./services/articleAggregatorService');

// Import routes
const authRoutes = require('./routes/auth');
const articleRoutes = require('./routes/articles');

const bookmarkRoutes = require('./routes/bookmarks');

// MIDDLEWARE SETUP
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// HEALTH CHECK ENDPOINT
app.get('/health', async (req, res) => {
  try {
    await db.query('SELECT 1 as test');
    res.json({
      status: 'healthy',
      message: 'Server and database are running',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({
      status: 'unhealthy',
      message: 'Database connection failed',
      error: error.message
    });
  }
});

// ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes); 

// Bookmarks
app.use('/api/bookmarks', bookmarkRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'CareMap API is running!',
    version: '1.0.0',
    endpoints: {
      health: 'GET /health',
      login: 'POST /api/auth/login',
      signup: 'POST /api/auth/signup',
      // Article endpoints
      allArticles: 'GET /api/articles',
      search: 'GET /api/articles/search?q=keyword',
      categories: 'GET /api/articles/categories',
      // All 4 source-specific endpoints
      healthlineOnly: 'GET /api/articles/source/healthywomen',
      harvardOnly: 'GET /api/articles/source/healthcom', 
      guardianOnly: 'GET /api/articles/source/guardian',
      bbcOnly: 'GET /api/articles/source/bbc',
      refresh: 'POST /api/articles/refresh',
      stats: 'GET /api/articles/stats'
    },
    availableSources: ['healthywomen', 'healthcom', 'guardian', 'bbc']
  });
});

// ERROR HANDLING MIDDLEWARE
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Handle 404 for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// SERVER STARTUP
const PORT = process.env.PORT || 8000;

const startServer = async () => {
  try {
    console.log('Starting Caremap Infohub Server...');
    
    // Test database connection first
    console.log('Testing database connection...');
    await db.query('SELECT NOW() as current_time');
    console.log('Database connection successful');
    
    // Initialize the article aggregator service
    console.log('Initializing Article Aggregator Service...');
    initializeService(); // This ensures that there's zero wait for article aggregation before a user can access articles 
    console.log('Article Aggregator Service started successfully');
    
    // Start Express server once
    app.listen(PORT, () => {
      console.log('\n=================================');
      console.log(`Caremap Infohub Server running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Database: ${process.env.DB_NAME || 'caremap_db'}`);
      console.log('=================================\n');
      
      console.log('Next steps:');
      console.log('   1. Check health endpoint: GET /health');
      console.log('   2. Watch for article aggregation logs');
      console.log('   3. Articles will be available once first fetch completes\n');
    });
    
  } catch (error) {
    console.error('Server startup failed:', error.message);
    console.error('Full error:', error);
    
    // Try to start server without aggregator service
    console.log('Starting server without article aggregator...');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} (limited functionality)`);
      console.log('Article aggregator service failed to initialize');
    });
  }
};

// GRACEFUL SHUTDOWN HANDLERS
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  try {
    await db.end();
    console.log('Database connections closed');
  } catch (error) {
    console.error('Error during shutdown:', error);
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\nSIGINT received (Ctrl+C), shutting down gracefully...');
  try {
    await db.end();
    console.log('Database connections closed');
  } catch (error) {
    console.error('Error during shutdown:', error);
  }
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection:', reason);
  console.error('At Promise:', promise);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Start the server
startServer();