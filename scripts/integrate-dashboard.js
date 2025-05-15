import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const DASHBOARD_DIR = path.join(__dirname, '..', 'client', 'src', 'dashboard');
const APP_ROUTES_PATH = path.join(__dirname, '..', 'client', 'src', 'App.tsx');
const DASHBOARD_PAGE_PATH = path.join(__dirname, '..', 'client', 'src', 'pages', 'Dashboard.tsx');

// Create the Dashboard page component
function createDashboardPage() {
  console.log('Creating Dashboard page component...');
  
  const dashboardPageContent = `import React from 'react';
import { FloHubLogoImage } from '@/assets/FloHubLogoImage';
import { FloCatImage } from '@/assets/FloCatImage';

// This is a temporary placeholder Dashboard page
// After running the integration script, this will be replaced with the actual dashboard

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex flex-col items-center justify-center h-screen">
        <FloHubLogoImage className="h-16 w-auto mb-6" />
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          FloHub Dashboard
        </h1>
        <div className="text-lg text-gray-600 max-w-md text-center mb-8">
          This is a placeholder for the FloHub dashboard. After running the integration script,
          this will be replaced with the actual dashboard components from the GitHub repository.
        </div>
        <div className="flex items-center justify-center">
          <FloCatImage className="h-32 w-auto" />
        </div>
      </div>
    </div>
  );
}
`;

  fs.writeFileSync(DASHBOARD_PAGE_PATH, dashboardPageContent);
  console.log('Dashboard page component created successfully!');
}

// Update App.tsx to include the Dashboard route
function updateAppRoutes() {
  console.log('Updating App routes...');
  
  // Read the current App.tsx
  const appContent = fs.readFileSync(APP_ROUTES_PATH, 'utf8');
  
  // Check if Dashboard import already exists
  if (appContent.includes('import Dashboard from')) {
    console.log('Dashboard route already exists in App.tsx');
    return;
  }
  
  // Add Dashboard import
  let updatedContent = appContent.replace(
    'import Updates from "@/pages/Updates";',
    'import Updates from "@/pages/Updates";\nimport Dashboard from "@/pages/Dashboard";'
  );
  
  // Add Dashboard route
  updatedContent = updatedContent.replace(
    '<Route path="/updates" component={Updates} />',
    '<Route path="/updates" component={Updates} />\n      <Route path="/dashboard" component={Dashboard} />'
  );
  
  // Write the updated content back
  fs.writeFileSync(APP_ROUTES_PATH, updatedContent);
  console.log('App routes updated successfully!');
}

// Create tsconfig path mapping for dashboard
function updateTsConfig() {
  console.log('Updating tsconfig.json with dashboard path mapping...');
  
  const tsConfigPath = path.join(__dirname, '..', 'tsconfig.json');
  
  if (!fs.existsSync(tsConfigPath)) {
    console.error('tsconfig.json not found!');
    return;
  }
  
  const tsConfig = JSON.parse(fs.readFileSync(tsConfigPath, 'utf8'));
  
  // Check if paths already exist
  if (!tsConfig.compilerOptions.paths) {
    tsConfig.compilerOptions.paths = {};
  }
  
  // Add dashboard path mapping if it doesn't exist
  if (!tsConfig.compilerOptions.paths['@/dashboard']) {
    tsConfig.compilerOptions.paths['@/dashboard'] = ['./client/src/dashboard'];
    tsConfig.compilerOptions.paths['@/dashboard/*'] = ['./client/src/dashboard/*'];
    
    // Write the updated config back
    fs.writeFileSync(tsConfigPath, JSON.stringify(tsConfig, null, 2));
    console.log('tsconfig.json updated successfully!');
  } else {
    console.log('Dashboard path mapping already exists in tsconfig.json');
  }
}

// Update vite.config.ts to include dashboard alias
function updateViteConfig() {
  console.log('Updating vite.config.ts with dashboard alias...');
  
  const viteConfigPath = path.join(__dirname, '..', 'vite.config.ts');
  
  if (!fs.existsSync(viteConfigPath)) {
    console.error('vite.config.ts not found!');
    return;
  }
  
  const viteConfig = fs.readFileSync(viteConfigPath, 'utf8');
  
  // Check if dashboard alias already exists
  if (viteConfig.includes('@/dashboard')) {
    console.log('Dashboard alias already exists in vite.config.ts');
    return;
  }
  
  // Add dashboard alias to resolve.alias
  const updatedViteConfig = viteConfig.replace(
    "'/home/runner/workspace/client/src/assets'",
    "'/home/runner/workspace/client/src/assets',\n        '@/dashboard': '/home/runner/workspace/client/src/dashboard'"
  );
  
  // Write the updated config back
  fs.writeFileSync(viteConfigPath, updatedViteConfig);
  console.log('vite.config.ts updated successfully!');
}

// Run the integration
function run() {
  try {
    // Create the dashboard directory if it doesn't exist
    if (!fs.existsSync(DASHBOARD_DIR)) {
      fs.mkdirSync(DASHBOARD_DIR, { recursive: true });
    }
    
    // Create the Dashboard page component
    createDashboardPage();
    
    // Update App.tsx to include the Dashboard route
    updateAppRoutes();
    
    // Update tsconfig.json with dashboard path mapping
    updateTsConfig();
    
    // Update vite.config.ts with dashboard alias
    updateViteConfig();
    
    console.log('Dashboard integration setup completed successfully!');
    console.log('Next steps:');
    console.log('1. Run "node scripts/clone-repo.js" to clone the FloHub repository and copy dashboard components');
    console.log('2. Restart the application with "npm run dev"');
    console.log('3. Access the dashboard at "/dashboard"');
  } catch (error) {
    console.error('Error during dashboard integration setup:', error);
  }
}

// Run the integration
run();