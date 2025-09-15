const { Pool } = require('pg');
require('dotenv').config({ path: './config.env' });

// Import dual database system
const { 
  initializeDualDatabase, 
  executeDualQuery, 
  getDualDatabaseStatus, 
  closeDualConnections 
} = require('./dual-connection');

// Database configuration for PostgreSQL (Dual Database Support)
const getDBConfig = () => {
  // First try to use standard environment variables (Render production)
  if (process.env.DATABASE_URL) {
    console.log('🔄 Using DATABASE_URL from environment');
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      acquireTimeoutMillis: 60000,
      createTimeoutMillis: 30000,
    };
  }
  
  // Fallback to dual database system
  const provider = process.env.DB_PROVIDER || 'aws';
  
  if (provider === 'azure') {
    console.log('🔄 Using Azure database (backup server)');
    return {
      host: process.env.DB_HOST_AZURE || process.env.DB_HOST,
      port: process.env.DB_PORT_AZURE || process.env.DB_PORT || 5432,
      user: process.env.DB_USER_AZURE || process.env.DB_USER,
      password: process.env.DB_PASSWORD_AZURE || process.env.DB_PASSWORD,
      database: process.env.DB_NAME_AZURE || process.env.DB_NAME,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      acquireTimeoutMillis: 60000,
      createTimeoutMillis: 30000,
    };
  } else {
    console.log('🔄 Using AWS database (primary server)');
    return {
      host: process.env.DB_HOST_AWS || process.env.DB_HOST,
      port: process.env.DB_PORT_AWS || process.env.DB_PORT || 5432,
      user: process.env.DB_USER_AWS || process.env.DB_USER,
      password: process.env.DB_PASSWORD_AWS || process.env.DB_PASSWORD,
      database: process.env.DB_NAME_AWS || process.env.DB_NAME,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      acquireTimeoutMillis: 60000,
      createTimeoutMillis: 30000,
    };
  }
};

const dbConfig = getDBConfig();

// Create connection pool
let pool;

const initializeDatabase = async () => {
  try {
    // Create pool
    pool = new Pool(dbConfig);
    
    // Test connection
    const client = await pool.connect();
    console.log('✅ Primary database connected successfully');
    client.release();
    
    // Try to initialize dual database system (optional)
    try {
      await initializeDualDatabase();
    } catch (dualError) {
      console.log('⚠️ Dual database system not available, using single database');
    }
    
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
    // Use dual database system for writes, single for reads
    if (query.trim().toUpperCase().startsWith('INSERT') || 
        query.trim().toUpperCase().startsWith('UPDATE') || 
        query.trim().toUpperCase().startsWith('DELETE')) {
      // Write operations - try dual-write, fallback to single database
      try {
        console.log('🔄 Executing dual-write operation...');
        const result = await executeDualQuery(query, params);
        return result.rows;
      } catch (dualError) {
        console.log('⚠️ Dual-write failed, using single database');
        const client = await getConnection().connect();
        const result = await client.query(query, params);
        client.release();
        return result.rows;
      }
    } else {
      // Read operations - use primary database
      const client = await getConnection().connect();
      const result = await client.query(query, params);
      client.release();
      return result.rows;
    }
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
