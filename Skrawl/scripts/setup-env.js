#!/usr/bin/env node

/**
 * Setup script for Skrawl environment configuration
 * This script helps set up the .env file from the template
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const envExamplePath = path.join(__dirname, '..', '.env.example');
const envPath = path.join(__dirname, '..', '.env');

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function setupEnvironment() {
  console.log('🚀 Skrawl Environment Setup');
  console.log('============================\n');

  // Check if .env already exists
  if (fs.existsSync(envPath)) {
    const overwrite = await askQuestion('⚠️  .env file already exists. Overwrite? (y/N): ');
    if (overwrite.toLowerCase() !== 'y' && overwrite.toLowerCase() !== 'yes') {
      console.log('Setup cancelled.');
      rl.close();
      return;
    }
  }

  // Check if .env.example exists
  if (!fs.existsSync(envExamplePath)) {
    console.error('❌ .env.example file not found!');
    rl.close();
    return;
  }

  console.log('📋 Please provide your Supabase credentials:');
  console.log('   (You can find these in your Supabase Dashboard > Settings > API)\n');

  // Get Supabase credentials
  const supabaseUrl = await askQuestion('🔗 Supabase URL (default: https://yazfoqqewzezwjigsuqq.supabase.co): ');
  const supabaseKey = await askQuestion('🔑 Supabase Anon Key: ');

  if (!supabaseKey.trim()) {
    console.error('❌ Supabase Anon Key is required!');
    rl.close();
    return;
  }

  // Read template file
  let envContent = fs.readFileSync(envExamplePath, 'utf8');

  // Replace placeholders
  envContent = envContent.replace(
    'EXPO_PUBLIC_SUPABASE_URL=https://yazfoqqewzezwjigsuqq.supabase.co',
    `EXPO_PUBLIC_SUPABASE_URL=${supabaseUrl.trim() || 'https://yazfoqqewzezwjigsuqq.supabase.co'}`
  );
  
  envContent = envContent.replace(
    'EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here',
    `EXPO_PUBLIC_SUPABASE_ANON_KEY=${supabaseKey.trim()}`
  );

  // Write .env file
  try {
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ .env file created successfully!');
    console.log('🔒 Your credentials are secure (file is in .gitignore)');
    console.log('\n📖 Next steps:');
    console.log('   1. Set up your database tables (see setup-supabase.md)');
    console.log('   2. Configure authentication in Supabase Dashboard');
    console.log('   3. Test your setup with: npm start');
  } catch (error) {
    console.error('❌ Failed to create .env file:', error.message);
  }

  rl.close();
}

// Run the setup
setupEnvironment().catch((error) => {
  console.error('❌ Setup failed:', error.message);
  rl.close();
});
