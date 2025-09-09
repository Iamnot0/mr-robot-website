const { Pool } = require('pg');
require('dotenv').config({ path: './config.env' });

// Database configuration for PostgreSQL (Neon)
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'clay',
  password: process.env.DB_PASSWORD || 'IHaveN0L!mitation$',
  database: process.env.DB_NAME || 'MrRobot_ComputerRepair',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Create connection pool
let pool;

const initializeDatabase = async () => {
  try {
    // Create pool
    pool = new Pool(dbConfig);
    
    // Test connection
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    client.release();
    
    return pool;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    throw error;
  }
};

const getConnection = () => {
  if (!pool) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return pool;
};

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

const executeTransaction = async (queries) => {
  const client = await getConnection().connect();
  
  try {
    await client.query('BEGIN');
    
    const results = [];
    for (const { query, params = [] } of queries) {
      const result = await client.query(query, params);
      results.push(result.rows);
    }
    
    await client.query('COMMIT');
    return results;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const closeDatabase = async () => {
  if (pool) {
    await pool.end();
    console.log('Database connection closed');
  }
};

module.exports = {
  initializeDatabase,
  getConnection,
  executeQuery,
  executeTransaction,
  closeDatabase
};
