/**
 * Admin Routes - Professional Dashboard Management
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs').promises;
const path = require('path');
const { executeQuery } = require('../database/connection');
const { body, validationResult } = require('express-validator');

// File path for storing articles
const ARTICLES_FILE = path.join(__dirname, '../data/articles.json');

// Middleware to verify admin token
const verifyAdminToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const users = await executeQuery('SELECT * FROM users WHERE id = $1 AND role = $2 AND status = $3', [decoded.id, 'admin', 'active']);
    
    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    req.user = users[0];
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
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

    // Get total articles count
    const articlesResult = await executeQuery('SELECT COUNT(*) as total FROM articles WHERE is_published = true');
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

    // Get recent articles (last 5)
    const recentArticles = await executeQuery(`
      SELECT id, title, description, category, created_at
      FROM articles 
      WHERE is_published = true
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
    // Get articles from database
    const articles = await executeQuery(`
      SELECT id, title, description, content, slug, thumbnail_url, 
             external_link, category, source, is_published, 
             published_at, created_at, updated_at
      FROM articles 
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

// Create new article
router.post('/articles', verifyAdminToken, [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required and must be less than 200 characters'),
  body('description').trim().isLength({ min: 1, max: 1000 }).withMessage('Description is required and must be less than 1000 characters'),
  body('content').optional().trim().isLength({ min: 1 }).withMessage('Content must be at least 1 character if provided'),
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

    const { title, description, content, category } = req.body;
    
    // Create slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Insert article into database
    const result = await executeQuery(`
      INSERT INTO articles (title, description, content, slug, category, source, is_published, published_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [title, description, content || '', slug, category || 'General', 'admin', true, new Date()]);

    res.json({
      success: true,
      message: 'Article created successfully',
      data: { id: result.insertId, slug }
    });
  } catch (error) {
    console.error('Error creating article:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create article' 
    });
  }
});

// Update article
router.put('/articles/:id', verifyAdminToken, [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required and must be less than 200 characters'),
  body('description').trim().isLength({ min: 1, max: 1000 }).withMessage('Description is required and must be less than 1000 characters'),
  body('content').optional().trim().isLength({ min: 1 }).withMessage('Content must be at least 1 character if provided'),
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
    const { title, description, content, category } = req.body;
    
    // Create slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    // Check if article exists
    const articles = await executeQuery('SELECT id FROM articles WHERE id = ?', [id]);
    if (articles.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Article not found' 
      });
    }

    // Update article in database
    await executeQuery(`
      UPDATE articles 
      SET title = ?, description = ?, content = ?, slug = ?, category = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [title, description, content || '', slug, category || 'General', id]);

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

// Delete article
router.delete('/articles/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if article exists
    const articles = await executeQuery('SELECT id FROM articles WHERE id = ?', [id]);
    if (articles.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Article not found' 
      });
    }

    // Delete article from database
    await executeQuery('DELETE FROM articles WHERE id = ?', [id]);

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
      console.log('Services query with join failed, trying simple query:', error.message);
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
      INSERT INTO services (name, description, price, duration, category, icon, features, is_active, sort_order)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id
    `, [name, description || null, price || null, duration || null, category, icon || null, features ? JSON.stringify(features) : null, is_active !== undefined ? is_active : 1, sort_order || 0]);

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
      SET name = $1, description = $2, price = $3, duration = $4, category = $5, icon = $6, features = $7, is_active = $8, sort_order = $9
      WHERE id = $10
    `, [name, description || null, price || null, duration || null, category, icon || null, features ? JSON.stringify(features) : null, is_active !== undefined ? is_active : 1, sort_order || 0, id]);

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

    // Check if category is used by any services
    const services = await executeQuery('SELECT COUNT(*) as count FROM services WHERE category = $1', [categoryName]);
    
    if (services[0].count > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot delete "${categoryName}" category because it has ${services[0].count} service(s) associated with it. Please move or delete the services first.`,
        serviceCount: services[0].count
      });
    }

    await executeQuery('DELETE FROM service_categories WHERE id = $1', [id]);

    res.json({
      success: true,
      message: `Category "${categoryName}" deleted successfully`
    });
  } catch (error) {

    res.status(500).json({ success: false, message: 'Failed to delete category' });
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

// Get all bookings (admin only)
router.get('/bookings', verifyAdminToken, async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
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

// Delete all completed bookings (bulk delete)
router.delete('/bookings/completed', verifyAdminToken, async (req, res) => {
  try {
    const result = await executeQuery(
      'DELETE FROM bookings WHERE status = $1',
      ['completed']
    );
    
    res.json({
      success: true,
      message: `Successfully deleted ${result.length} completed bookings`,
      deleted_count: result.length
    });
  } catch (error) {
    console.error('Delete completed bookings error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete completed bookings' 
    });
  }
});

// Delete all cancelled bookings (bulk delete)
router.delete('/bookings/cancelled', verifyAdminToken, async (req, res) => {
  try {
    const result = await executeQuery(
      'DELETE FROM bookings WHERE status = $1',
      ['cancelled']
    );
    
    res.json({
      success: true,
      message: `Successfully deleted ${result.length} cancelled bookings`,
      deleted_count: result.length
    });
  } catch (error) {
    console.error('Delete cancelled bookings error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete cancelled bookings' 
    });
  }
});

// Delete all finished bookings (completed + cancelled)
router.delete('/bookings/finished', verifyAdminToken, async (req, res) => {
  try {
    const result = await executeQuery(
      'DELETE FROM bookings WHERE status IN ($1, $2)',
      ['completed', 'cancelled']
    );
    
    res.json({
      success: true,
      message: `Successfully deleted ${result.length} finished bookings`,
      deleted_count: result.length
    });
  } catch (error) {
    console.error('Delete finished bookings error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete finished bookings' 
    });
  }
});

// Delete single booking
router.delete('/bookings/:id', verifyAdminToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // First check if booking exists and get user info for logging
    const booking = await executeQuery(
      'SELECT id, customer_name, customer_email, status FROM bookings WHERE id = $1',
      [id]
    );
    
    if (booking.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }
    
    // Delete the booking (will cascade to client profile due to ON DELETE CASCADE)
    const result = await executeQuery(
      'DELETE FROM bookings WHERE id = $1',
      [id]
    );
    
    res.json({
      success: true,
      message: 'Booking deleted successfully',
      deleted_booking: {
        id: booking[0].id,
        customer_name: booking[0].customer_name,
        status: booking[0].status
      }
    });
  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete booking' 
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
