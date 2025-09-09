/* MR-ROBOT Computer Repair - Backend Server */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config({ path: './config.env' });

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize database connection
const { initializeDatabase } = require('./database/connection');

/* SECURITY & MIDDLEWARE */
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting for all routes - Environment configurable
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 1 * 60 * 1000, // 15 minutes in production
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 300, // limit each IP to configured requests per window
  message: {
    error: 'Too many requests, please slow down.',
    retryAfter: process.env.RATE_LIMIT_WINDOW_MS ? '15 minutes' : '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks and static assets
    return req.path === '/api/health' || req.path.startsWith('/static/');
  }
});

// Moderate rate limiting for auth routes - Balance security and usability
const authLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // limit each IP to 20 login attempts per 5 minutes
  message: {
    error: 'Too many login attempts, please wait 5 minutes.',
    retryAfter: '5 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// API-specific rate limiting for admin operations
const adminLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 1 * 60 * 1000, // 15 minutes in production
  max: parseInt(process.env.ADMIN_RATE_LIMIT_MAX_REQUESTS) || 200, // limit each IP to configured admin requests per window
  message: {
    error: 'Too many admin operations, please slow down.',
    retryAfter: process.env.RATE_LIMIT_WINDOW_MS ? '15 minutes' : '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(compression());
app.use(morgan('combined'));

// Enhanced CORS for better security - Environment configurable
const corsOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:3000', 'http://192.168.1.13:3000'];

app.use(cors({
  origin: corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400 // 24 hours
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Security monitoring middleware
app.use((req, res, next) => {
  // Log suspicious activities
  const suspiciousPatterns = [
    /script/i,
    /javascript:/i,
    /<script/i,
    /union.*select/i,
    /drop.*table/i
  ];
  
  const requestBody = JSON.stringify(req.body);
  const requestUrl = req.url;
  
  const isSuspicious = suspiciousPatterns.some(pattern => 
    pattern.test(requestBody) || pattern.test(requestUrl)
  );
  
  if (isSuspicious) {
    console.warn(`🚨 Suspicious request detected from ${req.ip}:`, {
      url: requestUrl,
      method: req.method,
      userAgent: req.get('User-Agent'),
      timestamp: new Date().toISOString()
    });
  }
  
  next();
});

// Apply rate limiting
app.use(limiter);

/* ROUTES */
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/services', require('./routes/services'));
app.use('/api/contact', require('./routes/contact'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/articles', require('./routes/articles').router);
app.use('/api/admin', adminLimiter, require('./routes/admin'));

/* Health check endpoint */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'MR-ROBOT Computer Repair API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

/* 404 handler */
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: 'The requested resource does not exist'
  });
});

/* Global error handler */
app.use((err, req, res, next) => {

  
  // Don't expose internal errors in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid input data',
      details: isDevelopment ? err.message : undefined
    });
  }
  
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid or missing authentication token'
    });
  }
  
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      error: 'Conflict',
      message: 'Resource already exists'
    });
  }
  
  // Generic error response
  res.status(500).json({
    error: 'Internal Server Error',
    message: isDevelopment ? err.message : 'Something went wrong. Please try again later.',
    ...(isDevelopment && { stack: err.stack })
  });
});

/* SERVER START */
const startServer = async () => {
  try {
    await initializeDatabase();
    console.log('✅ Database initialized successfully');
    
    app.listen(PORT, () => {
      console.log(`🚀 MR-ROBOT Computer Repair API running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
