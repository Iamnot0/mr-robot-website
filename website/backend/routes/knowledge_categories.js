const express = require('express');
const router = express.Router();
const { executeQuery } = require('../database/connection');
const { requireAdmin } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Get all knowledge categories
router.get('/', async (req, res) => {
  try {
    const categories = await executeQuery(`
      SELECT id, name, description, icon, color, is_active, sort_order, created_at, updated_at
      FROM knowledge_categories 
      WHERE is_active = true
      ORDER BY sort_order ASC, name ASC
    `);
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get knowledge categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch knowledge categories'
    });
  }
});

// Get single knowledge category
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const categories = await executeQuery(`
      SELECT id, name, description, icon, color, is_active, sort_order, created_at, updated_at
      FROM knowledge_categories 
      WHERE id = $1
    `, [id]);
    
    if (categories.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Knowledge category not found'
      });
    }
    
    res.json({
      success: true,
      data: categories[0]
    });
  } catch (error) {
    console.error('Get knowledge category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch knowledge category'
    });
  }
});

// Create knowledge category (Admin only)
router.post('/', requireAdmin, [
  body('name').trim().isLength({ min: 1 }).withMessage('Name is required'),
  body('description').optional().trim(),
  body('icon').optional().trim(),
  body('color').optional().trim(),
  body('is_active').optional().isBoolean().withMessage('is_active must be a boolean'),
  body('sort_order').optional().isInt().withMessage('sort_order must be an integer')
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
    
    const { name, description, icon, color, is_active, sort_order } = req.body;
    
    const result = await executeQuery(`
      INSERT INTO knowledge_categories (name, description, icon, color, is_active, sort_order)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, name, description, icon, color, is_active, sort_order, created_at, updated_at
    `, [
      name,
      description || `${name} Note`,
      icon || 'BookOpen',
      color || 'Blue',
      is_active !== undefined ? is_active : true,
      sort_order || 0
    ]);
    
    res.status(201).json({
      success: true,
      message: 'Knowledge category created successfully',
      data: result[0]
    });
  } catch (error) {
    console.error('Create knowledge category error:', error);
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({
        success: false,
        message: 'Knowledge category with this name already exists'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to create knowledge category'
      });
    }
  }
});

// Update knowledge category (Admin only)
router.put('/:id', requireAdmin, [
  body('name').optional().trim().isLength({ min: 1 }).withMessage('Name cannot be empty'),
  body('description').optional().trim(),
  body('icon').optional().trim(),
  body('color').optional().trim(),
  body('is_active').optional().isBoolean().withMessage('is_active must be a boolean'),
  body('sort_order').optional().isInt().withMessage('sort_order must be an integer')
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
    const { name, description, icon, color, is_active, sort_order } = req.body;
    
    // Check if category exists
    const existing = await executeQuery('SELECT id FROM knowledge_categories WHERE id = $1', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Knowledge category not found'
      });
    }
    
    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramCount = 1;
    
    if (name !== undefined) {
      updates.push(`name = $${paramCount++}`);
      values.push(name);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount++}`);
      values.push(description);
    }
    if (icon !== undefined) {
      updates.push(`icon = $${paramCount++}`);
      values.push(icon);
    }
    if (color !== undefined) {
      updates.push(`color = $${paramCount++}`);
      values.push(color);
    }
    if (is_active !== undefined) {
      updates.push(`is_active = $${paramCount++}`);
      values.push(is_active);
    }
    if (sort_order !== undefined) {
      updates.push(`sort_order = $${paramCount++}`);
      values.push(sort_order);
    }
    
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);
    
    const result = await executeQuery(`
      UPDATE knowledge_categories 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, name, description, icon, color, is_active, sort_order, created_at, updated_at
    `, values);
    
    res.json({
      success: true,
      message: 'Knowledge category updated successfully',
      data: result[0]
    });
  } catch (error) {
    console.error('Update knowledge category error:', error);
    if (error.code === '23505') { // Unique constraint violation
      res.status(400).json({
        success: false,
        message: 'Knowledge category with this name already exists'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to update knowledge category'
      });
    }
  }
});

// Delete knowledge category (Admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if category exists
    const existing = await executeQuery('SELECT id FROM knowledge_categories WHERE id = $1', [id]);
    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Knowledge category not found'
      });
    }
    
    // Check if any articles are using this category
    const articlesUsingCategory = await executeQuery(
      'SELECT COUNT(*) as count FROM articles WHERE category = (SELECT name FROM knowledge_categories WHERE id = $1)',
      [id]
    );
    
    if (articlesUsingCategory[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category because ${articlesUsingCategory[0].count} article(s) are using it. Please change the category of those articles first.`
      });
    }
    
    await executeQuery('DELETE FROM knowledge_categories WHERE id = $1', [id]);
    
    res.json({
      success: true,
      message: 'Knowledge category deleted successfully'
    });
  } catch (error) {
    console.error('Delete knowledge category error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete knowledge category'
    });
  }
});

module.exports = router;
