/**
 * Financial Routes - Financial Management
 */

const express = require('express');
const router = express.Router();
const { executeQuery } = require('../database/connection');

// Get financial dashboard data (includes soft-deleted bookings for accurate financial tracking)
router.get('/dashboard', async (req, res) => {
  try {
    // Total revenue from completed bookings (includes soft-deleted for accurate financial records)
    const revenue = await executeQuery(`
      SELECT COALESCE(SUM(COALESCE(b.actual_cost, s.price)), 0) as total_revenue
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      WHERE b.status = 'completed'
    `);
    
    const totalRevenue = parseFloat(revenue[0].total_revenue);
    
    // Outstanding revenue (pending bookings - excludes soft-deleted)
    const outstanding = await executeQuery(`
      SELECT COALESCE(SUM(COALESCE(b.actual_cost, s.price)), 0) as outstanding_amount
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      WHERE b.status IN ('pending', 'confirmed', 'in_progress') 
      AND b.deleted_at IS NULL
    `);
    
    // Recent completed bookings (as invoices) - includes soft-deleted for complete financial history
    const recentInvoices = await executeQuery(`
      SELECT 
        b.id as invoice_number,
        b.customer_name,
        b.customer_email,
        COALESCE(b.actual_cost, s.price) as total_amount,
        b.created_at,
        s.name as service_name,
        CASE 
          WHEN b.deleted_at IS NOT NULL THEN 'archived'
          ELSE 'active'
        END as record_status
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      WHERE b.status = 'completed'
      ORDER BY b.created_at DESC
      LIMIT 5
    `);
    
    // Get archived revenue (from soft-deleted completed bookings)
    const archivedRevenue = await executeQuery(`
      SELECT COALESCE(SUM(COALESCE(b.actual_cost, s.price)), 0) as archived_revenue
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      WHERE b.status = 'completed' AND b.deleted_at IS NOT NULL
    `);
    
    res.json({
      success: true,
      data: {
        totalRevenue: totalRevenue,
        archivedRevenue: parseFloat(archivedRevenue[0].archived_revenue),
        totalExpenses: 0, // No expenses tracked yet
        outstandingAmount: parseFloat(outstanding[0].outstanding_amount),
        profit: totalRevenue, // Profit = Revenue (no expenses)
        recentInvoices
      }
    });
  } catch (error) {
    console.error('Financial dashboard error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard data' });
  }
});

module.exports = router;