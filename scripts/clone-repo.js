import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as git from 'isomorphic-git';
import http from 'isomorphic-git/http/node';
import { HttpsProxyAgent } from 'https-proxy-agent';

// Get dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure directory where to clone the repository
const REPO_URL = 'https://github.com/amascaro08/FloHub.git';
const DEST_DIR = path.join(__dirname, '..', 'flohub-repo');
const DASHBOARD_DIR = path.join(__dirname, '..', 'client', 'src', 'dashboard');

// Create destination directory if it doesn't exist
if (!fs.existsSync(DEST_DIR)) {
  fs.mkdirSync(DEST_DIR, { recursive: true });
}

// Create dashboard directory if it doesn't exist
if (!fs.existsSync(DASHBOARD_DIR)) {
  fs.mkdirSync(DASHBOARD_DIR, { recursive: true });
}

// Handle proxy if needed
const agent = process.env.HTTPS_PROXY 
  ? new HttpsProxyAgent(process.env.HTTPS_PROXY) 
  : undefined;

// Clone the repository
async function cloneRepository() {
  console.log(`Cloning repository from ${REPO_URL} to ${DEST_DIR}...`);
  
  try {
    await git.clone({
      fs,
      http,
      dir: DEST_DIR,
      url: REPO_URL,
      singleBranch: true,
      depth: 1,
      agent
    });
    
    console.log('Repository cloned successfully!');
    console.log('Copying dashboard components to our app...');
    
    // Copy the dashboard components to our app
    copyDashboardComponents();
    
  } catch (error) {
    console.error('Error cloning repository:', error);
  }
}

// Function to copy dashboard components to our app
function copyDashboardComponents() {
  try {
    // Source directory from the cloned repo
    const sourceDashboardDir = path.join(DEST_DIR, 'app', 'ui');
    
    // Check if the directory exists
    if (!fs.existsSync(sourceDashboardDir)) {
      console.error('Source dashboard directory not found');
      return;
    }
    
    // Copy all dashboard components recursively
    copyDirectoryRecursively(sourceDashboardDir, DASHBOARD_DIR);
    
    console.log('Dashboard components copied successfully!');
    console.log(`You can now import dashboard components from '@/dashboard'`);
    
    // Create an index.ts file to export all dashboard components
    createIndexFile();
    
  } catch (error) {
    console.error('Error copying dashboard components:', error);
  }
}

// Helper function to copy directory recursively
function copyDirectoryRecursively(source, destination) {
  // Check if the source is a directory
  const stats = fs.statSync(source);
  
  if (stats.isDirectory()) {
    // Create destination directory if it doesn't exist
    if (!fs.existsSync(destination)) {
      fs.mkdirSync(destination, { recursive: true });
    }
    
    // Read the source directory
    const files = fs.readdirSync(source);
    
    // Copy each file/directory
    for (const file of files) {
      const sourcePath = path.join(source, file);
      const destPath = path.join(destination, file);
      
      copyDirectoryRecursively(sourcePath, destPath);
    }
  } else {
    // It's a file, copy it
    fs.copyFileSync(source, destination);
  }
}

// Create an index.ts file to export all dashboard components
function createIndexFile() {
  const indexPath = path.join(DASHBOARD_DIR, 'index.ts');
  const files = fs.readdirSync(DASHBOARD_DIR);
  
  let indexContent = '// Auto-generated index file for dashboard components\n\n';
  
  for (const file of files) {
    if (file === 'index.ts') continue;
    
    if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      // Get the file name without extension
      const fileName = file.replace(/\.(tsx|ts)$/, '');
      indexContent += `export * from './${fileName}';\n`;
    }
  }
  
  fs.writeFileSync(indexPath, indexContent);
  console.log('Index file created successfully!');
}

// Run the clone function
cloneRepository();