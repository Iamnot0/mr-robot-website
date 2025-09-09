// Vercel API Route - Bookings
const { executeQuery } = require('../../database/connection');

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    try {
      const bookings = await executeQuery(`
        SELECT b.*, s.name as service_name, sc.name as category_name
        FROM bookings b
        LEFT JOIN services s ON b.service_id = s.id
        LEFT JOIN service_categories sc ON s.category_id = sc.id
        ORDER BY b.created_at DESC
      `);

      res.status(200).json({
        success: true,
        data: { bookings }
      });
    } catch (error) {
      console.error('Bookings API Error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch bookings',
        error: error.message 
      });
    }
  } else if (req.method === 'POST') {
    try {
      const { 
        name, email, phone, service_id, service_name, 
        preferred_date, preferred_time, message, address 
      } = req.body;

      // Validate required fields
      if (!name || !email || !phone) {
        return res.status(400).json({
          success: false,
          message: 'Name, email, and phone are required'
        });
      }

      // Insert booking
      const result = await executeQuery(
        `INSERT INTO bookings (name, email, phone, service_id, service_name, preferred_date, preferred_time, message, address, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending', NOW())
         RETURNING id`,
        [name, email, phone, service_id || null, service_name || null, preferred_date || null, preferred_time || null, message || null, address || null]
      );

      res.status(201).json({
        success: true,
        message: 'Booking submitted successfully',
        bookingId: result[0].id
      });
    } catch (error) {
      console.error('Bookings API Error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to submit booking',
        error: error.message 
      });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
