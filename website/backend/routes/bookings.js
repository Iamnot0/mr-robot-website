/**
 * Bookings Routes - Professional Service Booking System
 */

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { executeQuery } = require('../database/connection');

// ========================================
// CREATE NEW BOOKING (Works for both logged-in and non-logged-in users)
// ========================================
router.post('/', [
  body('customer_name').trim().isLength({ min: 2 }).withMessage('Customer name is required'),
  body('customer_email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('customer_phone').optional().isLength({ min: 8, max: 15 }).withMessage('Phone number must be 8-15 characters'),
  body('service_id').isInt({ min: 1 }).withMessage('Valid service ID is required'),
  body('device_type').optional().trim(),
  body('issue_description').trim().isLength({ min: 10 }).withMessage('Issue description must be at least 10 characters'),
  body('urgency').optional().isIn(['low', 'normal', 'high', 'urgent']),
  body('preferred_date').optional().isISO8601(),
  body('user_id').optional().custom((value) => {
    if (value === null || value === undefined || value === '') {
      return true; // Allow null/empty for guest bookings
    }
    if (!Number.isInteger(Number(value)) || Number(value) < 1) {
      throw new Error('User ID must be a valid integer');
    }
    return true;
  })
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

    const {
      customer_name,
      customer_email,
      customer_phone,
      service_id,
      device_type,
      issue_description,
      urgency = 'normal',
      preferred_date,
      notes,
      user_id
    } = req.body;
    
    // Create new booking in database
    const result = await executeQuery(
      `INSERT INTO bookings (
        user_id, customer_name, customer_email, customer_phone, service_id, 
        device_type, issue_description, urgency, preferred_date, notes, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [
        user_id || null, customer_name, customer_email, customer_phone || null, parseInt(service_id),
        device_type || null, issue_description, urgency, preferred_date || null, 
        notes || null, 'pending'
      ]
    );

    // Get service name and price for the receipt
    const serviceResult = await executeQuery(
      'SELECT name, price FROM services WHERE id = $1',
      [parseInt(service_id)]
    );

    const booking = result[0];
    if (serviceResult.length > 0) {
      booking.service_name = serviceResult[0].name;
      booking.service_price = serviceResult[0].price;
    }

    res.status(201).json({
      success: true,
      data: { booking },
      message: 'Booking created successfully. We will contact you within 2-4 hours.'
    });

  } catch (error) {
    console.error('Create booking error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to create booking. Please try again.',
      error: error.message
    });
  }
});

// ========================================
// TRACK BOOKING (Public — by booking ID or customer email)
// ========================================
router.get('/track', async (req, res) => {
  try {
    const { email, booking_id } = req.query;

    if (!email && !booking_id) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a booking ID or email address.'
      });
    }

    let bookings;
    if (booking_id) {
      bookings = await executeQuery(`
        SELECT b.id, b.customer_name, b.status, b.urgency, b.device_type,
               b.issue_description, b.preferred_date, b.created_at, b.updated_at,
               s.name as service_name, s.price as service_price
        FROM bookings b
        LEFT JOIN services s ON b.service_id = s.id
        WHERE b.id = $1 AND b.deleted_at IS NULL
      `, [parseInt(booking_id)]);
    } else {
      bookings = await executeQuery(`
        SELECT b.id, b.customer_name, b.status, b.urgency, b.device_type,
               b.issue_description, b.preferred_date, b.created_at, b.updated_at,
               s.name as service_name, s.price as service_price
        FROM bookings b
        LEFT JOIN services s ON b.service_id = s.id
        WHERE LOWER(b.customer_email) = LOWER($1) AND b.deleted_at IS NULL
        ORDER BY b.created_at DESC
      `, [email]);
    }

    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: booking_id
          ? 'No booking found with that ID.'
          : 'No bookings found for that email address.'
      });
    }

    res.json({
      success: true,
      data: bookings,
      message: `Found ${bookings.length} booking(s).`
    });
  } catch (error) {
    console.error('Track booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to look up booking. Please try again.'
    });
  }
});

// ========================================
// GET ALL BOOKINGS (Admin) - Excludes soft-deleted bookings
// ========================================
const { verifyToken, requireAdmin } = require('../middleware/auth');
router.get('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { status, urgency, limit = 50, offset = 0 } = req.query;
    
    let whereConditions = ['deleted_at IS NULL']; // Always exclude soft-deleted bookings
    let queryParams = [];
    
    if (status) {
      whereConditions.push('status = $' + (queryParams.length + 1));
      queryParams.push(status);
    }
    
    if (urgency) {
      whereConditions.push('urgency = $' + (queryParams.length + 1));
      queryParams.push(urgency);
    }
    
    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;
    
    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM bookings ${whereClause}`;
    const countResult = await executeQuery(countQuery, queryParams);
    const total = countResult[0].total;
    
    // Get bookings with service and user info
    const limitParam = queryParams.length + 1;
    const offsetParam = queryParams.length + 2;
    const bookingsQuery = `
      SELECT b.*, s.name as service_name, s.price as service_price
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      ${whereClause}
      ORDER BY b.created_at DESC
      LIMIT $${limitParam} OFFSET $${offsetParam}
    `;
    
    const bookings = await executeQuery(bookingsQuery, [...queryParams, parseInt(limit), parseInt(offset)]);
    
    res.json({
      success: true,
      data: {
        bookings,
        total,
        pagination: {
          limit: parseInt(limit),
          offset: parseInt(offset),
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookings'
    });
  }
});

// ========================================
// GET BOOKINGS BY USER ID (Shows ALL bookings including soft-deleted for user history)
// ========================================
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // First try with deleted_at column, fallback if it doesn't exist
    let bookings;
    try {
      bookings = await executeQuery(`
        SELECT b.*, s.name as service_name, s.price as service_price,
               CASE 
                 WHEN b.deleted_at IS NOT NULL THEN 'archived'
                 ELSE b.status 
               END as display_status
        FROM bookings b
        LEFT JOIN services s ON b.service_id = s.id
        WHERE b.user_id = $1
        ORDER BY b.created_at DESC
      `, [userId]);
    } catch (error) {
      // Fallback query without deleted_at column
      bookings = await executeQuery(`
        SELECT b.*, s.name as service_name, s.price as service_price,
               b.status as display_status
        FROM bookings b
        LEFT JOIN services s ON b.service_id = s.id
        WHERE b.user_id = $1
        ORDER BY b.created_at DESC
      `, [userId]);
    }
    
    res.json({
      success: true,
      data: {
        bookings,
        total: bookings.length
      }
    });
  } catch (error) {
    console.error('Get user bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user bookings'
    });
  }
});

// ========================================
// GET BOOKING BY ID
// ========================================
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const bookings = await executeQuery(`
      SELECT b.*, u.name as user_name, u.email as user_email, u.phone as user_phone,
             s.name as service_name, s.description as service_description, s.price as service_price
      FROM bookings b
      LEFT JOIN users u ON b.user_id = u.id
      LEFT JOIN services s ON b.service_id = s.id
      WHERE b.id = $1
    `, [id]);

    if (bookings.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      data: bookings[0],
      message: 'Booking retrieved successfully'
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve booking'
    });
  }
});

// ========================================
// UPDATE BOOKING STATUS
// ========================================
router.patch('/:id', verifyToken, requireAdmin, [
  body('status').optional().isIn(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']),
  body('cost').optional().isFloat({ min: 0 }),
  body('notes').optional().isString()
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
    const updates = req.body;
    
    const updateFields = [];
    const params = [];

    Object.keys(updates).forEach((key, index) => {
      if (['status', 'cost', 'notes', 'scheduled_date', 'completed_date'].includes(key)) {
        updateFields.push(`${key} = $${index + 1}`);
        params.push(updates[key]);
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    const result = await executeQuery(`
      UPDATE bookings SET ${updateFields.join(', ')} WHERE id = $${params.length}
    `, params);

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }


    res.json({
      success: true,
      message: 'Booking updated successfully'
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Failed to update booking'
    });
  }
});

// ========================================
// GET BOOKING STATISTICS
// ========================================
router.get('/stats/summary', verifyToken, requireAdmin, async (req, res) => {
  try {
    const stats = await executeQuery(`
      SELECT 
        COUNT(*) as total_bookings,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_bookings,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_bookings,
        COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_bookings,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_bookings,
        COUNT(CASE WHEN urgency = 'emergency' THEN 1 END) as emergency_bookings,
        AVG(cost) as average_cost,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as today_bookings
      FROM bookings
    `);

    const urgencyStats = await executeQuery(`
      SELECT urgency, COUNT(*) as count
      FROM bookings 
      GROUP BY urgency
    `);

    const statusStats = await executeQuery(`
      SELECT status, COUNT(*) as count
      FROM bookings 
      GROUP BY status
    `);

    res.json({
      success: true,
      data: {
        overview: stats[0],
        urgency_breakdown: urgencyStats,
        status_breakdown: statusStats
      },
      message: 'Booking statistics retrieved successfully'
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: 'Failed to retrieve booking statistics'
    });
  }
});

module.exports = router;
