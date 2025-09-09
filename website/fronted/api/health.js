// Vercel API Route - Health Check
const { executeQuery } = require('../database/connection');

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
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
      // Test database connection
      await executeQuery('SELECT 1');
      
      res.status(200).json({
        status: 'OK',
        message: 'MR-ROBOT Computer Repair API is running',
        timestamp: new Date().toISOString(),
        environment: 'production',
        platform: 'Vercel'
      });
    } catch (error) {
      console.error('Health Check Error:', error);
      res.status(500).json({
        status: 'ERROR',
        message: 'Database connection failed',
        timestamp: new Date().toISOString(),
        error: error.message
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
