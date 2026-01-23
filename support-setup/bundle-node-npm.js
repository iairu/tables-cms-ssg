const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const NODE_VERSION = '22.18.0';
const NPM_VERSION = '11.7.0'; 

const BIN_ROOT = path.join(__dirname, '../support-bin');
const NPM_SOURCE_DIR = path.join(BIN_ROOT, 'npm_source');
const NPM_BIN_PATH = path.join(NPM_SOURCE_DIR, 'bin');

// Helper to determine Node Download URL
function getNodeUrl() {
  const platform = process.platform === 'win32' ? 'win' : process.platform;
  const arch = process.arch === 'ia32' ? 'x86' : process.arch;
  const extension = process.platform === 'win32' ? 'zip' : 'tar.gz';
  
  // Example: https://nodejs.org/dist/v22.18.0/node-v22.18.0-win-x64.zip
  return `https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-${platform}-${arch}.${extension}`;
}

async function setupBinaries() {
  const nodeName = process.platform === 'win32' ? 'node.exe' : 'node';
  const finalNodePath = path.join(NPM_BIN_PATH, nodeName);

  // 0. Check if already set up
  if (fs.existsSync(finalNodePath) && fs.existsSync(path.join(NPM_BIN_PATH, 'npm-cli.js'))) {
    console.log('Binaries already present. Skipping.');
    return;
  }

  // 1. Clean and Prep
  if (fs.existsSync(BIN_ROOT)) fs.rmSync(BIN_ROOT, { recursive: true, force: true });
  fs.mkdirSync(NPM_SOURCE_DIR, { recursive: true });
  fs.mkdirSync(NPM_BIN_PATH, { recursive: true });

  // 2. Download and Extract NPM
  console.log(`Downloading npm v${NPM_VERSION}...`);
  const npmUrl = `https://registry.npmjs.org/npm/-/npm-${NPM_VERSION}.tgz`;
  execSync(`curl -L ${npmUrl} | tar -xz -C ${NPM_SOURCE_DIR} --strip-components=1`);

  // 3. Download and Extract Node.js Binary
  console.log(`Downloading Node.js v${NODE_VERSION}...`);
  const nodeUrl = getNodeUrl();
  const tempNodeDir = path.join(BIN_ROOT, 'node_temp');
  fs.mkdirSync(tempNodeDir, { recursive: true });

  if (process.platform === 'win32') {
    // Windows: Download zip, extract, and move the node binary
    const zipPath = path.join(BIN_ROOT, 'node.zip');
    execSync(`curl -L -o "${zipPath}" "${nodeUrl}"`);
    execSync(`powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${tempNodeDir}'"`);
    
    const extractedDir = fs.readdirSync(tempNodeDir).find(d => d.startsWith('node-v'));
    if (!extractedDir) throw new Error('Could not find extracted Node.js directory.');

    fs.renameSync(path.join(tempNodeDir, extractedDir, 'node.exe'), finalNodePath);

    // Clean up
    fs.rmSync(tempNodeDir, { recursive: true, force: true });
    fs.rmSync(zipPath);

  } else {
    // macOS/Linux: Download tarball, extract, and move the node binary
    const tarballPath = path.join(BIN_ROOT, 'node.tar.gz');
    execSync(`curl -L -o "${tarballPath}" "${nodeUrl}"`);
    execSync(`tar -xzf "${tarballPath}" -C "${tempNodeDir}"`);
    
    const extractedDir = fs.readdirSync(tempNodeDir).find(d => d.startsWith('node-v'));
    if (!extractedDir) {
      throw new Error('Could not find extracted Node.js directory.');
    }
    
    const extractedNodePath = path.join(tempNodeDir, extractedDir, 'bin', 'node');
    fs.renameSync(extractedNodePath, finalNodePath);
    
    // Clean up the extracted files and tarball
    fs.rmSync(tempNodeDir, { recursive: true, force: true });
    fs.rmSync(tarballPath);
  }

  // 4. Set Permissions
  if (process.platform !== 'win32') {
    fs.chmodSync(finalNodePath, '755');
  }

  console.log(`Setup complete. Node and NPM are ready in: ${NPM_BIN_PATH}`);
}

setupBinaries().catch(console.error);