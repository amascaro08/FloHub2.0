import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

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

// Clone the repository
function cloneRepository() {
  console.log(`Cloning repository from ${REPO_URL} to ${DEST_DIR}...`);
  
  try {
    // Remove existing directory if it exists
    if (fs.existsSync(DEST_DIR)) {
      execSync(`rm -rf ${DEST_DIR}`);
      fs.mkdirSync(DEST_DIR, { recursive: true });
    }
    
    // Clone the repository using git command
    execSync(`git clone --depth 1 ${REPO_URL} ${DEST_DIR}`);
    
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
    // Source directories from the cloned repo
    // First check the app/ui directory (newer Next.js structure)
    let sourceDashboardDir = path.join(DEST_DIR, 'app', 'ui');
    
    // If that doesn't exist, try the components directory (typical React structure)
    if (!fs.existsSync(sourceDashboardDir)) {
      sourceDashboardDir = path.join(DEST_DIR, 'components');
    }
    
    // If that doesn't exist, try the src directory (typical React structure)
    if (!fs.existsSync(sourceDashboardDir)) {
      sourceDashboardDir = path.join(DEST_DIR, 'src', 'components');
    }
    
    // Check if we found a valid source directory
    if (!fs.existsSync(sourceDashboardDir)) {
      console.error('Source dashboard directory not found. Tried:');
      console.error('- app/ui');
      console.error('- components');
      console.error('- src/components');
      
      // List all directories in the repo for debugging
      console.log('Available directories in repo:');
      execSync(`find ${DEST_DIR} -type d -not -path "*/\\.*" | sort`).toString()
        .split('\n')
        .forEach(dir => console.log(`- ${dir.replace(DEST_DIR, '')}`));
      
      return;
    }
    
    console.log(`Found source directory: ${sourceDashboardDir}`);
    
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
  try {
    // Use cp command for reliability
    execSync(`cp -r ${source}/* ${destination}`);
  } catch (error) {
    console.error(`Error copying from ${source} to ${destination}:`, error);
    
    // Fallback to manual copy
    console.log('Falling back to manual copy...');
    
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
        
        try {
          const itemStats = fs.statSync(sourcePath);
          
          if (itemStats.isDirectory()) {
            if (!fs.existsSync(destPath)) {
              fs.mkdirSync(destPath, { recursive: true });
            }
            copyDirectoryRecursively(sourcePath, destPath);
          } else {
            fs.copyFileSync(sourcePath, destPath);
          }
        } catch (err) {
          console.error(`Error copying ${sourcePath}:`, err);
        }
      }
    } else {
      // It's a file, copy it
      fs.copyFileSync(source, destination);
    }
  }
}

// Create an index.ts file to export all dashboard components
function createIndexFile() {
  const indexPath = path.join(DASHBOARD_DIR, 'index.ts');
  
  try {
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
  } catch (error) {
    console.error('Error creating index file:', error);
    
    // Create a basic index file as fallback
    const basicIndex = '// Basic index file for dashboard components\n\n// Import and export components as needed\n';
    fs.writeFileSync(indexPath, basicIndex);
    console.log('Created basic index file as fallback');
  }
}

// Run the clone function
cloneRepository();