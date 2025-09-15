const express = require('express');
const { body, validationResult } = require('express-validator');
const { executeQuery } = require('../database/connection');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const jwt = require('jsonwebtoken');

// Middleware to verify admin token (PostgreSQL compatible)
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

const router = express.Router();

// Validation middleware
const validateUserUpdate = [
  body('name').optional().trim().isLength({ min: 2, max: 255 }).withMessage('Name must be 2-255 characters'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email required'),
  body('phone').optional().isMobilePhone().withMessage('Valid phone number required'),
  body('role').optional().isIn(['client', 'admin']).withMessage('Role must be client or admin'),
  body('status').optional().isIn(['active', 'inactive', 'suspended']).withMessage('Invalid status'),
  body('bio').optional().trim().isLength({ max: 1000 }).withMessage('Bio must be under 1000 characters'),
  body('address').optional().trim().isLength({ max: 500 }).withMessage('Address must be under 500 characters')
];

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get('/', verifyAdminToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', role = '', status = '' } = req.query;
    const offset = (page - 1) * limit;
    
    // Build search conditions
    let whereConditions = [];
    let queryParams = [];
    
    if (search) {
      whereConditions.push('(name LIKE $' + (queryParams.length + 1) + ' OR email LIKE $' + (queryParams.length + 2) + ' OR phone LIKE $' + (queryParams.length + 3) + ')');
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }
    
    if (role) {
      whereConditions.push('role = $' + (queryParams.length + 1));
      queryParams.push(role);
    }
    
    if (status) {
      whereConditions.push('status = $' + (queryParams.length + 1));
      queryParams.push(status);
    }
    
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM users ${whereClause}`;
    const countResult = await executeQuery(countQuery, queryParams);
    const total = countResult[0].total;
    
    // Get users
    const usersQuery = `
      SELECT id, name, email, phone, role, status, picture_url, bio, address, created_at, updated_at
      FROM users 
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `;
    
    const users = await executeQuery(usersQuery, [...queryParams, parseInt(limit), offset]);
    
    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting users'
    });
  }
});

// @route   POST /api/users
// @desc    Create new user (admin only)
// @access  Private/Admin
router.post('/', verifyToken, requireAdmin, [
  body('name').trim().isLength({ min: 2, max: 255 }).withMessage('Name must be 2-255 characters'),
  body('email').isEmail().withMessage('Valid email required'),
  body('role').isIn(['client', 'admin']).withMessage('Role must be client or admin'),
  body('status').isIn(['active', 'inactive', 'suspended']).withMessage('Invalid status')
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

    const { name, email, role, status } = req.body;

    // Check if user already exists
    const existingUsers = await executeQuery('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Generate a random password for new users
    const randomPassword = Math.random().toString(36).slice(-8);
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(randomPassword, 12);

    // Insert new user
    const result = await executeQuery(`
      INSERT INTO users (name, email, password_hash, role, status)
      VALUES ($1, $2, $3, $4, $5) RETURNING id
    `, [name, email, hashedPassword, role, status]);

    res.json({
      success: true,
      message: 'User created successfully',
      data: { 
        id: result[0].id,
        name,
        email,
        role,
        status,
        tempPassword: randomPassword // Send temporary password to admin
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create user'
    });
  }
});


// @route   PUT /api/users/profile
// @desc    Update current user profile
// @access  Private
router.put('/profile', verifyToken, [
  body('name').optional().trim().isLength({ min: 1, max: 255 }).withMessage('Name must be 1-255 characters'),
  body('email').optional().isEmail().withMessage('Please provide a valid email'),
  body('phone').optional().custom((value) => {
    if (!value || value.trim() === '') return true; // Allow empty phone
    if (value.length < 8 || value.length > 20) {
      throw new Error('Phone number must be 8-20 characters');
    }
    return true;
  }),
  body('bio').optional().trim().isLength({ max: 1000 }).withMessage('Bio must be under 1000 characters'),
  body('address').optional().trim().isLength({ max: 500 }).withMessage('Address must be under 500 characters'),
  body('profilePicture').optional().isString().withMessage('Profile picture must be a string')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Profile update validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const userId = req.user.id;
    const updateData = req.body;
    
    
    // Build update query
    const updateFields = [];
    const updateValues = [];
    
    // Map frontend field names to database field names
    const fieldMapping = {
      'name': 'name',
      'email': 'email', 
      'phone': 'phone',
      'bio': 'bio',
      'address': 'address',
      'profilePicture': 'picture_url'
    };
    
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && updateData[key] !== null && fieldMapping[key]) {
        const dbField = fieldMapping[key];
        updateFields.push(`${dbField} = $${updateValues.length + 1}`);
        updateValues.push(updateData[key]);
      }
    });
    
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }
    
    // Add updated_at timestamp
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    
    const updateQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${updateValues.length + 1}`;
    updateValues.push(userId);
    
    
    await executeQuery(updateQuery, updateValues);
    
    // Get updated user
    const updatedUsers = await executeQuery(
      'SELECT id, name, email, phone, role, status, picture_url, bio, address, created_at, updated_at FROM users WHERE id = $1',
      [userId]
    );
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: updatedUsers[0]
      }
    });
    
  } catch (error) {
    console.error('Update profile error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      userId: req.user?.id,
      updateData: req.body
    });
    res.status(500).json({
      success: false,
      message: 'Server error updating profile'
    });
  }
});




// @route   GET /api/users/stats/overview
// @desc    Get user statistics (admin only)
// @access  Private/Admin
router.get('/stats/overview', verifyToken, requireAdmin, async (req, res) => {
  try {
    // Get total users count
    const totalUsers = await executeQuery('SELECT COUNT(*) as count FROM users');
    
    // Get users by role
    const usersByRole = await executeQuery(
      'SELECT role, COUNT(*) as count FROM users GROUP BY role'
    );
    
    // Get users by status
    const usersByStatus = await executeQuery(
      'SELECT status, COUNT(*) as count FROM users GROUP BY status'
    );
    
    // Get recent registrations (last 30 days)
    const recentUsers = await executeQuery(
      'SELECT COUNT(*) as count FROM users WHERE created_at >= NOW() - INTERVAL \'30 days\''
    );
    
    res.json({
      success: true,
      data: {
        total: totalUsers[0].count,
        byRole: usersByRole,
        byStatus: usersByStatus,
        recentRegistrations: recentUsers[0].count
      }
    });
    
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting user statistics'
    });
  }
});


// PARAMETERIZED ROUTES - MUST COME AFTER SPECIFIC ROUTES

// @route   GET /api/users/:id
// @desc    Get user by ID (admin only)
// @access  Private/Admin
router.get('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const users = await executeQuery(
      'SELECT id, name, email, phone, role, status, picture_url, bio, address, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        user: users[0]
      }
    });
    
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting user'
    });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user (admin only)
// @access  Private/Admin
router.put('/:id', verifyToken, requireAdmin, validateUserUpdate, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { id } = req.params;
    const updateData = req.body;
    
    // Check if user exists
    const existingUsers = await executeQuery(
      'SELECT id FROM users WHERE id = $1',
      [id]
    );
    
    if (existingUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if email is being changed and if it's already taken
    if (updateData.email) {
      const emailCheck = await executeQuery(
        'SELECT id FROM users WHERE email = $1 AND id != $1',
        [updateData.email, id]
      );
      
      if (emailCheck.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Email is already taken by another user'
        });
      }
    }
    
    // Build update query
    const updateFields = [];
    const updateValues = [];
    
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && updateData[key] !== null) {
        updateFields.push(`${key} = $${updateValues.length + 1}`);
        updateValues.push(updateData[key]);
      }
    });
    
    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields to update'
      });
    }
    
    // Add updated_at timestamp
    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    
    const updateQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE id = $${updateValues.length + 1}`;
    updateValues.push(id);
    
    await executeQuery(updateQuery, updateValues);
    
    // Get updated user
    const updatedUsers = await executeQuery(
      'SELECT id, name, email, phone, role, status, picture_url, bio, address, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );
    
    res.json({
      success: true,
      message: 'User updated successfully',
      data: {
        user: updatedUsers[0]
      }
    });
    
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating user'
    });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user (admin only)
// @access  Private/Admin
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const existingUsers = await executeQuery(
      'SELECT id, role FROM users WHERE id = $1',
      [id]
    );
    
    if (existingUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Prevent admin from deleting themselves
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }
    
    // Prevent deletion of other admin users
    if (existingUsers[0].role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete admin users'
      });
    }
    
    // Delete user (cascade will handle related records)
    await executeQuery('DELETE FROM users WHERE id = $1', [id]);
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting user'
    });
  }
});

// @route   POST /api/users/:id/status
// @desc    Update user status (admin only)
// @access  Private/Admin
router.post('/:id/status', verifyToken, requireAdmin, [
  body('status').isIn(['active', 'inactive', 'suspended']).withMessage('Invalid status')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { id } = req.params;
    const { status } = req.body;
    
    // Check if user exists
    const existingUsers = await executeQuery(
      'SELECT id FROM users WHERE id = $1',
      [id]
    );
    
    if (existingUsers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update status
    await executeQuery(
      'UPDATE users SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [status, id]
    );
    
    res.json({
      success: true,
      message: `User status updated to ${status}`
    });
    
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating user status'
    });
  }
});

module.exports = router;
