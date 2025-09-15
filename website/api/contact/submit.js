// Vercel API Route - Contact Form Submission
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

  if (req.method === 'POST') {
    try {
      const { name, email, phone, service, message, preferredContact } = req.body;

      // Validate required fields
      if (!name || !email || !message) {
        return res.status(400).json({
          success: false,
          message: 'Name, email, and message are required'
        });
      }

      // Insert contact submission
      const result = await executeQuery(
        `INSERT INTO contact_submissions (name, email, phone, service, message, preferred_contact, status, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, 'new', NOW())
         RETURNING id`,
        [name, email, phone || null, service || null, message, preferredContact || 'email']
      );

      res.status(201).json({
        success: true,
        message: 'Contact form submitted successfully',
        submissionId: result[0].id
      });
    } catch (error) {
      console.error('Contact API Error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to submit contact form',
        error: error.message 
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
