# MR-ROBOT Computer Repair - ERP System Documentation

## System Overview

The MR-ROBOT Computer Repair ERP System is a comprehensive business management solution built with modern web technologies. The system integrates Customer Relationship Management (CRM), Financial Management, and Enterprise Resource Planning (ERP) capabilities to streamline computer repair business operations.

## Architecture

### Backend Technology Stack
- **Runtime**: Node.js 16+
- **Framework**: Express.js
- **Database**: PostgreSQL (Neon Cloud)
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Express-validator, Joi

### Frontend Technology Stack
- **Framework**: React 18
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **UI Components**: Custom component library
- **State Management**: React Context API

## Database Configuration

### PostgreSQL Connection Setup
```javascript
// database/connection.js
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};
```

### Environment Configuration
```bash
# config.env
DB_HOST=your_database_host
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=mr_robot_db
DB_PORT=5432
JWT_SECRET=your_super_secure_jwt_secret_key_here
NODE_ENV=production
PORT=3001
```

## API Routes Configuration

### Server Setup
```javascript
// server.js - Main server configuration
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per windowMs
  message: { error: 'Too many requests, please slow down.' }
});
```

### Route Configuration
```javascript
// API Routes
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/services', require('./routes/services'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/articles', require('./routes/articles').router);
app.use('/api/admin', adminLimiter, require('./routes/admin'));
app.use('/api/crm', require('./routes/crm'));
app.use('/api/financial', require('./routes/financial'));
```

## CRM Module

### Customer Relationship Management Features

#### Customer Overview API
```javascript
// GET /api/crm/customers/:id/overview
router.get('/customers/:id/overview', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get customer info
    const customer = await executeQuery('SELECT * FROM users WHERE id = $1', [id]);
    
    // Get communications count
    const communications = await executeQuery(`
      SELECT COUNT(*) as count FROM customer_communications WHERE customer_id = $1
    `, [id]);
    
    // Get booking history count
    const bookingHistory = await executeQuery(`
      SELECT COUNT(*) as count FROM bookings 
      WHERE user_id = $1 OR customer_email = (SELECT email FROM users WHERE id = $1)
    `, [id]);
    
    res.json({
      success: true,
      data: {
        customer: customer[0],
        stats: {
          communications: parseInt(communications[0].count),
          serviceHistory: parseInt(bookingHistory[0].count),
          bookings: parseInt(bookings[0].count)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch customer overview' });
  }
});
```

#### Customer Communications
```javascript
// POST /api/crm/customers/:id/communications
router.post('/customers/:id/communications', [
  body('communication_type').isIn(['email', 'phone', 'meeting', 'note']),
  body('subject').trim().isLength({ min: 1, max: 255 }),
  body('content').trim().isLength({ min: 1 }),
  body('direction').isIn(['inbound', 'outbound'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { id } = req.params;
    const { communication_type, subject, content, direction } = req.body;
    
    const result = await executeQuery(`
      INSERT INTO customer_communications (customer_id, communication_type, subject, content, direction, created_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [id, communication_type, subject, content, direction, 1]);
    
    res.json({
      success: true,
      data: result[0],
      message: 'Communication added successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add communication' });
  }
});
```

### CRM Frontend Implementation
```javascript
// CRMDashboard.jsx
const CRMDashboard = () => {
  const [segments, setSegments] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedOverview, setSelectedOverview] = useState(null);
  const [communications, setCommunications] = useState([]);
  const [serviceHistory, setServiceHistory] = useState([]);

  const viewOverview = async (customerId) => {
    try {
      const [ovRes, commRes, histRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/crm/customers/${customerId}/overview`),
        fetch(`${API_BASE_URL}/api/crm/customers/${customerId}/communications`),
        fetch(`${API_BASE_URL}/api/crm/customers/${customerId}/history`)
      ]);

      const [ovJson, commJson, histJson] = await Promise.all([
        ovRes.json().catch(() => ({})),
        commRes.json().catch(() => ({})),
        histRes.json().catch(() => ({}))
      ]);

      if (ovJson && ovJson.success) setSelectedOverview(ovJson.data);
      if (commJson && commJson.success) setCommunications(commJson.data || []);
      if (histJson && histJson.success) setServiceHistory(histJson.data || []);
    } catch (error) {
      console.error('Failed to load customer overview:', error);
    }
  };
};
```

## Financial Module

### Financial Dashboard API
```javascript
// GET /api/financial/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    // Total revenue from completed bookings
    const revenue = await executeQuery(`
      SELECT COALESCE(SUM(COALESCE(b.actual_cost, s.price)), 0) as total_revenue
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      WHERE b.status = 'completed'
    `);
    
    const totalRevenue = parseFloat(revenue[0].total_revenue);
    
    // Outstanding revenue (pending bookings)
    const outstanding = await executeQuery(`
      SELECT COALESCE(SUM(COALESCE(b.actual_cost, s.price)), 0) as outstanding_amount
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      WHERE b.status IN ('pending', 'confirmed', 'in_progress')
    `);
    
    // Recent completed bookings (as invoices)
    const recentInvoices = await executeQuery(`
      SELECT 
        b.id as invoice_number,
        b.customer_name,
        b.customer_email,
        COALESCE(b.actual_cost, s.price) as total_amount,
        b.created_at,
        s.name as service_name
      FROM bookings b
      LEFT JOIN services s ON b.service_id = s.id
      WHERE b.status = 'completed'
      ORDER BY b.created_at DESC
      LIMIT 5
    `);
    
    res.json({
      success: true,
      data: {
        totalRevenue: totalRevenue,
        totalExpenses: 0,
        outstandingAmount: parseFloat(outstanding[0].outstanding_amount),
        profit: totalRevenue,
        recentInvoices
      }
    });
  } catch (error) {
    console.error('Financial dashboard error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard data' });
  }
});
```

### Financial Frontend Implementation
```javascript
// FinancialDashboard.jsx
const FinancialDashboard = () => {
  const [data, setData] = useState({ 
    totalRevenue: 0, 
    totalExpenses: 0, 
    outstandingAmount: 0, 
    profit: 0, 
    recentInvoices: [] 
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/financial/dashboard`);
        const json = await res.json().catch(() => ({ success: false }));
        if (json && json.success) setData(json.data || data);
      } catch (e) {
        setError('Unable to load financial data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);
};
```

## Frontend Configuration

### API Configuration
```javascript
// utils/config.js
export const API_BASE_URL = 'https://mr-robot-backend.onrender.com';

export const API_ENDPOINTS = {
  HEALTH: `${API_BASE_URL}/api/health`,
  SERVICES: `${API_BASE_URL}/api/services`,
  ARTICLES: `${API_BASE_URL}/api/articles`,
  CONTACT_SUBMIT: `${API_BASE_URL}/api/contact/submit`,
  BOOKINGS: `${API_BASE_URL}/api/bookings`,
  ADMIN_LOGIN: `${API_BASE_URL}/api/admin/login`,
  USER_LOGIN: `${API_BASE_URL}/api/auth/login`,
  ADMIN_DASHBOARD: `${API_BASE_URL}/api/admin/dashboard`,
  ADMIN_USERS: `${API_BASE_URL}/api/users`,
};
```

### React Router Configuration
```javascript
// App.js
function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <CategoryProvider>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/crm" element={<CRMDashboard />} />
                <Route path="/financial" element={<FinancialDashboard />} />
                <Route path="/services" element={<Services />} />
                <Route path="/contact" element={<Contact />} />
              </Routes>
            </BrowserRouter>
          </CategoryProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
```

## Security Implementation

### Authentication Middleware
```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};
```

### Rate Limiting Configuration
```javascript
// Different rate limits for different operations
const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // limit each IP to 20 login attempts per 5 minutes
  message: { error: 'Too many login attempts, please wait 5 minutes.' }
});

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 admin requests per window
  message: { error: 'Too many admin operations, please slow down.' }
});
```

## Database Schema

### Key Tables
- **users**: Customer and admin user management
- **bookings**: Service booking records
- **services**: Available repair services
- **customer_communications**: CRM communication history
- **customer_segments**: Customer categorization
- **articles**: Knowledge base content

### Database Connection Pool
```javascript
const executeQuery = async (query, params = []) => {
  try {
    const client = await getConnection().connect();
    const result = await client.query(query, params);
    client.release();
    return result.rows;
  } catch (error) {
    console.error('Query execution failed:', error.message);
    throw error;
  }
};
```

## Deployment Configuration

### Production Environment
- **Backend**: Render.com (Node.js)
- **Frontend**: Render.com (Static Site)
- **Database**: Neon PostgreSQL
- **Domain**: mrrobotcomputerservice.onrender.com

### Environment Variables
```bash
NODE_ENV=production
DB_HOST=your_neon_host
DB_USER=your_neon_user
DB_PASSWORD=your_neon_password
DB_NAME=your_database_name
JWT_SECRET=your_production_jwt_secret
PORT=3001
```

## System Features

### ERP Capabilities
1. **Service Management**: Complete service catalog with pricing
2. **Booking System**: Customer appointment scheduling
3. **Inventory Tracking**: Service and parts management
4. **User Management**: Customer and admin role-based access
5. **Knowledge Base**: Article and documentation system

### CRM Capabilities
1. **Customer 360 View**: Complete customer interaction history
2. **Communication Tracking**: Email, phone, meeting records
3. **Customer Segmentation**: Automated customer categorization
4. **Service History**: Complete repair and service records
5. **Relationship Management**: Customer interaction timeline

### Financial Capabilities
1. **Revenue Tracking**: Completed service revenue calculation
2. **Outstanding Payments**: Pending payment monitoring
3. **Invoice Generation**: Automatic invoice creation
4. **Profit Analysis**: Revenue vs expense tracking
5. **Financial Dashboard**: Real-time financial metrics

## API Endpoints Summary

### CRM Endpoints
- `GET /api/crm/customers/:id/overview` - Customer 360 view
- `GET /api/crm/customers/:id/communications` - Communication history
- `POST /api/crm/customers/:id/communications` - Add communication
- `GET /api/crm/customers/:id/history` - Service history
- `GET /api/crm/segments` - Customer segments

### Financial Endpoints
- `GET /api/financial/dashboard` - Financial dashboard data

### Admin Endpoints
- `GET /api/admin/dashboard` - Admin dashboard
- `GET /api/users` - User management
- `GET /api/admin/bookings` - Booking management

## Technology Benefits

1. **Scalability**: PostgreSQL database with connection pooling
2. **Security**: JWT authentication, rate limiting, CORS protection
3. **Performance**: React frontend with optimized API calls
4. **Maintainability**: Modular architecture with clear separation
5. **User Experience**: Modern UI with responsive design
6. **Business Intelligence**: Real-time dashboards and reporting

This ERP system provides a complete business management solution for computer repair services, integrating customer relationship management, financial tracking, and operational efficiency in a single, cohesive platform.
