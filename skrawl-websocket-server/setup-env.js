/**
 * Environment setup script for Skrawl WebSocket Server
 * Helps configure the .env file with proper values
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function setupEnvironment() {
  console.log('🚀 Skrawl WebSocket Server Environment Setup');
  console.log('============================================\n');

  if (fs.existsSync(envPath)) {
    const overwrite = await askQuestion('⚠️  .env file already exists. Overwrite? (y/N): ');
    if (overwrite.toLowerCase() !== 'y') {
      console.log('✅ Setup cancelled. Existing .env file preserved.');
      rl.close();
      return;
    }
  }

  console.log('📋 Please provide your Supabase configuration:');
  console.log('   (You can find these in your Supabase Dashboard > Settings > API)\n');

  // Get Supabase configuration
  const supabaseUrl = await askQuestion('🔗 Supabase URL (default: https://rtvqfvaprpovtcmtyqht.supabase.co): ');
  const serviceRoleKey = await askQuestion('🔑 Supabase Service Role Key (KEEP SECRET!): ');
  const anonKey = await askQuestion('🔓 Supabase Anon Key: ');

  if (!serviceRoleKey.trim() || !anonKey.trim()) {
    console.error('❌ Both Service Role Key and Anon Key are required!');
    rl.close();
    return;
  }

  // Optional: JWT secret
  const jwtSecret = await askQuestion('🔐 JWT Secret (press Enter for auto-generated): ');
  const finalJwtSecret = jwtSecret.trim() || require('crypto').randomBytes(64).toString('hex');

  // Optional: Server port
  const port = await askQuestion('🌐 Server Port (default: 3001): ');
  const finalPort = port.trim() || '3001';

  // Read template file
  let envContent = fs.readFileSync(envExamplePath, 'utf8');

  // Replace placeholders
  envContent = envContent.replace(
    'SUPABASE_URL=https://rtvqfvaprpovtcmtyqht.supabase.co',
    `SUPABASE_URL=${supabaseUrl.trim() || 'https://rtvqfvaprpovtcmtyqht.supabase.co'}`
  );
  
  envContent = envContent.replace(
    'SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here',
    `SUPABASE_SERVICE_ROLE_KEY=${serviceRoleKey.trim()}`
  );
  
  envContent = envContent.replace(
    'SUPABASE_ANON_KEY=your_supabase_anon_key_here',
    `SUPABASE_ANON_KEY=${anonKey.trim()}`
  );
  
  envContent = envContent.replace(
    'JWT_SECRET=your_jwt_secret_here',
    `JWT_SECRET=${finalJwtSecret}`
  );
  
  envContent = envContent.replace(
    'PORT=3001',
    `PORT=${finalPort}`
  );

  // Write .env file
  fs.writeFileSync(envPath, envContent);

  console.log('\n✅ Environment configuration completed!');
  console.log('📁 .env file created successfully');
  console.log('\n🚀 You can now start the server with:');
  console.log('   npm run dev     (development mode)');
  console.log('   npm run build   (build for production)');
  console.log('   npm start       (production mode)');
  console.log('\n🔒 Security Notes:');
  console.log('   • Keep your Service Role Key secret!');
  console.log('   • Never commit .env to version control');
  console.log('   • Use environment variables in production');

  rl.close();
}

setupEnvironment().catch((error) => {
  console.error('❌ Setup failed:', error);
  rl.close();
  process.exit(1);
});
