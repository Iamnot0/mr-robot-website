/**
 * CRM Routes - Customer Relationship Management
 */

const express = require('express');
const router = express.Router();
const { executeQuery } = require('../database/connection');
const { body, validationResult } = require('express-validator');

// Get customer communications
router.get('/customers/:id/communications', async (req, res) => {
  try {
    const { id } = req.params;
    const communications = await executeQuery(`
      SELECT cc.*, u.name as created_by_name
      FROM customer_communications cc
      LEFT JOIN users u ON cc.created_by = u.id
      WHERE cc.customer_id = $1
      ORDER BY cc.created_at DESC
    `, [id]);
    
    res.json({
      success: true,
      data: communications
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch communications' });
  }
});


// Add customer communication
router.post('/customers/:id/communications', [
  body('communication_type').isIn(['email', 'phone', 'meeting', 'note']),
  body('subject').trim().isLength({ min: 1, max: 255 }),
  body('content').trim().isLength({ min: 1 }),
  body('direction').isIn(['inbound', 'outbound'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { id } = req.params;
    const { communication_type, subject, content, direction } = req.body;
    
    const result = await executeQuery(`
      INSERT INTO customer_communications (customer_id, communication_type, subject, content, direction, created_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [id, communication_type, subject, content, direction, 1]);
    
    res.json({
      success: true,
      data: result[0],
      message: 'Communication added successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add communication' });
  }
});

// Get customer booking history (Shows ALL bookings including soft-deleted for complete audit trail)
router.get('/customers/:id/history', async (req, res) => {
  try {
    const { id } = req.params;
    const history = await executeQuery(`
      SELECT b.*, s.name as service_name, s.price as service_price,
             CASE 
               WHEN b.deleted_at IS NOT NULL THEN 'archived'
               ELSE b.status 
             END as display_status,
             b.deleted_at
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      WHERE b.user_id = $1 OR b.customer_email = (SELECT email FROM users WHERE id = $1)
      ORDER BY b.created_at DESC
    `, [id]);
    
    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch booking history' });
  }
});

// Get customer segments
router.get('/segments', async (req, res) => {
  try {
    const segments = await executeQuery(`
      SELECT cs.*, COUNT(csa.customer_id) as customer_count
      FROM customer_segments cs
      LEFT JOIN customer_segment_assignments csa ON cs.id = csa.segment_id
      WHERE cs.is_active = true
      GROUP BY cs.id
      ORDER BY cs.name
    `);
    
    res.json({
      success: true,
      data: segments
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch segments' });
  }
});

// Get customer 360 view
router.get('/customers/:id/overview', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get customer info
    const customer = await executeQuery('SELECT * FROM users WHERE id = $1', [id]);
    
    // Get communications count
    const communications = await executeQuery(`
      SELECT COUNT(*) as count FROM customer_communications WHERE customer_id = $1
    `, [id]);
    
    // Get booking history count (includes all bookings for complete audit trail)
    const bookingHistory = await executeQuery(`
      SELECT COUNT(*) as count FROM bookings 
      WHERE user_id = $1 OR customer_email = (SELECT email FROM users WHERE id = $1)
    `, [id]);
    
    // Get active bookings count (excludes soft-deleted)
    const activeBookings = await executeQuery(`
      SELECT COUNT(*) as count FROM bookings 
      WHERE user_id = $1 AND deleted_at IS NULL
    `, [id]);
    
    // Get archived bookings count (soft-deleted)
    const archivedBookings = await executeQuery(`
      SELECT COUNT(*) as count FROM bookings 
      WHERE user_id = $1 AND deleted_at IS NOT NULL
    `, [id]);
    
    res.json({
      success: true,
      data: {
        customer: customer[0],
        stats: {
          communications: parseInt(communications[0].count),
          serviceHistory: parseInt(bookingHistory[0].count),
          activeBookings: parseInt(activeBookings[0].count),
          archivedBookings: parseInt(archivedBookings[0].count)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch customer overview' });
  }
});

module.exports = router;
