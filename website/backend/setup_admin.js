/**
 * Admin Setup Script for Production
 * This script creates the admin user in the database
 */

const { Pool } = require('pg');

// Database configuration for PostgreSQL (Neon)
const dbConfig = {
  host: process.env.DB_HOST || 'ep-weathered-glitter-adeksc6i-pooler.c-2.us-east-1.aws.neon.tech',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'neondb_owner',
  password: process.env.DB_PASSWORD || 'npg_Jod1IS6OyYkD',
  database: process.env.DB_NAME || 'MrRobot_ComputerService',
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

async function setupAdmin() {
  const pool = new Pool(dbConfig);
  
  try {
    console.log('🔌 Connecting to database...');
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    
    // Check if admin user already exists
    console.log('🔍 Checking if admin user exists...');
    const existingUsers = await client.query(
      'SELECT * FROM users WHERE email = $1', 
      ['mr.robotcomputerservice@gmail.com']
    );
    
    if (existingUsers.rows.length > 0) {
      console.log('✅ Admin user already exists:', existingUsers.rows[0]);
      return;
    }
    
    // Create admin user with the correct password hash from MySQL dump
    console.log('👤 Creating admin user...');
    const passwordHash = '$2a$12$r9wfdKEZW0oVmOQ/w.oH7.ArLoIsnj/JMKVYgBFKPS6J4rGjvYS16';
    
    const result = await client.query(`
      INSERT INTO users (name, email, password_hash, role, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, ['clay', 'mr.robotcomputerservice@gmail.com', passwordHash, 'admin', 'active']);
    
    console.log('✅ Admin user created successfully:', result.rows[0]);
    
  } catch (error) {
    console.error('❌ Error setting up admin user:', error);
  } finally {
    await pool.end();
  }
}

// Run the setup
setupAdmin();
