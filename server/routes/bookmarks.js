const express = require('express');
const router = express.Router();
const db = require('../database/db');
const authMiddleware = require('../middleware/auth');

// Get user's bookmarks
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id; // From auth middleware
    
    const result = await db.query(
      `SELECT article_id, article_data, created_at 
       FROM bookmarks 
       WHERE user_id = $1 
       ORDER BY created_at DESC`,
      [userId]
    );
    
    res.json({
      success: true,
      bookmarks: result.rows
    });
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookmarks'
    });
  }
});

// Add bookmark
router.post('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { articleId, articleData } = req.body;
    
    if (!articleId) {
      return res.status(400).json({
        success: false,
        message: 'Article ID is required'
      });
    }
    
    await db.query(
      `INSERT INTO bookmarks (user_id, article_id, article_data) 
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id, article_id) DO NOTHING`,
      [userId, articleId, JSON.stringify(articleData)]
    );
    
    res.json({
      success: true,
      message: 'Article bookmarked'
    });
  } catch (error) {
    console.error('Error adding bookmark:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add bookmark'
    });
  }
});

// Remove bookmark
router.delete('/:articleId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { articleId } = req.params;
    
    await db.query(
      'DELETE FROM bookmarks WHERE user_id = $1 AND article_id = $2',
      [userId, articleId]
    );
    
    res.json({
      success: true,
      message: 'Bookmark removed'
    });
  } catch (error) {
    console.error('Error removing bookmark:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove bookmark'
    });
  }
});

// Check if article is bookmarked
router.get('/check/:articleId', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { articleId } = req.params;
    
    const result = await db.query(
      'SELECT id FROM bookmarks WHERE user_id = $1 AND article_id = $2',
      [userId, articleId]
    );
    
    res.json({
      success: true,
      isBookmarked: result.rows.length > 0
    });
  } catch (error) {
    console.error('Error checking bookmark:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check bookmark status'
    });
  }
});

module.exports = router;