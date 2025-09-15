/**
 * Dual Database Connection Manager
 * Automatically saves to both AWS and Azure databases
 */

const { Pool } = require('pg');
require('dotenv').config({ path: './config.env' });

// AWS Database Configuration
const getAWSConfig = () => ({
  host: process.env.DB_HOST_AWS || process.env.DB_HOST,
  port: process.env.DB_PORT_AWS || process.env.DB_PORT || 5432,
  user: process.env.DB_USER_AWS || process.env.DB_USER,
  password: process.env.DB_PASSWORD_AWS || process.env.DB_PASSWORD,
  database: process.env.DB_NAME_AWS || process.env.DB_NAME,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Azure Database Configuration
const getAzureConfig = () => ({
  host: process.env.DB_HOST_AZURE || process.env.DB_HOST,
  port: process.env.DB_PORT_AZURE || process.env.DB_PORT || 5432,
  user: process.env.DB_USER_AZURE || process.env.DB_USER,
  password: process.env.DB_PASSWORD_AZURE || process.env.DB_PASSWORD,
  database: process.env.DB_NAME_AZURE || process.env.DB_NAME,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Create connection pools
let awsPool = null;
let azurePool = null;

const initializeDualDatabase = async () => {
  try {
    console.log('🔄 Initializing dual database connections...');
    
    // Initialize AWS pool
    try {
      awsPool = new Pool(getAWSConfig());
      await awsPool.query('SELECT 1');
      console.log('✅ AWS database connected');
    } catch (error) {
      console.log('❌ AWS database unavailable:', error.message);
      awsPool = null;
    }
    
    // Initialize Azure pool
    try {
      azurePool = new Pool(getAzureConfig());
      await azurePool.query('SELECT 1');
      console.log('✅ Azure database connected');
    } catch (error) {
      console.log('❌ Azure database unavailable:', error.message);
      azurePool = null;
    }
    
    if (!awsPool && !azurePool) {
      throw new Error('No databases available');
    }
    
    console.log('🎯 Dual database system ready');
  } catch (error) {
    console.error('❌ Dual database initialization failed:', error.message);
    throw error;
  }
};

// Execute query on both databases
const executeDualQuery = async (query, params = []) => {
  const results = { aws: null, azure: null, errors: [] };
  
  // Execute on AWS (if available)
  if (awsPool) {
    try {
      const awsResult = await awsPool.query(query, params);
      results.aws = awsResult;
      console.log('✅ AWS query executed successfully');
    } catch (error) {
      console.log('❌ AWS query failed:', error.message);
      results.errors.push({ database: 'aws', error: error.message });
    }
  }
  
  // Execute on Azure (if available)
  if (azurePool) {
    try {
      const azureResult = await azurePool.query(query, params);
      results.azure = azureResult;
      console.log('✅ Azure query executed successfully');
    } catch (error) {
      console.log('❌ Azure query failed:', error.message);
      results.errors.push({ database: 'azure', error: error.message });
    }
  }
  
  // Return the result from the primary database (Azure if available, otherwise AWS)
  if (results.azure) {
    return results.azure;
  } else if (results.aws) {
    return results.aws;
  } else {
    // If no databases are available, throw error
    throw new Error('No databases available for query execution');
  }
};

// Get status of both databases
const getDualDatabaseStatus = async () => {
  const status = {
    aws: { connected: false, error: null },
    azure: { connected: false, error: null }
  };
  
  // Check AWS
  if (awsPool) {
    try {
      await awsPool.query('SELECT 1');
      status.aws.connected = true;
    } catch (error) {
      status.aws.error = error.message;
    }
  }
  
  // Check Azure
  if (azurePool) {
    try {
      await azurePool.query('SELECT 1');
      status.azure.connected = true;
    } catch (error) {
      status.azure.error = error.message;
    }
  }
  
  return status;
};

// Close both connections
const closeDualConnections = async () => {
  if (awsPool) {
    await awsPool.end();
    console.log('🔌 AWS connection closed');
  }
  if (azurePool) {
    await azurePool.end();
    console.log('🔌 Azure connection closed');
  }
};

module.exports = {
  initializeDualDatabase,
  executeDualQuery,
  getDualDatabaseStatus,
  closeDualConnections
};
