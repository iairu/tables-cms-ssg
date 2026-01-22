const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const NODE_VERSION = '22.18.0';
const NPM_VERSION = '11.7.0'; 

const BIN_ROOT = path.join(__dirname, '../electron-bin');
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
    // Windows: Download zip and extract specific file
    const zipPath = path.join(BIN_ROOT, 'node.zip');
    execSync(`curl -L -o "${zipPath}" "${nodeUrl}"`);
    // Use PowerShell to expand (standard on Win10+)
    execSync(`powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${tempNodeDir}'"`);
    
    const extractedDir = fs.readdirSync(tempNodeDir).find(d => d.startsWith('node-v'));
    fs.renameSync(path.join(tempNodeDir, extractedDir, 'node.exe'), finalNodePath);
  } else {
    // macOS/Linux: Stream tarball and extract only the node binary
    // The --strip-components logic depends on the internal folder structure of the Node tarball
    execSync(`curl -L ${nodeUrl} | tar -xz -C ${NPM_BIN_PATH} --strip-components=2 --wildcards "*/bin/node" || \
              curl -L ${nodeUrl} | tar -xz -C ${NPM_BIN_PATH} --strip-components=2 "*/bin/node"`);
  }

  // 4. Set Permissions
  if (process.platform !== 'win32') {
    fs.chmodSync(finalNodePath, '755');
  }

  console.log(`Setup complete. Node and NPM are ready in: ${NPM_BIN_PATH}`);
}

setupBinaries().catch(console.error);