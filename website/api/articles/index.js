// Vercel API Route - Articles
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
      const { category, limit = 10, offset = 0 } = req.query;
      
      let query = `
        SELECT id, title, excerpt, content, category, thumbnail_url, 
               author, created_at, updated_at, is_published, read_time
        FROM articles 
        WHERE is_published = true
      `;
      
      const params = [];
      
      if (category) {
        query += ' AND category = $1';
        params.push(category);
      }
      
      query += ' ORDER BY created_at DESC';
      
      if (limit) {
        query += ` LIMIT $${params.length + 1}`;
        params.push(parseInt(limit));
      }
      
      if (offset) {
        query += ` OFFSET $${params.length + 1}`;
        params.push(parseInt(offset));
      }

      const articles = await executeQuery(query, params);

      res.status(200).json({
        success: true,
        articles: articles,
        total: articles.length
      });
    } catch (error) {
      console.error('Articles API Error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch articles',
        error: error.message 
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
