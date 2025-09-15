const { initializeDatabase, executeQuery } = require('./database/connection');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  try {
    console.log('Initializing database...');
    await initializeDatabase();
    
    console.log('Creating admin user...');
    
    // Check if admin user already exists
    const existingUsers = await executeQuery('SELECT * FROM users WHERE email = $1', ['mr.robotcomputerservice@gmail.com']);
    
    if (existingUsers.length > 0) {
      console.log('Admin user already exists:', existingUsers[0]);
      return;
    }
    
    // Create admin user with the correct password hash from MySQL dump
    const passwordHash = '$2a$12$r9wfdKEZW0oVmOQ/w.oH7.ArLoIsnj/JMKVYgBFKPS6J4rGjvYS16';
    
    const result = await executeQuery(`
      INSERT INTO users (name, email, password_hash, role, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `, ['clay', 'mr.robotcomputerservice@gmail.com', passwordHash, 'admin', 'active']);
    
    console.log('Admin user created successfully:', result);
    
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

createAdmin();
