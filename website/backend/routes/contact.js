/**
 * Contact Routes - Professional Contact Management
 */

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { executeQuery } = require('../database/connection');

// ========================================
// SUBMIT CONTACT FORM
// ========================================
router.post('/submit', [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('message').trim().isLength({ min: 10 }).withMessage('Message must be at least 10 characters'),
  body('phone').optional().isMobilePhone(),
  body('service').optional().isString(),
  body('urgency').optional().isIn(['low', 'normal', 'high', 'emergency'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
        message: 'Validation failed'
      });
    }

    const { name, email, phone, service, message, urgency = 'normal' } = req.body;

    // Create new submission in database
    const result = await executeQuery(
      'INSERT INTO contact_submissions (name, email, phone, subject, message, is_read) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, phone || null, service || null, message, false]
    );

    res.status(201).json({
      success: true,
      data: { id: result.insertId },
      message: 'Contact form submitted successfully. We will respond within 2-4 hours.'
    });

  } catch (error) {
    console.error('Contact submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit contact form. Please try again.'
    });
  }
});

// ========================================
// GET CONTACT SUBMISSIONS (Admin)
// ========================================
router.get('/submissions', async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;
    
    let whereClause = '';
    let queryParams = [];
    
    if (status) {
      whereClause = 'WHERE status = ?';
      queryParams.push(status);
    }
    
    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM contact_submissions ${whereClause}`;
    const countResult = await executeQuery(countQuery, queryParams);
    const total = countResult[0].total;
    
    // Get submissions
    const submissionsQuery = `
      SELECT * FROM contact_submissions 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    const submissions = await executeQuery(submissionsQuery, [...queryParams, parseInt(limit), parseInt(offset)]);
    
    res.json({
      success: true,
      data: {
        submissions,
        total,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get contact submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact submissions'
    });
  }
});

// ========================================
// UPDATE CONTACT SUBMISSION STATUS
// ========================================
router.patch('/submissions/:id', [
  body('status').isIn(['new', 'contacted', 'resolved']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
        message: 'Validation failed'
      });
    }

    const { id } = req.params;
    const { status } = req.body;

    const [result] = await pool.execute(`
      UPDATE contact_submissions 
      SET status = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, [status, id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found'
      });
    }

    res.json({
      success: true,
      message: 'Contact submission status updated successfully'
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Failed to update contact submission'
    });
  }
});

// ========================================
// GET CONTACT STATISTICS
// ========================================
router.get('/stats', async (req, res) => {
  try {
    const [stats] = await pool.execute(`
      SELECT 
        COUNT(*) as total_submissions,
        COUNT(CASE WHEN status = 'new' THEN 1 END) as new_submissions,
        COUNT(CASE WHEN status = 'contacted' THEN 1 END) as contacted_submissions,
        COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_submissions,
        COUNT(CASE WHEN urgency = 'emergency' THEN 1 END) as emergency_submissions,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR) THEN 1 END) as today_submissions,
        COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 END) as week_submissions
      FROM contact_submissions
    `);

    const [urgencyStats] = await pool.execute(`
      SELECT urgency, COUNT(*) as count
      FROM contact_submissions 
      GROUP BY urgency
    `);

    res.json({
      success: true,
      data: {
        overview: stats[0],
        urgency_breakdown: urgencyStats
      },
      message: 'Contact statistics retrieved successfully'
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve contact statistics'
    });
  }
});

module.exports = router;
