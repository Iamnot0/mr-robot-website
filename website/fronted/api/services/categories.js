// Vercel API Route - Service Categories
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
      const categories = await executeQuery('SELECT * FROM service_categories WHERE is_active = true ORDER BY sort_order, name');

      res.status(200).json({
        success: true,
        data: categories
      });
    } catch (error) {
      console.error('Categories API Error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch categories',
        error: error.message 
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
