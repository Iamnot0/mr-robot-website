/**
 * Update Client User Password Script
 * This script updates the password for the client user
 */

const { initializeDatabase, executeQuery } = require('./database/connection');
const bcrypt = require('bcryptjs');

async function updateClientPassword() {
  try {
    console.log('🔌 Initializing database connection...');
    await initializeDatabase();
    console.log('✅ Database connected successfully');
    
    // Hash the new password
    const newPassword = 'user123';
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    console.log('🔑 Updating client user password...');
    
    // Update the client user's password
    const result = await executeQuery(`
      UPDATE users 
      SET password_hash = $1, updated_at = CURRENT_TIMESTAMP 
      WHERE email = $2
      RETURNING id, name, email, role, status
    `, [hashedPassword, 'user01@gmail.com']);
    
    if (result.length > 0) {
      console.log('✅ Client user password updated successfully:', result[0]);
      console.log('📝 Client credentials:');
      console.log('   Email: user01@gmail.com');
      console.log('   Password: user123');
    } else {
      console.log('❌ Client user not found');
    }
    
  } catch (error) {
    console.error('❌ Error updating client password:', error);
  }
}

// Run the update
if (require.main === module) {
  updateClientPassword()
    .then(() => {
      console.log('✅ Password update completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Password update failed:', error);
      process.exit(1);
    });
}

module.exports = { updateClientPassword };
