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
  body('username').trim().isLength({ min: 3, max: 50 }).withMessage('Username must be between 3 and 50 characters'),
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
    const services = await executeQuery(`
      SELECT s.*, sc.name as category_name 
      FROM services s 
      LEFT JOIN service_categories sc ON s.category = sc.name 
      ORDER BY s.sort_order, s.name
    `);

    res.json({
      success: true,
      data: services
    });
  } catch (error) {

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
    const existingCategory = await executeQuery('SELECT id FROM service_categories WHERE name = ?', [category]);
    if (existingCategory.length === 0) {
      return res.status(400).json({ success: false, message: 'Category does not exist' });
    }

    // Check if service with same name already exists
    const existingService = await executeQuery('SELECT id FROM services WHERE name = ?', [name]);
    if (existingService.length > 0) {
      return res.status(400).json({ success: false, message: 'Service with this name already exists' });
    }

    const result = await executeQuery(`
      INSERT INTO services (name, description, price, duration, category, icon, features, is_active, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [name, description || null, price || null, duration || null, category, icon || null, features ? JSON.stringify(features) : null, is_active !== undefined ? is_active : 1, sort_order || 0]);

    res.json({
      success: true,
      message: 'Service created successfully',
      data: { id: result.insertId }
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
    const existingService = await executeQuery('SELECT id FROM services WHERE id = ?', [id]);
    if (existingService.length === 0) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    // Check if category exists
    const existingCategory = await executeQuery('SELECT id FROM service_categories WHERE name = ?', [category]);
    if (existingCategory.length === 0) {
      return res.status(400).json({ success: false, message: 'Category does not exist' });
    }

    await executeQuery(`
      UPDATE services 
      SET name = ?, description = ?, price = ?, duration = ?, category = ?, icon = ?, features = ?, is_active = ?, sort_order = ?
      WHERE id = ?
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
    const existingService = await executeQuery('SELECT name FROM services WHERE id = ?', [id]);
    if (existingService.length === 0) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    await executeQuery('DELETE FROM services WHERE id = ?', [id]);

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
    const existingCategory = await executeQuery('SELECT id FROM service_categories WHERE name = ?', [name]);
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
      VALUES (?, ?, ?, ?, ?, ?)
    `, [categoryData.name, categoryData.description, categoryData.icon, categoryData.color, categoryData.is_active, categoryData.sort_order]);

    res.json({
      success: true,
      message: `Category "${categoryData.name}" created successfully`,
      data: { id: result.insertId }
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
    const existingCategory = await executeQuery('SELECT name FROM service_categories WHERE id = ?', [id]);
    if (existingCategory.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Check if new name conflicts with another category
    const nameConflict = await executeQuery('SELECT id FROM service_categories WHERE name = ? AND id != ?', [name, id]);
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
      SET name = ?, description = ?, icon = ?, color = ?, is_active = ?, sort_order = ?
      WHERE id = ?
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
    const sourceCategory = await executeQuery('SELECT name FROM service_categories WHERE id = ?', [id]);
    const targetCategory = await executeQuery('SELECT name FROM service_categories WHERE id = ?', [targetCategoryId]);

    if (sourceCategory.length === 0 || targetCategory.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    // Move all services from source category to target category
    const result = await executeQuery(
      'UPDATE services SET category = ? WHERE category = ?',
      [targetCategory[0].name, sourceCategory[0].name]
    );

    res.json({
      success: true,
      message: `Moved ${result.affectedRows} service(s) from "${sourceCategory[0].name}" to "${targetCategory[0].name}"`
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
    const categoryResult = await executeQuery('SELECT name FROM service_categories WHERE id = ?', [id]);
    
    if (categoryResult.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const categoryName = categoryResult[0].name;

    // Check if category is used by any services
    const services = await executeQuery('SELECT COUNT(*) as count FROM services WHERE category = ?', [categoryName]);
    
    if (services[0].count > 0) {
      return res.status(400).json({ 
        success: false, 
        message: `Cannot delete "${categoryName}" category because it has ${services[0].count} service(s) associated with it. Please move or delete the services first.`,
        serviceCount: services[0].count
      });
    }

    await executeQuery('DELETE FROM service_categories WHERE id = ?', [id]);

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
      'UPDATE contact_submissions SET is_read = true WHERE id = ?',
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
      message: `Successfully deleted ${result.affectedRows} read contact messages`,
      deleted_count: result.affectedRows
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
      'DELETE FROM contact_submissions WHERE id = ?',
      [id]
    );
    
    if (result.affectedRows === 0) {
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
      'UPDATE bookings SET status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
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
      'DELETE FROM bookings WHERE status = ?',
      ['completed']
    );
    
    res.json({
      success: true,
      message: `Successfully deleted ${result.affectedRows} completed bookings`,
      deleted_count: result.affectedRows
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
      'DELETE FROM bookings WHERE status = ?',
      ['cancelled']
    );
    
    res.json({
      success: true,
      message: `Successfully deleted ${result.affectedRows} cancelled bookings`,
      deleted_count: result.affectedRows
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
      'DELETE FROM bookings WHERE status IN (?, ?)',
      ['completed', 'cancelled']
    );
    
    res.json({
      success: true,
      message: `Successfully deleted ${result.affectedRows} finished bookings`,
      deleted_count: result.affectedRows
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
      'SELECT id, customer_name, customer_email, status FROM bookings WHERE id = ?',
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
      'DELETE FROM bookings WHERE id = ?',
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
    // Get total revenue from completed bookings
    const revenueResult = await executeQuery(
      'SELECT SUM(actual_cost) as total_revenue, COUNT(*) as completed_bookings FROM bookings WHERE status = "completed" AND actual_cost IS NOT NULL'
    );
    const totalRevenue = revenueResult[0].total_revenue || 0;
    const completedBookings = revenueResult[0].completed_bookings || 0;

    // Get total customers (unique users who made bookings)
    const customersResult = await executeQuery(
      'SELECT COUNT(DISTINCT customer_email) as total_customers FROM bookings'
    );
    const totalCustomers = customersResult[0].total_customers || 0;

    // Get total bookings
    const bookingsResult = await executeQuery(
      'SELECT COUNT(*) as total_bookings FROM bookings'
    );
    const totalBookings = bookingsResult[0].total_bookings || 0;

    // Calculate conversion rate (completed / total bookings)
    const conversionRate = totalBookings > 0 ? ((completedBookings / totalBookings) * 100).toFixed(1) : 0;

    // Get popular services with booking counts and revenue
    const popularServices = await executeQuery(`
      SELECT 
        s.name,
        COUNT(b.id) as bookings,
        COALESCE(SUM(b.actual_cost), 0) as revenue
      FROM services s
      LEFT JOIN bookings b ON s.id = b.service_id
      GROUP BY s.id, s.name
      ORDER BY bookings DESC, revenue DESC
      LIMIT 10
    `);

    // Get monthly revenue trend (last 12 months)
    const monthlyRevenue = await executeQuery(`
      SELECT 
        DATE_FORMAT(created_at, '%b %Y') as month,
        DATE_FORMAT(created_at, '%Y-%m') as sort_date,
        COALESCE(SUM(actual_cost), 0) as revenue,
        COUNT(*) as bookings
      FROM bookings 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
        AND status = 'completed'
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY sort_date ASC
    `);

    // Get customer growth (new customers per month)
    const customerGrowth = await executeQuery(`
      SELECT 
        DATE_FORMAT(created_at, '%b %Y') as month,
        DATE_FORMAT(created_at, '%Y-%m') as sort_date,
        COUNT(DISTINCT customer_email) as customers
      FROM bookings 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 12 MONTH)
      GROUP BY DATE_FORMAT(created_at, '%Y-%m')
      ORDER BY sort_date ASC
    `);

    // Get service categories distribution
    const serviceCategories = await executeQuery(`
      SELECT 
        s.category as name,
        COUNT(b.id) as value
      FROM services s
      LEFT JOIN bookings b ON s.id = b.service_id
      WHERE s.category IS NOT NULL AND s.category != ''
      GROUP BY s.category
      ORDER BY value DESC
    `);

    // Get booking status distribution
    const bookingStatuses = await executeQuery(`
      SELECT 
        status,
        COUNT(*) as count
      FROM bookings 
      GROUP BY status
      ORDER BY count DESC
    `);

    // Get recent activity (last 30 days)
    const recentActivity = await executeQuery(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as bookings,
        COUNT(DISTINCT customer_email) as unique_customers
      FROM bookings 
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `);

    // Get top customers by booking count
    const topCustomers = await executeQuery(`
      SELECT 
        customer_name,
        customer_email,
        COUNT(*) as booking_count,
        COALESCE(SUM(actual_cost), 0) as total_spent
      FROM bookings
      GROUP BY customer_email, customer_name
      ORDER BY booking_count DESC, total_spent DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      data: {
        overview: {
          totalRevenue: parseFloat(totalRevenue) || 0,
          totalCustomers: parseInt(totalCustomers) || 0,
          totalBookings: parseInt(totalBookings) || 0,
          completedBookings: parseInt(completedBookings) || 0,
          conversionRate: parseFloat(conversionRate) || 0
        },
        popularServices: popularServices.map(service => ({
          name: service.name,
          bookings: parseInt(service.bookings) || 0,
          revenue: parseFloat(service.revenue) || 0
        })),
        monthlyRevenue: monthlyRevenue.map(month => ({
          month: month.month,
          revenue: parseFloat(month.revenue) || 0,
          bookings: parseInt(month.bookings) || 0
        })),
        customerGrowth: customerGrowth.map(month => ({
          month: month.month,
          customers: parseInt(month.customers) || 0
        })),
        serviceCategories: serviceCategories.map((category, index) => ({
          name: category.name,
          value: parseInt(category.value) || 0,
          color: ['#3F708B', '#294157', '#C0D8EE', '#5A8BA8', '#2B5A72'][index % 5]
        })),
        bookingStatuses: bookingStatuses.map(status => ({
          status: status.status,
          count: parseInt(status.count) || 0
        })),
        recentActivity,
        topCustomers: topCustomers.map(customer => ({
          name: customer.customer_name,
          email: customer.customer_email,
          bookings: parseInt(customer.booking_count) || 0,
          totalSpent: parseFloat(customer.total_spent) || 0
        }))
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

module.exports = router;
