#!/usr/bin/env node

/**
 * Database Switch Utility
 * Switch between AWS (primary) and Azure (backup) databases
 */

const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, 'config.env');

function switchDatabase(provider) {
  if (!['aws', 'azure'].includes(provider)) {
    console.error('❌ Invalid provider. Use "aws" or "azure"');
    process.exit(1);
  }

  try {
    // Read current config
    let config = fs.readFileSync(configPath, 'utf8');
    
    // Update DB_PROVIDER
    config = config.replace(/DB_PROVIDER=\w+/, `DB_PROVIDER=${provider}`);
    
    // Update active database connection based on provider
    if (provider === 'azure') {
      config = config.replace(/DB_HOST=.*/, 'DB_HOST=ep-late-lab-a9t9npnb-pooler.gwc.azure.neon.tech');
      config = config.replace(/DB_USER=.*/, 'DB_USER=neondb_owner');
      config = config.replace(/DB_PASSWORD=.*/, 'DB_PASSWORD=npg_CFts2JN8EBmy');
      config = config.replace(/DB_NAME=.*/, 'DB_NAME=MrRobot_ComputerService');
    } else {
      config = config.replace(/DB_HOST=.*/, 'DB_HOST=ep-weathered-glitter-adeksc6i-pooler.c-2.us-east-1.aws.neon.tech');
      config = config.replace(/DB_USER=.*/, 'DB_USER=neondb_owner');
      config = config.replace(/DB_PASSWORD=.*/, 'DB_PASSWORD=npg_Jod1IS6OyYkD');
      config = config.replace(/DB_NAME=.*/, 'DB_NAME=MrRobot_ComputerService');
    }
    
    // Write updated config
    fs.writeFileSync(configPath, config);
    
    console.log(`✅ Switched to ${provider.toUpperCase()} database`);
    console.log(`🔄 Restart your application to use the new database`);
    
  } catch (error) {
    console.error('❌ Error switching database:', error.message);
    process.exit(1);
  }
}

// Get provider from command line argument
const provider = process.argv[2];

if (!provider) {
  console.log('Usage: node switch-db.js [aws|azure]');
  console.log('');
  console.log('Examples:');
  console.log('  node switch-db.js aws    # Switch to AWS (primary)');
  console.log('  node switch-db.js azure  # Switch to Azure (backup)');
  process.exit(1);
}

switchDatabase(provider);
