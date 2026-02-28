const { Pool } = require('pg');
require('dotenv').config({ path: './config.env' });

const getDBConfig = () => {
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    };
  }

  return {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  };
};

let pool;

const initializeDatabase = async () => {
  pool = new Pool(getDBConfig());
  const client = await pool.connect();
  client.release();
  return pool;
};

const getConnection = () => {
  if (!pool) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return pool;
};

const executeQuery = async (query, params = []) => {
  const client = await getConnection().connect();
  try {
    const result = await client.query(query, params);
    return result.rows;
  } finally {
    client.release();
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
  }
};

const getPool = () => pool;

module.exports = {
  initializeDatabase,
  getConnection,
  getPool,
  executeQuery,
  executeTransaction,
  closeDatabase
};
