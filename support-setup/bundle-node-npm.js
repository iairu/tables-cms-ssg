const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const NODE_VERSION = '22.18.0';

// Helper to determine Node Download URL
function getNodeUrl() {
  const platform = process.platform === 'win32' ? 'win' : process.platform;
  const arch = process.arch === 'ia32' ? 'x86' : process.arch;
  const extension = process.platform === 'win32' ? 'zip' : 'tar.gz';
  
  // Example: https://nodejs.org/dist/v22.18.0/node-v22.18.0-win-x64.zip
  return `https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-${platform}-${arch}.${extension}`;
}

async function setupBinaries(basePath) {
  const binRoot = basePath ? path.join(basePath, 'support-bin') : path.join(__dirname, '../support-bin');
  const npmSourceDir = path.join(binRoot, 'npm_source');
  const npmBinPath = path.join(npmSourceDir, 'bin');

  const nodeName = process.platform === 'win32' ? 'node.exe' : 'node';
  const finalNodePath = path.join(npmBinPath, nodeName);

  // 0. Check if already set up
  if (fs.existsSync(finalNodePath) && fs.existsSync(path.join(npmBinPath, 'npm-cli.js'))) {
    // Validate that it's a complete installation
    const utilsPath = path.join(npmSourceDir, 'lib', 'utils');
    const commandsPath = path.join(npmSourceDir, 'lib', 'commands');
    if (fs.existsSync(utilsPath) && fs.existsSync(commandsPath)) {
      console.log('Binaries already present and validated. Skipping.');
      return;
    } else {
      console.log('Incomplete installation detected. Re-downloading...');
    }
  }
  
  // 1. Clean and Prep
  if (fs.existsSync(binRoot)) fs.rmSync(binRoot, { recursive: true, force: true });
  fs.mkdirSync(npmSourceDir, { recursive: true });
  fs.mkdirSync(npmBinPath, { recursive: true });

  // 2. Download and Extract Node.js Full Distribution
  console.log(`Downloading Node.js v${NODE_VERSION} (includes npm)...`);
  const nodeUrl = getNodeUrl();
  const tempNodeDir = path.join(binRoot, 'node_temp');
  fs.mkdirSync(tempNodeDir, { recursive: true });

  try {
    if (process.platform === 'win32') {
      const zipPath = path.join(binRoot, 'node.zip');
      console.log('Downloading archive...');
      execSync(`curl -L -o "${zipPath}" "${nodeUrl}"`, { stdio: 'inherit' });
      
      console.log('Extracting archive...');
      execSync(`powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${tempNodeDir}'"`, { stdio: 'inherit' });
      
      const extractedDir = fs.readdirSync(tempNodeDir).find(d => d.startsWith('node-v'));
      if (!extractedDir) throw new Error('Could not find extracted Node.js directory.');

      const extractedPath = path.join(tempNodeDir, extractedDir);
      
      // Copy node.exe to our bin directory
      fs.copyFileSync(path.join(extractedPath, 'node.exe'), finalNodePath);
      
      // Copy the entire npm from node_modules to our npm_source
      const nodeModulesNpm = path.join(extractedPath, 'node_modules', 'npm');
      if (!fs.existsSync(nodeModulesNpm)) {
        throw new Error('npm not found in Node.js distribution');
      }
      
      console.log('Copying npm from Node.js distribution...');
      copyRecursive(nodeModulesNpm, npmSourceDir);
      
      fs.rmSync(tempNodeDir, { recursive: true, force: true });
      fs.rmSync(zipPath);
    } else {
      const tarballPath = path.join(binRoot, 'node.tar.gz');
      console.log('Downloading archive...');
      execSync(`curl -L -o "${tarballPath}" "${nodeUrl}"`, { stdio: 'inherit' });
      
      console.log('Extracting archive...');
      execSync(`tar -xzf "${tarballPath}" -C "${tempNodeDir}"`, { stdio: 'inherit' });
      
      const extractedDir = fs.readdirSync(tempNodeDir).find(d => d.startsWith('node-v'));
      if (!extractedDir) throw new Error('Could not find extracted Node.js directory.');
      
      const extractedPath = path.join(tempNodeDir, extractedDir);
      
      // Copy node binary to our bin directory
      const extractedNodePath = path.join(extractedPath, 'bin', 'node');
      fs.copyFileSync(extractedNodePath, finalNodePath);
      fs.chmodSync(finalNodePath, '755');
      
      // Copy the entire npm from lib/node_modules to our npm_source
      const nodeModulesNpm = path.join(extractedPath, 'lib', 'node_modules', 'npm');
      if (!fs.existsSync(nodeModulesNpm)) {
        throw new Error('npm not found in Node.js distribution');
      }
      
      console.log('Copying npm from Node.js distribution...');
      copyRecursive(nodeModulesNpm, npmSourceDir);
      
      fs.rmSync(tempNodeDir, { recursive: true, force: true });
      fs.rmSync(tarballPath);
    }

    // 3. Verify critical directories exist
    console.log('Verifying npm installation...');
    const utilsPath = path.join(npmSourceDir, 'lib', 'utils');
    const commandsPath = path.join(npmSourceDir, 'lib', 'commands');
    const nodeModulesPath = path.join(npmSourceDir, 'node_modules');
    const npmCliPath = path.join(npmSourceDir, 'bin', 'npm-cli.js');
    
    const missingPaths = [];
    if (!fs.existsSync(utilsPath)) missingPaths.push('lib/utils');
    if (!fs.existsSync(commandsPath)) missingPaths.push('lib/commands');
    if (!fs.existsSync(nodeModulesPath)) missingPaths.push('node_modules');
    if (!fs.existsSync(npmCliPath)) missingPaths.push('bin/npm-cli.js');
    
    if (missingPaths.length > 0) {
      throw new Error(`npm installation incomplete. Missing: ${missingPaths.join(', ')}`);
    }

    console.log('npm setup completed successfully.');
    console.log(`Node.js binary: ${finalNodePath}`);
    console.log(`npm-cli.js: ${npmCliPath}`);
    console.log(`Setup complete. Binaries are ready in: ${binRoot}`);
    
  } catch (error) {
    console.error('Failed to set up npm:', error.message);
    console.error(error.stack);
    
    // Clean up on failure
    if (fs.existsSync(binRoot)) {
      fs.rmSync(binRoot, { recursive: true, force: true });
    }
    
    throw error;
  }
}

// Recursive copy helper
function copyRecursive(src, dest) {
  const stats = fs.statSync(src);
  
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    const entries = fs.readdirSync(src);
    for (const entry of entries) {
      const srcPath = path.join(src, entry);
      const destPath = path.join(dest, entry);
      copyRecursive(srcPath, destPath);
    }
  } else if (stats.isFile()) {
    fs.copyFileSync(src, dest);
    
    // Preserve execute permissions on Unix-like systems
    if (process.platform !== 'win32') {
      const srcMode = fs.statSync(src).mode;
      if (srcMode & 0o111) { // If any execute bit is set
        fs.chmodSync(dest, srcMode);
      }
    }
  } else if (stats.isSymbolicLink()) {
    const linkTarget = fs.readlinkSync(src);
    fs.symlinkSync(linkTarget, dest);
  }
}

function getPackageManager(basePath) {
  const binRoot = basePath ? path.join(basePath, 'support-bin') : path.join(__dirname, '../support-bin');
  const npmCliPath = path.join(binRoot, 'npm_source', 'bin', 'npm-cli.js');
  
  if (!fs.existsSync(npmCliPath)) {
    throw new Error('npm-cli.js not found. Please run bundle-node-npm.js first.');
  }
  
  return { name: 'npm', path: npmCliPath };
}

if (require.main === module) {
  setupBinaries().catch((error) => {
    console.error('Setup failed:', error.message);
    process.exit(1);
  });
}

module.exports = { setupBinaries, getPackageManager };