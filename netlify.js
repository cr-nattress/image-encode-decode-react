// Netlify build script
const { execSync } = require('child_process');

// Log the Node and npm versions
console.log('Node version:', process.version);
console.log('npm version:', execSync('npm --version').toString().trim());

// Set environment variables
process.env.CI = '';
process.env.GENERATE_SOURCEMAP = 'false';

try {
  // Install dependencies with legacy peer deps flag
  console.log('Installing dependencies...');
  execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });
  
  // Build the application using CRACO
  console.log('Building application...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
