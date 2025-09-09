// Articles Routes - Medium Integration & Knowledge Base

const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const axios = require('axios');
const multer = require('multer');

const ARTICLES_FILE = path.join(__dirname, '../data/articles.json');
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const thumbnailDir = path.join(__dirname, '../../fronted/public/article-thumbnails');
    if (!fsSync.existsSync(thumbnailDir)) {
      fsSync.mkdirSync(thumbnailDir, { recursive: true });
    }
    cb(null, thumbnailDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `upload-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

const downloadThumbnail = async (url, slug) => {
  try {
    if (!url) {
      return null;
    }

    const thumbnailDir = path.join(__dirname, '../../fronted/public/article-thumbnails');
    const filename = `${slug}.webp`;
    const filepath = path.join(thumbnailDir, filename);

    // Check if thumbnail already exists
    if (fsSync.existsSync(filepath)) {
      return `/article-thumbnails/${filename}`;
    }

    // Ensure directory exists
    if (!fsSync.existsSync(thumbnailDir)) {
      fsSync.mkdirSync(thumbnailDir, { recursive: true });
    }


    
    // Download with axios (handles redirects automatically)
    const response = await axios.get(url, {
      responseType: 'stream',
      timeout: 30000, // Increased timeout to 30 seconds
      maxRedirects: 5,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    // Save the image
    const writer = fsSync.createWriteStream(filepath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => {

        resolve(`/article-thumbnails/${filename}`);
      });
      
      writer.on('error', (err) => {
        console.error('Error writing thumbnail file:', err);
        fsSync.unlink(filepath, () => {}); // Clean up partial file
        resolve(null);
      });
    });

  } catch (error) {
    console.error('Thumbnail download error:', error.message);
    return null;
  }
};

/* GET ARTICLES FROM DATABASE */
router.get('/', async (req, res) => {
  try {
    const { executeQuery } = require('../database/connection');
    
    // Get articles from database
    const articles = await executeQuery(`
      SELECT id, title, description, content, slug, thumbnail_url, 
             external_link, category, source, is_published, 
             published_at, created_at, updated_at
      FROM articles 
      WHERE is_published = true 
      ORDER BY created_at DESC
    `);
    
    res.json({
      success: true,
      data: {
        articles: articles,
        total: articles.length
      },
      message: 'Articles retrieved successfully'
    });
    
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch articles',
      error: error.message
    });
  }
});

/* GET MEDIUM BLOG LINK (External) */
router.get('/medium', async (req, res) => {
  try {
    // Simply redirect to Medium blog or return link
    res.json({
      success: true,
      data: {
        url: 'https://medium.com/@mrrobot.computerservice',
        title: 'MR-ROBOT Computer Repair Blog',
        description: 'Visit our Medium blog for additional articles'
      },
      message: 'Medium blog link retrieved'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get Medium blog link',
      error: error.message
    });
  }
});

// ========================================
// GET FEATURED ARTICLES
// ========================================
router.get('/featured', async (req, res) => {
  try {
    const featuredArticles = [
      {
        id: 1,
        title: 'Professional Computer Repair Workflow',
        description: 'Step-by-step professional workflow for diagnosing and repairing computer issues efficiently.',
        category: 'Hardware',
        difficulty: 'Intermediate',
        readTime: '10 min read',
        thumbnail: '/service_banner.jpg',
        customThumbnail: '/service_banner.jpg',
        slug: 'professional-computer-repair-workflow'
      },
      {
        id: 2,
        title: 'Advanced Network Security Setup',
        description: 'Complete guide to setting up enterprise-level network security for small businesses.',
        category: 'Security', 
        difficulty: 'Advanced',
        readTime: '15 min read',
        thumbnail: '/cover.jpg',
        customThumbnail: '/cover.jpg',
        slug: 'advanced-network-security-setup'
      },
      {
        id: 3,
        title: 'Data Recovery Best Practices',
        description: 'Professional data recovery techniques and tools for retrieving lost or corrupted data.',
        category: 'Software',
        difficulty: 'Intermediate',
        readTime: '12 min read',
        thumbnail: '/logo2.png',
        customThumbnail: '/logo2.png',
        slug: 'data-recovery-best-practices'
      }
    ];

    res.json({
      success: true,
      data: featuredArticles,
      message: 'Featured articles retrieved successfully'
    });
    
  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured articles',
      error: error.message
    });
  }
});

/* GET SINGLE ARTICLE BY ID */
router.get('/id/:id', async (req, res) => {
  try {
    const { executeQuery } = require('../database/connection');
    const { id } = req.params;
    
    // Get article from database by ID
    const articles = await executeQuery(`
      SELECT id, title, description, content, slug, thumbnail_url, 
             external_link, category, source, is_published, 
             published_at, created_at, updated_at
      FROM articles 
      WHERE id = $1
    `, [id]);
    
    if (articles.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }
    
    res.json({
      success: true,
      data: articles[0],
      message: 'Article retrieved successfully'
    });
    
  } catch (error) {
    console.error('Error fetching article by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch article',
      error: error.message
    });
  }
});

/* GET SINGLE ARTICLE BY SLUG */
router.get('/:slug', async (req, res) => {
  try {
    const { executeQuery } = require('../database/connection');
    const { slug } = req.params;
    
    // Get article from database by slug
    const articles = await executeQuery(`
      SELECT id, title, description, content, slug, thumbnail_url, 
             external_link, category, source, is_published, 
             published_at, created_at, updated_at
      FROM articles 
      WHERE slug = $1 AND is_published = true
    `, [slug]);
    
    if (articles.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }
    
    res.json({
      success: true,
      data: articles[0],
      message: 'Article retrieved successfully'
    });
    
  } catch (error) {
    console.error('Error fetching article:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch article',
      error: error.message
    });
  }
});

/* CREATE NEW ARTICLE */
router.post('/', async (req, res) => {
  try {
    const { executeQuery } = require('../database/connection');
    const { title, description, content, category, source, is_published, thumbnail_url, external_link } = req.body;
    
    if (!title || !description || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and content are required'
      });
    }
    
    // Generate slug from title
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    // Download thumbnail if URL is provided
    let finalThumbnailUrl = thumbnail_url;
    if (thumbnail_url && thumbnail_url.startsWith('http')) {
      const downloadedThumbnail = await downloadThumbnail(thumbnail_url, slug);
      if (downloadedThumbnail) {
        finalThumbnailUrl = downloadedThumbnail;
      }
    }
    
    // Insert article into database
    const result = await executeQuery(`
      INSERT INTO articles (title, description, content, slug, category, source, is_published, published_at, thumbnail_url, external_link)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id
    `, [title, description, content, slug, category || 'Computer Science', source || 'admin', is_published !== false, new Date(), finalThumbnailUrl || null, external_link || null]);
    
    res.json({
      success: true,
      message: 'Article created successfully',
      data: { id: result[0].id, slug, thumbnail_url: finalThumbnailUrl }
    });
    
  } catch (error) {
    console.error('Error creating article:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create article',
      error: error.message
    });
  }
});

/* DELETE ARTICLE */
router.delete('/:id', async (req, res) => {
  try {
    const { executeQuery } = require('../database/connection');
    const { id } = req.params;
    
    // Check if article exists
    const articles = await executeQuery('SELECT id FROM articles WHERE id = $1', [id]);
    if (articles.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }
    
    // Delete article
    await executeQuery('DELETE FROM articles WHERE id = $1', [id]);
    
    res.json({
      success: true,
      message: 'Article deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete article',
      error: error.message
    });
  }
});

/* UPDATE ARTICLE */
router.put('/:id', async (req, res) => {
  try {
    const { executeQuery } = require('../database/connection');
    const { id } = req.params;
    const { title, description, content, category, is_published, thumbnail_url, external_link } = req.body;
    
    if (!title || !description || !content) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and content are required'
      });
    }
    
    // Check if article exists and get current slug
    const articles = await executeQuery('SELECT id, slug FROM articles WHERE id = $1', [id]);
    if (articles.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }
    
    const currentSlug = articles[0].slug;
    
    // Download thumbnail if URL is provided and it's a new URL
    let finalThumbnailUrl = thumbnail_url;
    if (thumbnail_url && thumbnail_url.startsWith('http')) {
      const downloadedThumbnail = await downloadThumbnail(thumbnail_url, currentSlug);
      if (downloadedThumbnail) {
        finalThumbnailUrl = downloadedThumbnail;
      }
    }
    
    // Update article
    await executeQuery(`
      UPDATE articles 
      SET title = $1, description = $2, content = $3, category = $4, is_published = $5, 
          thumbnail_url = $6, external_link = $7, updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
    `, [title, description, content, category || 'Computer Science', is_published !== false, 
        finalThumbnailUrl || null, external_link || null, id]);
    
    res.json({
      success: true,
      message: 'Article updated successfully',
      data: { thumbnail_url: finalThumbnailUrl }
    });
    
  } catch (error) {
    console.error('Error updating article:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update article',
      error: error.message
    });
  }
});

/* UPLOAD THUMBNAIL FILE */
router.post('/upload-thumbnail', upload.single('thumbnail'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Return the file path relative to public directory
    const filePath = `/article-thumbnails/${req.file.filename}`;
    
    res.json({
      success: true,
      message: 'Thumbnail uploaded successfully',
      data: {
        filename: req.file.filename,
        path: filePath,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  } catch (error) {
    console.error('Thumbnail upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload thumbnail',
      error: error.message
    });
  }
});

module.exports = { router, downloadThumbnail };