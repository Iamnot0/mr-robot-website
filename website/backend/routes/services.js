// Services Routes - Professional Service Management

const express = require('express');
const router = express.Router();
const { executeQuery } = require('../database/connection');

// Get service categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await executeQuery(`
      SELECT * FROM service_categories 
      WHERE is_active = true 
      ORDER BY sort_order, name
    `);

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching service categories:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
});

// Get all services grouped by category
router.get('/', async (req, res) => {
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

    res.json({
      success: true,
      data: Object.values(groupedServices)
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch services' });
  }
});

module.exports = router;
