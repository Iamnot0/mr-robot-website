// Vercel API Route - Services
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
      const services = await executeQuery(`
        SELECT s.*, sc.name as category_name, sc.icon as category_icon, sc.color as category_color
        FROM services s 
        LEFT JOIN service_categories sc ON s.category_id = sc.id 
        WHERE s.is_active = true
        ORDER BY s.name
      `);

      // Group services by category
      const groupedServices = services.reduce((acc, service) => {
        const category = service.category_name || 'Other';
        if (!acc[category]) {
          acc[category] = {
            category: category,
            icon: service.category_icon || 'Settings',
            color: service.category_color || 'from-mr-cerulean to-mr-cerulean-dark',
            services: []
          };
        }
        
        acc[category].services.push({
          id: service.id,
          name: service.name,
          description: service.description,
          price: service.price,
          duration: service.duration,
          icon: service.icon,
          features: service.features ? JSON.parse(service.features) : []
        });

        return acc;
      }, {});

      res.status(200).json({
        success: true,
        data: Object.values(groupedServices)
      });
    } catch (error) {
      console.error('Services API Error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to fetch services',
        error: error.message 
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
