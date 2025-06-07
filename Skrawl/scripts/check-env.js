#!/usr/bin/env node

/**
 * Environment validation script for Skrawl
 * Checks if all required environment variables are properly set
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');

function checkEnvironment() {
  console.log('🔍 Checking Skrawl Environment Configuration');
  console.log('=============================================\n');

  // Check if .env file exists
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env file not found!');
    console.log('📝 Run: npm run setup-env');
    console.log('📝 Or manually: cp .env.example .env');
    return false;
  }

  console.log('✅ .env file found');

  // Read and parse .env file
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};

  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const equalIndex = trimmed.indexOf('=');
      const key = trimmed.substring(0, equalIndex).trim();
      const value = trimmed.substring(equalIndex + 1).trim();
      if (key && value) {
        envVars[key] = value;
      }
    }
  });

  // Required variables
  const requiredVars = [
    {
      key: 'EXPO_PUBLIC_SUPABASE_URL',
      name: 'Supabase URL',
      validate: (value) => value && value.startsWith('https://') && value.includes('supabase.co')
    },
    {
      key: 'EXPO_PUBLIC_SUPABASE_ANON_KEY',
      name: 'Supabase Anon Key',
      validate: (value) => value && value.length > 100 && value.startsWith('eyJ')
    }
  ];

  // Optional variables (with defaults)
  const optionalVars = [
    { key: 'EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID', name: 'Google iOS Client ID' },
    { key: 'EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID', name: 'Google Android Client ID' },
    { key: 'EXPO_PUBLIC_GOOGLE_REDIRECT_URL', name: 'Google Redirect URL' },
    { key: 'EXPO_PUBLIC_APP_ENV', name: 'App Environment' },
    { key: 'EXPO_PUBLIC_API_TIMEOUT', name: 'API Timeout' },
    { key: 'EXPO_PUBLIC_REALTIME_EVENTS_PER_SECOND', name: 'Realtime Events Per Second' }
  ];

  let allValid = true;

  // Check required variables
  console.log('📋 Required Variables:');
  requiredVars.forEach(({ key, name, validate }) => {
    const value = envVars[key];
    const isValid = validate ? validate(value) : !!value;
    
    if (isValid) {
      console.log(`   ✅ ${name}: Set correctly`);
    } else {
      console.log(`   ❌ ${name}: ${!value ? 'Missing' : 'Invalid format'}`);
      allValid = false;
    }
  });

  // Check optional variables
  console.log('\n📋 Optional Variables:');
  optionalVars.forEach(({ key, name }) => {
    const value = envVars[key];
    if (value) {
      console.log(`   ✅ ${name}: ${value}`);
    } else {
      console.log(`   ⚪ ${name}: Using default`);
    }
  });

  console.log('\n' + '='.repeat(45));
  
  if (allValid) {
    console.log('🎉 Environment configuration is valid!');
    console.log('🚀 Ready to start development');
    console.log('\n📖 Next steps:');
    console.log('   1. Set up database tables (see setup-supabase.md)');
    console.log('   2. Test authentication: npm start');
  } else {
    console.log('❌ Environment configuration has issues');
    console.log('🔧 Please fix the missing/invalid variables');
    console.log('📝 Run: npm run setup-env for guided setup');
  }

  return allValid;
}

// Run the check
checkEnvironment();
