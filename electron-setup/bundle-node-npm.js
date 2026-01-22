// This script runs after npm install to set up Node and npm binaries for use by electron
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const installArchSpecificPackage = require('node-bin-setup');

const NODE_VERSION = '22.18.0';
const NPM_VERSION = '11.7.0'; 

const BIN_ROOT = path.join(__dirname, '../electron-bin');
const NPM_SOURCE_DIR = path.join(BIN_ROOT, 'npm_source');
const TARBALL_URL = `https://registry.npmjs.org/npm/-/npm-${NPM_VERSION}.tgz`;

async function setupBinaries() {
  // 1. Clear the electron-bin folder contents first
  if (fs.existsSync(BIN_ROOT)) {
    console.log(`Cleaning up ${BIN_ROOT}...`);
    fs.rmSync(BIN_ROOT, { recursive: true, force: true });
  }
  fs.mkdirSync(BIN_ROOT, { recursive: true });

  // 2. Install Node Binaries
  console.log('Installing Node.js binaries...');
  installArchSpecificPackage(NODE_VERSION, require);

  // 3. Move Node from the autocreated 'bin' folder to 'electron-bin'
  // node-bin-setup usually creates a folder named 'bin' in the project root or script parent
  const autocreatedBin = path.join(__dirname, '../bin'); 
  const nodeName = process.platform === 'win32' ? 'node.exe' : 'node';
  const oldNodePath = path.join(autocreatedBin, nodeName);
  const newNodePath = path.join(BIN_ROOT, nodeName);

  if (fs.existsSync(oldNodePath)) {
    console.log(`Moving node binary to ${BIN_ROOT}...`);
    fs.renameSync(oldNodePath, newNodePath);

    // Remove the autocreated bin folder if empty
    if (fs.readdirSync(autocreatedBin).length === 0) {
      fs.rmdirSync(autocreatedBin);
      console.log('Removed empty autocreated bin folder.');
    }
  }

  // 4. Download and Extract npm
  fs.mkdirSync(NPM_SOURCE_DIR, { recursive: true });
  console.log(`Downloading npm v${NPM_VERSION}...`);
  execSync(`curl -L ${TARBALL_URL} | tar -xz -C ${NPM_SOURCE_DIR} --strip-components=1`);

  // 5. Move npm binaries (npm, npx) to BIN_ROOT
  // Define the destination inside npm_source
  const npmBinPath = path.join(NPM_SOURCE_DIR, 'bin');
  
  // Ensure the destination bin directory exists
  if (!fs.existsSync(npmBinPath)) {
    fs.mkdirSync(npmBinPath, { recursive: true });
  }
  
  // Read the root electron-bin directory
  if (fs.existsSync(BIN_ROOT)) {
    const files = fs.readdirSync(BIN_ROOT);
    
    files.forEach(file => {
      const oldPath = path.join(BIN_ROOT, file);
      const newPath = path.join(npmBinPath, file);
  
      // Skip the npm_source directory itself to avoid recursive errors
      if (file === 'npm_source') return;
  
      // Get file stats to check if it's a file (not a directory)
      const stats = fs.statSync(oldPath);
      
      if (stats.isFile()) {
        // Logic: Move if it's a binary, a windows command, or a javascript file
        const isBinary = !file.includes('.') || file.endsWith('.exe') || file.endsWith('.cmd') || file.endsWith('.js');
  
        if (isBinary) {
          console.log(`Moving ${file} to ${npmBinPath}...`);
          fs.renameSync(oldPath, newPath);
          
          // Ensure execution permissions for Unix
          if (process.platform !== 'win32') {
            fs.chmodSync(newPath, '755');
          }
        }
      }
    });
    console.log('All binaries and scripts consolidated into npm_source/bin');
  }
  
  console.log(`Setup complete. All binaries located in: ${BIN_ROOT}`);
}

setupBinaries().catch(console.error);