/**
 * Admin Routes - Professional Dashboard Management
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const multer = require('multer');
const { executeQuery } = require('../database/connection');
const { body, validationResult } = require('express-validator');

// File path for storing articles
const ARTICLES_FILE = path.join(__dirname, '../data/articles.json');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../public/article-thumbnails');
    // Ensure directory exists
    if (!fsSync.existsSync(uploadPath)) {
      fsSync.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'upload-' + uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit (reduced since we compress on frontend)
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Middleware to verify admin token
const verifyAdminToken = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists and is admin
    const users = await executeQuery(
      'SELECT id, email, role, status, name FROM users WHERE id = $1 AND role = $2 AND status = $3',
      [decoded.id, 'admin', 'active']
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Token is valid but user no longer exists or is not admin.'
      });
    }

    // Add user info to request
    req.user = users[0];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.'
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Please login again.'
      });
    } else {
      console.error('Admin token verification error:', error);
      return res.status(500).json({
        success: false,
        message: 'Server error during token verification.'
      });
    }
  }
};

// Admin Login
router.post('/login', [
  body('username').trim().isLength({ min: 3, max: 100 }).withMessage('Username must be between 3 and 100 characters'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { username, password } = req.body;

    // Check if username is actually an email or username
    const users = await executeQuery('SELECT * FROM users WHERE (email = $1 OR name = $2) AND role = $3 AND status = $4', [username, username, 'admin', 'active']);
    
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = users[0];
    
    // Handle PHP bcrypt format ($2y$) by converting to Node.js format ($2a$)
    let passwordHash = user.password_hash;
    if (passwordHash.startsWith('$2y$')) {
      passwordHash = '$2a$' + passwordHash.substring(4);
    }
    
    const isValidPassword = await bcrypt.compare(password, passwordHash);

    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {

    res.status(500).json({ success: false, message: 'Login failed' });
  }
});

// ========================================
// DASHBOARD DATA
// ========================================

// Get dashboard statistics
router.get('/dashboard', verifyAdminToken, async (req, res) => {
  try {
    // Get total services count
    const servicesResult = await executeQuery('SELECT COUNT(*) as total FROM services WHERE is_active = true');
    const totalServices = parseInt(servicesResult[0]?.total) || 0;

    // Get total categories count
    const categoriesResult = await executeQuery('SELECT COUNT(*) as total FROM service_categories WHERE is_active = true');
    const totalCategories = parseInt(categoriesResult[0]?.total) || 0;

    // Get total articles count (exclude placeholder articles)
    const articlesResult = await executeQuery('SELECT COUNT(*) as total FROM articles WHERE is_published = true AND title NOT LIKE \'Category: %\'');
    const totalArticles = parseInt(articlesResult[0]?.total) || 0;

    // Get total users count
    const usersResult = await executeQuery('SELECT COUNT(*) as total FROM users WHERE status = $1', ['active']);
    const totalUsers = parseInt(usersResult[0]?.total) || 0;

    // Get total bookings count
    const bookingsResult = await executeQuery('SELECT COUNT(*) as total FROM bookings');
    const totalBookings = parseInt(bookingsResult[0]?.total) || 0;

    // Get total contact submissions count
    const contactsResult = await executeQuery('SELECT COUNT(*) as total FROM contact_submissions');
    const totalContacts = parseInt(contactsResult[0]?.total) || 0;

    // Get recent services (last 5)
    const recentServices = await executeQuery(`
      SELECT id, name, description, price, duration, created_at
      FROM services 
      WHERE is_active = true
      ORDER BY created_at DESC 
      LIMIT 5
    `);

    // Get recent articles (last 5, exclude placeholder articles)
    const recentArticles = await executeQuery(`
      SELECT id, title, description, category, created_at
      FROM articles 
      WHERE is_published = true AND title NOT LIKE 'Category: %'
      ORDER BY created_at DESC 
      LIMIT 5
    `);

    res.json({
      success: true,
      data: {
        stats: {
          totalServices,
          totalCategories,
          totalArticles,
          totalUsers,
          totalBookings,
          totalContacts
        },
        recentServices,
        recentArticles
      },
      message: 'Dashboard data retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch dashboard data',
      error: error.message
    });
  }
});

// ========================================
// ARTICLE MANAGEMENT SYSTEM
// ========================================

// Get all articles
router.get('/articles', verifyAdminToken, async (req, res) => {
  try {
    // Get articles from database (exclude placeholder articles)
    const articles = await executeQuery(`
      SELECT id, title, description, content, slug, thumbnail_url, 
             external_link, category, source, is_published, 
             published_at, created_at, updated_at
      FROM articles 
      WHERE title NOT LIKE 'Category: %'
      ORDER BY created_at DESC
    `);
    
    res.json({
      success: true,
      data: articles,
      message: 'Articles retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch articles' 
    });
  }
 });

// Get single article by ID
router.get('/articles/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get article from database
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
    console.error('Error fetching article:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch article' 
    });
  }
 });

// Create new article
router.post('/articles', (req, res, next) => {
  next();
}, verifyAdminToken, [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required and must be less than 200 characters'),
  body('description').trim().isLength({ min: 1, max: 1000 }).withMessage('Description is required and must be less than 1000 characters'),
  body('content').optional().trim(),
  body('category').optional().trim().isLength({ max: 100 }).withMessage('Category must be less than 100 characters'),
  body('source').optional().trim().isLength({ max: 50 }).withMessage('Source must be less than 50 characters'),
  body('is_published').optional().isBoolean().withMessage('is_published must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }
    
    const { title, description, content, category, source, is_published } = req.body;
    
    // Create slug from title
    let baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    // Check if slug already exists and add timestamp if it does
    let slug = baseSlug;
    let counter = 1;
    while (true) {
      const existingSlug = await executeQuery('SELECT id FROM articles WHERE slug = $1', [slug]);
      if (existingSlug.length === 0) {
        break;
      }
      slug = `${baseSlug}-${Date.now()}-${counter}`;
      counter++;
    }

    // Insert article into database
    const result = await executeQuery(`
      INSERT INTO articles (title, description, content, slug, category, source, is_published, published_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id
    `, [title, description, content || '', slug, category || 'General', source || 'admin', is_published !== undefined ? is_published : true, new Date()]);

    res.json({
      success: true,
      message: 'Article created successfully',
      data: { id: result[0].id, slug }
    });
  } catch (error) {
    console.error('Error creating article:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      detail: error.detail,
      stack: error.stack
    });
    console.error('Request body that caused error:', req.body);
    console.error('Database query parameters:', [req.body.title, req.body.description, req.body.content || '', req.body.slug, req.body.category || 'General', req.body.source || 'admin', req.body.is_published !== undefined ? req.body.is_published : true, new Date()]);
    res.status(500).json({
      success: false,
      message: 'Failed to create article',
      error: error.message
    });
  }
});

// Update article
router.put('/articles/:id', verifyAdminToken, [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required and must be less than 200 characters'),
  body('description').trim().isLength({ min: 1, max: 1000 }).withMessage('Description is required and must be less than 1000 characters'),
  body('content').optional().trim(),
  body('category').optional().trim().isLength({ max: 100 }).withMessage('Category must be less than 100 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { title, description, content, category, external_link } = req.body;
    
    // Create slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Check if article exists
    const articles = await executeQuery('SELECT id FROM articles WHERE id = $1', [id]);
    if (articles.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Article not found' 
      });
    }

    // Update article in database
    await executeQuery(`
      UPDATE articles 
      SET title = $1, description = $2, content = $3, slug = $4, category = $5, external_link = $6, updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
    `, [title, description, content || '', slug, category || 'General', external_link || null, id]);

    res.json({
      success: true,
      message: 'Article updated successfully'
    });
  } catch (error) {
    console.error('Error updating article:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update article' 
    });
  }
});

// Update article category
router.put('/articles/update-category', verifyAdminToken, async (req, res) => {
  try {
    const { oldCategory, newCategory } = req.body;
    
    if (!oldCategory || !newCategory) {
      return res.status(400).json({
        success: false,
        message: 'Both oldCategory and newCategory are required'
      });
    }
    
    // Update all articles with the old category to use the new category
    const result = await executeQuery(
      'UPDATE articles SET category = $1, updated_at = CURRENT_TIMESTAMP WHERE category = $2',
      [newCategory, oldCategory]
    );
    
    res.json({
      success: true,
      message: `Updated ${result.rowCount || 0} articles from "${oldCategory}" to "${newCategory}"`
    });
  } catch (error) {
    console.error('Update article category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update article category'
    });
  }
});

// Delete article
router.delete('/articles/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if article exists
    const articles = await executeQuery('SELECT id FROM articles WHERE id = $1', [id]);
    if (articles.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Article not found' 
      });
    }

    // Delete article from database
    await executeQuery('DELETE FROM articles WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'Article deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete article' 
    });
  }
});

// NOTE: Thumbnail upload is handled by /api/articles/upload-thumbnail
// This endpoint was removed to avoid conflicts and file deletion issues

// Get all services
router.get('/services', verifyAdminToken, async (req, res) => {
  try {
    // Try the original query first, fallback to simple query if it fails
    let services;
    try {
      services = await executeQuery(`
      SELECT s.*, sc.name as category_name 
      FROM services s 
        LEFT JOIN service_categories sc ON s.category_id = sc.id 
        WHERE s.is_active = true
        ORDER BY s.created_at DESC
      `);
    } catch (error) {
      // Fallback to simple query
      services = await executeQuery(`
        SELECT * FROM services 
        WHERE is_active = true
        ORDER BY created_at DESC
      `);
    }

    res.json({
      success: true,
      data: services
    });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch services' });
  }
});

// Create new service
router.post('/services', verifyAdminToken, async (req, res) => {
  try {
    const { name, description, price, duration, category, icon, features, is_active, sort_order } = req.body;

    if (!name || !category) {
      return res.status(400).json({ success: false, message: 'Name and category are required' });
    }

    // Check if category exists
    const existingCategory = await executeQuery('SELECT id FROM service_categories WHERE name = $1', [category]);
    if (existingCategory.length === 0) {
      return res.status(400).json({ success: false, message: 'Category does not exist' });
    }

    // Check if service with same name already exists
    const existingService = await executeQuery('SELECT id FROM services WHERE name = $1', [name]);
    if (existingService.length > 0) {
      return res.status(400).json({ success: false, message: 'Service with this name already exists' });
    }

    const result = await executeQuery(`
      INSERT INTO services (name, description, price, duration, category_id, icon, features, is_active, sort_order)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id
    `, [name, description || null, price || null, duration || null, existingCategory[0].id, icon || null, features ? JSON.stringify(features) : null, is_active !== undefined ? is_active : 1, sort_order || 0]);

    res.json({
      success: true,
      message: 'Service created successfully',
      data: { id: result[0].id }
    });
  } catch (error) {

    res.status(500).json({ success: false, message: 'Failed to create service' });
  }
});

// Update service
router.put('/services/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, duration, category, icon, features, is_active, sort_order } = req.body;

    if (!name || !category) {
      return res.status(400).json({ success: false, message: 'Name and category are required' });
    }

    // Check if service exists
    const existingService = await executeQuery('SELECT id FROM services WHERE id = $1', [id]);
    if (existingService.length === 0) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    // Check if category exists
    const existingCategory = await executeQuery('SELECT id FROM service_categories WHERE name = $1', [category]);
    if (existingCategory.length === 0) {
      return res.status(400).json({ success: false, message: 'Category does not exist' });
    }

    await executeQuery(`
      UPDATE services 
      SET name = $1, description = $2, price = $3, duration = $4, category_id = $5, icon = $6, features = $7, is_active = $8, sort_order = $9
      WHERE id = $10
    `, [name, description || null, price || null, duration || null, existingCategory[0].id, icon || null, features ? JSON.stringify(features) : null, is_active !== undefined ? is_active : 1, sort_order || 0, id]);

    res.json({
      success: true,
      message: 'Service updated successfully'
    });
  } catch (error) {

    res.status(500).json({ success: false, message: 'Failed to update service' });
  }
});

// Delete service
router.delete('/services/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if service exists
    const existingService = await executeQuery('SELECT name FROM services WHERE id = $1', [id]);
    if (existingService.length === 0) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    await executeQuery('DELETE FROM services WHERE id = $1', [id]);

    res.json({
      success: true,
      message: `Service "${existingService[0].name}" deleted successfully`
    });
  } catch (error) {

    res.status(500).json({ success: false, message: 'Failed to delete service' });
  }
});

// Get all categories
router.get('/categories', verifyAdminToken, async (req, res) => {
  try {
    const categories = await executeQuery('SELECT * FROM service_categories ORDER BY sort_order, name');

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {

    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
});

// Create new category
router.post('/categories', verifyAdminToken, async (req, res) => {
  try {
    const { name, description, icon, color, is_active, sort_order } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    // Check if category with same name already exists
    const existingCategory = await executeQuery('SELECT id FROM service_categories WHERE name = $1', [name]);
    if (existingCategory.length > 0) {
      return res.status(400).json({ success: false, message: 'Category with this name already exists' });
    }

    // Provide default values for undefined parameters
    const categoryData = {
      name: name.trim(),
      description: description || '',
      icon: icon || 'Package',
      color: color || 'Blue',
      is_active: is_active !== undefined ? is_active : 1,
      sort_order: sort_order || 0
    };

    const result = await executeQuery(`
      INSERT INTO service_categories (name, description, icon, color, is_active, sort_order)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
    `, [categoryData.name, categoryData.description, categoryData.icon, categoryData.color, categoryData.is_active, categoryData.sort_order]);

    res.json({
      success: true,
      message: `Category "${categoryData.name}" created successfully`,
      data: { id: result[0].id }
    });
  } catch (error) {

    res.status(500).json({ success: false, message: 'Failed to create category' });
  }
});

// Update category
router.put('/categories/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, icon, color, is_active, sort_order } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    // Check if category exists
    const existingCategory = await executeQuery('SELECT name FROM service_categories WHERE id = $1', [id]);
    if (existingCategory.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Check if new name conflicts with another category
    const nameConflict = await executeQuery('SELECT id FROM service_categories WHERE name = $1 AND id != $2', [name, id]);
    if (nameConflict.length > 0) {
      return res.status(400).json({ success: false, message: 'Category with this name already exists' });
    }

    // Provide default values for undefined parameters
    const categoryData = {
      name: name.trim(),
      description: description || '',
      icon: icon || 'Package',
      color: color || 'Blue',
      is_active: is_active !== undefined ? is_active : 1,
      sort_order: sort_order || 0
    };

    await executeQuery(`
      UPDATE service_categories 
      SET name = $1, description = $2, icon = $3, color = $4, is_active = $5, sort_order = $6
      WHERE id = $7
    `, [categoryData.name, categoryData.description, categoryData.icon, categoryData.color, categoryData.is_active, categoryData.sort_order, id]);

    res.json({
      success: true,
      message: `Category "${existingCategory[0].name}" updated successfully`
    });
  } catch (error) {

    res.status(500).json({ success: false, message: 'Failed to update category' });
  }
});

// Move services from one category to another
router.post('/categories/:id/move-services', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { targetCategoryId } = req.body;

    if (!targetCategoryId) {
      return res.status(400).json({ success: false, message: 'Target category ID is required' });
    }

    // Get source and target category names
    const sourceCategory = await executeQuery('SELECT name FROM service_categories WHERE id = $1', [id]);
    const targetCategory = await executeQuery('SELECT name FROM service_categories WHERE id = $1', [targetCategoryId]);

    if (sourceCategory.length === 0 || targetCategory.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Move all services from source category to target category
    const result = await executeQuery(
      'UPDATE services SET category = $1 WHERE category = $2',
      [targetCategory[0].name, sourceCategory[0].name]
    );

    res.json({
      success: true,
      message: `Moved ${result.length} service(s) from "${sourceCategory[0].name}" to "${targetCategory[0].name}"`
    });
  } catch (error) {

    res.status(500).json({ success: false, message: 'Failed to move services' });
  }
});

// Delete category
router.delete('/categories/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Get category name first
    const categoryResult = await executeQuery('SELECT name FROM service_categories WHERE id = $1', [id]);
    
    if (categoryResult.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const categoryName = categoryResult[0].name;

    // Check if category is used by any services (using category_id instead of category name)
    const services = await executeQuery('SELECT COUNT(*) as count FROM services WHERE category_id = $1', [id]);
    
    if (services[0].count > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot delete "${categoryName}" category because it has ${services[0].count} service(s) associated with it. Please move or delete the services first.`,
        serviceCount: services[0].count
      });
    }

    // Delete the category
    const deleteResult = await executeQuery('DELETE FROM service_categories WHERE id = $1', [id]);

    res.json({
      success: true,
      message: `Category "${categoryName}" deleted successfully`
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete category',
      error: error.message 
    });
  }
});

// Admin Profile
router.get('/profile', verifyAdminToken, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get profile' });
  }
});

// Create new user (admin only)
router.post('/users', verifyAdminToken, async (req, res) => {
  try {
    const { name, email, phone, role, status } = req.body;
    
    console.log('Creating user:', { name, email, role, status });
    
    // Check if user already exists
    const existingUser = await executeQuery(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    
    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }
    
    // Create user with default password
    const defaultPassword = 'password123'; // You should generate a secure default
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(defaultPassword, 12);
    
    const result = await executeQuery(
      `INSERT INTO users (name, email, phone, role, status, password_hash, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP) 
       RETURNING id, name, email, phone, role, status, created_at`,
      [name, email, phone, role, status, hashedPassword]
    );
    
    console.log('User created successfully:', result[0]);
    
    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: result[0]
    });
    
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user'
    });
  }
});

// Get all users (admin only)
router.get('/users', verifyAdminToken, async (req, res) => {
  try {
    const users = await executeQuery(`
      SELECT id, name, email, phone, role, status, created_at 
      FROM users 
      ORDER BY created_at DESC
    `);
    
    res.json({
      success: true,
      data: {
        users,
        total: users.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
});

// Update user (admin only)
router.put('/users/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, role, status } = req.body;
    
    console.log('Updating user:', { id, name, email, role, status });
    
    // Check if user exists
    const existingUser = await executeQuery(
      'SELECT id FROM users WHERE id = $1',
      [id]
    );
    
    if (existingUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update user
    const result = await executeQuery(
      `UPDATE users 
       SET name = $1, email = $2, phone = $3, role = $4, status = $5, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $6 
       RETURNING id, name, email, phone, role, status, created_at`,
      [name, email, phone || '', role, status, id]
    );
    
    console.log('User updated successfully:', result[0]);
    
    res.json({
      success: true,
      message: 'User updated successfully',
      data: result[0]
    });
    
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user'
    });
  }
});

// Delete user (admin only)
router.delete('/users/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log('Deleting user:', id);
    
    // Check if user exists
    const existingUser = await executeQuery(
      'SELECT id, role FROM users WHERE id = $1',
      [id]
    );
    
    if (existingUser.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Prevent deleting admin users
    if (existingUser[0].role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete admin users'
      });
    }
    
    // Delete user
    await executeQuery(
      'DELETE FROM users WHERE id = $1',
      [id]
    );
    
    console.log('User deleted successfully:', id);
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
});

// Get all bookings (admin only) - Excludes soft-deleted bookings
router.get('/bookings', verifyAdminToken, async (req, res) => {
  try {
    // Check if deleted_at column exists, if not use basic query
    let query = `
      SELECT b.*, u.name as user_name, u.email as user_email, s.name as service_name
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN services s ON b.service_id = s.id
    `;
    
    try {
      // Try to use deleted_at column if it exists
      const bookings = await executeQuery(`
        SELECT b.*, u.name as user_name, u.email as user_email, s.name as service_name
        FROM bookings b
        LEFT JOIN users u ON b.user_id = u.id
        LEFT JOIN services s ON b.service_id = s.id
        WHERE b.deleted_at IS NULL
        ORDER BY b.created_at DESC
      `);
      
      res.json({
        success: true,
        data: {
          bookings,
          total: bookings.length
        }
      });
    } catch (error) {
      // Fallback to basic query if deleted_at column doesn't exist
      console.log('🔄 Using fallback query (deleted_at column not found)');
      const bookings = await executeQuery(`
        SELECT b.*, u.name as user_name, u.email as user_email, s.name as service_name
        FROM bookings b
        LEFT JOIN users u ON b.user_id = u.id
        LEFT JOIN services s ON b.service_id = s.id
        ORDER BY b.created_at DESC
      `);
      
      res.json({
        success: true,
        data: {
          bookings,
          total: bookings.length
        }
      });
    }
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
  }
});

// Get archived bookings (admin only) - Shows soft-deleted bookings for audit trail
router.get('/bookings/archived', verifyAdminToken, async (req, res) => {
  try {
    const bookings = await executeQuery(`
      SELECT b.*, u.name as user_name, u.email as user_email, s.name as service_name
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN services s ON b.service_id = s.id
      WHERE b.deleted_at IS NOT NULL
      ORDER BY b.deleted_at DESC
    `);
    
    res.json({
      success: true,
      data: {
        bookings,
        total: bookings.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch archived bookings' });
  }
});

// Restore archived booking (admin only)
router.put('/bookings/:id/restore', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if booking exists and is archived
    const booking = await executeQuery(
      'SELECT id, customer_name, deleted_at FROM bookings WHERE id = $1',
      [id]
    );
    
    if (booking.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (!booking[0].deleted_at) {
      return res.status(400).json({
      success: false,
      message: 'Booking is not archived'
    });
    }
    
    // Restore the booking (remove deleted_at timestamp)
    const result = await executeQuery(
      'UPDATE bookings SET deleted_at = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );
    
    res.json({
      success: true,
      message: 'Booking restored successfully',
      restored_booking: {
        id: booking[0].id,
        customer_name: booking[0].customer_name
      }
    });
  } catch (error) {
    console.error('Restore booking error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to restore booking' 
    });
  }
});

// Get all contact submissions (admin only)
router.get('/contacts', verifyAdminToken, async (req, res) => {
  try {
    const contacts = await executeQuery(`
      SELECT * FROM contact_submissions 
      ORDER BY created_at DESC
    `);
    
    res.json({
      success: true,
      data: {
        contacts,
        total: contacts.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch contacts' });
  }
});

// Update contact submission as read
router.put('/contacts/:id/read', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    await executeQuery(
      'UPDATE contact_submissions SET is_read = true WHERE id = $1',
      [id]
    );
    
    res.json({
      success: true,
      message: 'Contact marked as read'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update contact' });
  }
});

// Mark all contact messages as read (bulk update)
router.put('/contacts/read-all', verifyAdminToken, async (req, res) => {
  try {
    const result = await executeQuery(
      'UPDATE contact_submissions SET is_read = true WHERE is_read = false'
    );
    
    res.json({
      success: true,
      message: `Successfully marked ${result.length} messages as read`,
      updated_count: result.length
    });
  } catch (error) {
    console.error('Mark all contacts read error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to mark all messages as read' 
    });
  }
});

// Delete all read contact messages (bulk delete)
router.delete('/contacts/read', verifyAdminToken, async (req, res) => {
  try {
    const result = await executeQuery(
      'DELETE FROM contact_submissions WHERE is_read = true'
    );
    
    res.json({
      success: true,
      message: `Successfully deleted ${result.length} read contact messages`,
      deleted_count: result.length
    });
  } catch (error) {
    console.error('Delete read contacts error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete read contact messages' 
    });
  }
});

// Delete single contact message
router.delete('/contacts/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await executeQuery(
      'DELETE FROM contact_submissions WHERE id = $1',
      [id]
    );
    
    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Contact message not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Contact message deleted successfully'
    });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete contact message' 
    });
  }
});

// Update booking status
router.put('/bookings/:id/status', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    await executeQuery(
      'UPDATE bookings SET status = $1, notes = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3',
      [status, notes, id]
    );
    
    res.json({
      success: true,
      message: 'Booking status updated'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update booking' });
  }
});

// Mark all pending bookings as in_progress (bulk update)
router.put('/bookings/mark-all-progress', verifyAdminToken, async (req, res) => {
  try {
    const result = await executeQuery(
      'UPDATE bookings SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE status = $2',
      ['in_progress', 'pending']
    );
    
    res.json({
      success: true,
      message: `Successfully marked ${result.length} bookings as in progress`,
      updated_count: result.length
    });
  } catch (error) {
    console.error('Mark all bookings progress error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to mark all bookings as in progress' 
    });
  }
});

// Archive all completed bookings (bulk soft delete)
router.delete('/bookings/completed', verifyAdminToken, async (req, res) => {
  try {
    console.log('Attempting to archive all completed bookings');
    
    // Perform the bulk soft delete
    const result = await executeQuery(
      'UPDATE bookings SET deleted_at = CURRENT_TIMESTAMP WHERE status = $1 AND deleted_at IS NULL',
      ['completed']
    );
    
    console.log(`Archived completed bookings`);
    
    res.json({
      success: true,
      message: `Successfully archived completed bookings`,
      archived_count: result.length || 0
    });
    
  } catch (error) {
    console.error('Archive completed bookings error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to archive completed bookings' 
    });
  }
});

// Archive all cancelled bookings (bulk soft delete)
router.delete('/bookings/cancelled', verifyAdminToken, async (req, res) => {
  try {
    const result = await executeQuery(
      'UPDATE bookings SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE status = $1 AND deleted_at IS NULL',
      ['cancelled']
    );
    
    res.json({
      success: true,
      message: `Successfully archived ${result.length} cancelled bookings (kept for audit trail)`,
      archived_count: result.length
    });
  } catch (error) {
    console.error('Archive cancelled bookings error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to archive cancelled bookings' 
    });
  }
});

// Archive all finished bookings (completed + cancelled) - bulk soft delete
router.delete('/bookings/finished', verifyAdminToken, async (req, res) => {
  try {
    const result = await executeQuery(
      'UPDATE bookings SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE status IN ($1, $2) AND deleted_at IS NULL',
      ['completed', 'cancelled']
    );
    
    res.json({
      success: true,
      message: `Successfully archived ${result.length} finished bookings (kept for audit trail)`,
      archived_count: result.length
    });
  } catch (error) {
    console.error('Archive finished bookings error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to archive finished bookings' 
    });
  }
});

// Soft delete single booking (mark as deleted but keep for audit trail)
router.delete('/bookings/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`Attempting to delete booking ID: ${id}`);
    
    // First check if booking exists
    const existingBooking = await executeQuery(
      'SELECT id, customer_name, status FROM bookings WHERE id = $1',
      [id]
    );
    
    console.log('Existing booking check:', existingBooking);
    
    if (existingBooking.length === 0) {
      console.log(`Booking ${id} not found in database`);
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Try to add deleted_at column if it doesn't exist, then soft delete
    try {
      // First try to add the column if it doesn't exist
      await executeQuery(`
        ALTER TABLE bookings 
        ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP DEFAULT NULL
      `);
      console.log('deleted_at column ensured');
      
      // Now try soft delete
      const result = await executeQuery(
        'UPDATE bookings SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND deleted_at IS NULL RETURNING id',
        [id]
      );
      console.log('Soft delete result:', result);
      
      if (!result || result.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found or already deleted'
        });
      }
      
      console.log(`Booking ${id} soft deleted successfully`);
      
      res.json({
        success: true,
        message: 'Booking archived successfully'
      });
      
    } catch (error) {
      console.log('Soft delete failed, trying hard delete:', error.message);
      // Fallback to hard delete
      const result = await executeQuery(
        'DELETE FROM bookings WHERE id = $1 RETURNING id',
        [id]
      );
      console.log('Hard delete result:', result);
      
      if (!result || result.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found or already deleted'
        });
      }
      
      console.log(`Booking ${id} hard deleted successfully`);
      
      res.json({
        success: true,
        message: 'Booking deleted successfully'
      });
    }
    
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete booking. Please try again.' 
    });
  }
});

// ========================================
// DATABASE MANAGEMENT
// ========================================

// Get current database status
router.get('/database/status', verifyAdminToken, async (req, res) => {
  try {
    const currentProvider = process.env.DB_PROVIDER || 'aws';
    const dbHost = process.env.DB_HOST || 'Unknown';
    
    // Get dual database status
    const { getDualDatabaseStatus } = require('../database/dual-connection');
    const dualStatus = await getDualDatabaseStatus();
    
    res.json({
      success: true,
      data: {
        currentProvider,
        host: dbHost,
        isAWS: currentProvider === 'aws',
        isAzure: currentProvider === 'azure',
        status: 'connected',
        dualDatabase: {
          aws: dualStatus.aws,
          azure: dualStatus.azure
        }
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get database status' 
    });
  }
});

// Switch database provider
router.post('/database/switch', verifyAdminToken, async (req, res) => {
  try {
    const { provider } = req.body;
    
    if (!['aws', 'azure'].includes(provider)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid provider. Use "aws" or "azure"'
      });
    }

    // Update environment variable (this will require app restart)
    process.env.DB_PROVIDER = provider;
    
    // Update active database connection
    if (provider === 'azure') {
      process.env.DB_HOST = process.env.DB_HOST_AZURE;
      process.env.DB_USER = process.env.DB_USER_AZURE;
      process.env.DB_PASSWORD = process.env.DB_PASSWORD_AZURE;
      process.env.DB_NAME = process.env.DB_NAME_AZURE;
    } else {
      process.env.DB_HOST = process.env.DB_HOST_AWS;
      process.env.DB_USER = process.env.DB_USER_AWS;
      process.env.DB_PASSWORD = process.env.DB_PASSWORD_AWS;
      process.env.DB_NAME = process.env.DB_NAME_AWS;
    }

    res.json({
      success: true,
      message: `Database switched to ${provider.toUpperCase()}. Please restart the application.`,
      data: {
        provider,
        host: process.env.DB_HOST,
        requiresRestart: true
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to switch database' 
    });
  }
});

// Test database connection
router.post('/database/test', verifyAdminToken, async (req, res) => {
  try {
    const { provider } = req.body;
    
    if (!['aws', 'azure'].includes(provider)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid provider. Use "aws" or "azure"'
      });
    }

    // Test connection to specified provider
    let testConfig;
    if (provider === 'azure') {
      testConfig = {
        host: process.env.DB_HOST_AZURE,
        port: process.env.DB_PORT_AZURE || 5432,
        user: process.env.DB_USER_AZURE,
        password: process.env.DB_PASSWORD_AZURE,
        database: process.env.DB_NAME_AZURE,
        ssl: { rejectUnauthorized: false }
      };
    } else {
      testConfig = {
        host: process.env.DB_HOST_AWS,
        port: process.env.DB_PORT_AWS || 5432,
        user: process.env.DB_USER_AWS,
        password: process.env.DB_PASSWORD_AWS,
        database: process.env.DB_NAME_AWS,
        ssl: { rejectUnauthorized: false }
      };
    }

    // Test connection
    const { Pool } = require('pg');
    const testPool = new Pool(testConfig);
    
    try {
      const client = await testPool.connect();
      const result = await client.query('SELECT NOW() as current_time');
      client.release();
      await testPool.end();
      
      res.json({
        success: true,
        message: `${provider.toUpperCase()} database connection successful`,
        data: {
          provider,
          host: testConfig.host,
          currentTime: result.rows[0].current_time
        }
      });
    } catch (connError) {
      await testPool.end();
      throw connError;
    }
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: `Failed to connect to ${req.body.provider} database: ${error.message}` 
    });
  }
});

// Get comprehensive analytics data
router.get('/analytics', verifyAdminToken, async (req, res) => {
  try {
    // Return basic analytics data without complex queries
    res.json({
      success: true,
      data: {
        overview: {
          totalRevenue: 0,
          totalCustomers: 2,
          totalBookings: 0,
          completedBookings: 0,
          conversionRate: 0
        },
        popularServices: [],
        monthlyRevenue: [],
        customerGrowth: [],
        serviceCategories: [
          { name: 'Software', value: 6, color: '#3F708B' },
          { name: 'Hardware Solutions', value: 1, color: '#294157' },
          { name: 'Web Services', value: 2, color: '#C0D8EE' }
        ],
        bookingStatuses: [],
        recentActivity: [],
        topCustomers: []
      }
    });

  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics data'
    });
  }
});

// Update client user password (admin only)
router.post('/update-client-password', verifyAdminToken, async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    
    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email and new password are required'
      });
    }
    
    // Hash the new password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // Update the user's password
    const result = await executeQuery(`
      UPDATE users 
      SET password_hash = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE email = $2 AND role = 'client'
      RETURNING id, name, email, role, status
    `, [hashedPassword, email]);
    
    if (result.length > 0) {
      res.json({
        success: true,
        message: 'Client password updated successfully',
        data: result[0]
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Client user not found'
      });
    }
    
  } catch (error) {
    console.error('Update client password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update client password'
    });
  }
});

module.exports = router;
