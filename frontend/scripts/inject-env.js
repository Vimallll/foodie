// Script to inject environment variables into public/env-config.js
// This runs before the build/start process

const fs = require('fs');
const path = require('path');

// Load .env file manually (since React's dotenv hasn't loaded yet in pre-scripts)
const envPath = path.join(__dirname, '../.env');
let envKey = '';

if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    // Skip comments and empty lines
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const match = trimmedLine.match(/^([^=:#]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        // Remove quotes if present
        value = value.replace(/^["']|["']$/g, '');
        process.env[key] = value;
        if (key === 'REACT_APP_GOOGLE_MAPS_API_KEY') {
          envKey = value;
        }
      }
    }
  });
}

// Also check if already set in process.env (from React's environment loading)
if (!envKey && process.env.REACT_APP_GOOGLE_MAPS_API_KEY) {
  envKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
}

const envConfigPath = path.join(__dirname, '../public/env-config.js');

if (!envKey) {
  console.warn('⚠️  REACT_APP_GOOGLE_MAPS_API_KEY not found in frontend/.env file');
  console.warn('   Please create frontend/.env with: REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key');
  console.warn('   Note: The API key should be in frontend/.env, not backend/.env');
} else {
  console.log('✅ Found Google Maps API key in frontend/.env');
}

const envConfigContent = `// This file is auto-generated - do not edit manually
// Environment variables are injected here at build/runtime
window.ENV = {
  REACT_APP_GOOGLE_MAPS_API_KEY: '${envKey}'
};
`;

fs.writeFileSync(envConfigPath, envConfigContent, 'utf8');
console.log('✅ Environment config updated - API Key:', envKey ? `${envKey.substring(0, 15)}...` : 'NOT FOUND');

