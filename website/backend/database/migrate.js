/**
 * Database Migration Script
 * Adds deleted_at column to bookings table for soft delete functionality
 */

const { executeQuery, initializeDatabase } = require('./connection');

async function migrateBookingsTable() {
  try {
    console.log('🔄 Starting database migration...');
    await initializeDatabase();
    
    // Check if deleted_at column already exists
    console.log('🔍 Checking if deleted_at column exists...');
    const columns = await executeQuery(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'bookings' AND column_name = 'deleted_at'
    `);
    
    if (columns.length > 0) {
      console.log('✅ deleted_at column already exists');
      return;
    }
    
    // Add deleted_at column
    console.log('🔧 Adding deleted_at column to bookings table...');
    await executeQuery(`
      ALTER TABLE bookings 
      ADD COLUMN deleted_at TIMESTAMP DEFAULT NULL
    `);
    
    console.log('✅ Migration completed successfully!');
    console.log('📋 Bookings table now supports soft delete functionality');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateBookingsTable()
    .then(() => {
      console.log('🎉 Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { migrateBookingsTable };
