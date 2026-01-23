const output = document.getElementById('output');
const progressBar = document.getElementById('progress-bar');
const statusText = document.getElementById('status-text');
const closeBtn = document.getElementById('close-btn');
const commandInput = document.getElementById('command-input');
const executeButton = document.getElementById('execute-button');

let consoleMode = false;
let startupCompleted = false;

// More granular progress stages based on actual Gatsby startup sequence
const progressStages = [
  { key: 'Binaries already present', progress: 2, status: 'Validating binaries...' },
  { key: 'Binaries validated successfully', progress: 5, status: 'Environment ready.' },
  { key: 'Running npm install', progress: 8, status: 'Checking dependencies...' },
  { key: 'audited', progress: 15, status: 'Dependencies verified.' },
  { key: 'npm install completed', progress: 18, status: 'Dependencies ready.' },
  { key: 'Running gatsby develop', progress: 20, status: 'Starting Gatsby...' },
  { key: 'success compile gatsby files', progress: 25, status: 'Compiling Gatsby files...' },
  { key: 'success load gatsby config', progress: 28, status: 'Loading configuration...' },
  { key: 'success load plugins', progress: 32, status: 'Loading plugins...' },
  { key: 'success onPreInit', progress: 35, status: 'Pre-initializing...' },
  { key: 'success initialize cache', progress: 38, status: 'Initializing cache...' },
  { key: 'success copy gatsby files', progress: 42, status: 'Copying Gatsby files...' },
  { key: 'success Compiling Gatsby Functions', progress: 46, status: 'Compiling functions...' },
  { key: 'success onPreBootstrap', progress: 50, status: 'Pre-bootstrapping...' },
  { key: 'success createSchemaCustomization', progress: 54, status: 'Creating schema...' },
  { key: 'success Clean up stale nodes', progress: 57, status: 'Cleaning up nodes...' },
  { key: 'success Checking for changed pages', progress: 60, status: 'Checking pages...' },
  { key: 'success source and transform nodes', progress: 63, status: 'Transforming nodes...' },
  { key: 'success building schema', progress: 66, status: 'Building schema...' },
  { key: 'success createPages', progress: 69, status: 'Creating pages...' },
  { key: 'success createPagesStatefully', progress: 72, status: 'Creating pages statefully...' },
  { key: 'success write out redirect data', progress: 75, status: 'Writing redirects...' },
  { key: 'success onPostBootstrap', progress: 78, status: 'Post-bootstrapping...' },
  { key: 'bootstrap finished', progress: 81, status: 'Bootstrap complete.' },
  { key: 'success onPreExtractQueries', progress: 84, status: 'Preparing query extraction...' },
  { key: 'success extract queries from components', progress: 87, status: 'Extracting queries...' },
  { key: 'success write out requires', progress: 90, status: 'Writing requirements...' },
  { key: 'Detected final build step', progress: 92, status: 'Starting development server...' },
  { key: 'Waiting for Gatsby server', progress: 93, status: 'Waiting for server...' },
  { key: 'Gatsby development server is ready', progress: 95, status: 'Server ready!' },
  { key: 'You can now view', progress: 96, status: 'Application ready!' },
  { key: 'success Building development bundle', progress: 98, status: 'Building bundle...' },
  { key: 'success Writing page-data', progress: 99, status: 'Writing page data...' },
];

let currentProgress = 0;
let targetProgress = 0;
let progressInterval = null;
let lastStageIndex = -1;

// Smooth progress animation
const startProgressAnimation = (target) => {
  targetProgress = Math.min(target, 100);
  if (progressInterval) {
    clearInterval(progressInterval);
  }
  
  const increment = (targetProgress - currentProgress) / 50; // Smooth over ~5 seconds
  
  progressInterval = setInterval(() => {
    if (currentProgress < targetProgress) {
      currentProgress += Math.max(increment, 0.5);
      if (currentProgress > targetProgress) {
        currentProgress = targetProgress;
      }
      progressBar.style.width = `${currentProgress}%`;
    } else {
      clearInterval(progressInterval);
      progressInterval = null;
    }
  }, 100);
};

// Handle console output and update progress
window.electron.onConsoleOutput((msg) => {
  output.innerHTML += msg + "\n";
  output.scrollTop = output.scrollHeight;

  // Check if entering console mode due to error
  if (msg.includes('💡 Interactive console mode enabled') || msg.includes('💡 Entering console mode')) {
    consoleMode = true;
    statusText.textContent = '⚠️ Console Mode - Debug & Run Commands';
    progressBar.style.background = 'linear-gradient(90deg, #ff9500, #ff6b00)';
    if (progressInterval) {
      clearInterval(progressInterval);
    }
    showConsoleHelp();
    return;
  }

  // Check for completion signal
  if (msg.includes('BUILD_END') || msg.includes('Writing page-data.json files to public directory')) {
    if (progressInterval) {
      clearInterval(progressInterval);
    }
    currentProgress = 100;
    targetProgress = 100;
    progressBar.style.width = '100%';
    statusText.textContent = '✓ Ready! Opening application...';
    progressBar.style.background = 'linear-gradient(90deg, #34c759, #30d158)';
    startupCompleted = true;
    return;
  }

  // Match progress stages
  for (let i = 0; i < progressStages.length; i++) {
    const stage = progressStages[i];
    
    // Only process stages we haven't seen yet
    if (i > lastStageIndex && msg.toLowerCase().includes(stage.key.toLowerCase())) {
      lastStageIndex = i;
      statusText.textContent = stage.status;
      startProgressAnimation(stage.progress);
      
      // Update color as we progress
      if (stage.progress < 50) {
        progressBar.style.background = 'linear-gradient(90deg, #007aff, #5ac8fa)';
      } else if (stage.progress < 90) {
        progressBar.style.background = 'linear-gradient(90deg, #5ac8fa, #32ade6)';
      } else {
        progressBar.style.background = 'linear-gradient(90deg, #32ade6, #34c759)';
      }
      
      break;
    }
  }
  
  // Fallback: if we haven't made progress in a while, slowly increment
  if (!progressInterval && currentProgress < 90 && currentProgress < targetProgress - 1) {
    startProgressAnimation(currentProgress + 2);
  }
});

// Show helpful console commands
const showConsoleHelp = () => {
  const helpText = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 CONSOLE MODE - Helpful Commands
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Common debugging commands:
  ls                    - List files in cms-site directory
  pwd                   - Show current working directory
  npm install           - Reinstall dependencies
  npm run develop       - Start Gatsby manually
  node --version        - Check Node.js version
  
File operations:
  rm -rf node_modules   - Remove node_modules
  rm package-lock.json  - Remove package lock
  
Navigation:
  cd ..                 - Go up one directory
  ls support-bin        - Check support-bin contents
  
Type a command above and click Execute to run it.
Close the window when done debugging.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;
  output.innerHTML += helpText;
  output.scrollTop = output.scrollHeight;
};

// Close button handler
if (closeBtn) {
  closeBtn.addEventListener('click', () => {
    window.electron.closeApp();
  });
}

// Command execution
const executeCommand = () => {
  const command = commandInput.value.trim();
  if (command) {
    // Show command in console
    const timestamp = new Date().toLocaleTimeString();
    output.innerHTML += `<span style="color: #5ac8fa;">[${timestamp}] $ ${command}</span>\n`;
    output.scrollTop = output.scrollHeight;
    
    // Execute command
    window.electron.runCommand(command);
    commandInput.value = '';
    
    // Show helpful suggestions based on command
    if (command === 'help') {
      showConsoleHelp();
    }
  }
};

executeButton.addEventListener('click', executeCommand);
commandInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    executeCommand();
  }
});

// Add command history with up/down arrows
let commandHistory = [];
let historyIndex = -1;

commandInput.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (historyIndex < commandHistory.length - 1) {
      historyIndex++;
      commandInput.value = commandHistory[commandHistory.length - 1 - historyIndex];
    }
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (historyIndex > 0) {
      historyIndex--;
      commandInput.value = commandHistory[commandHistory.length - 1 - historyIndex];
    } else if (historyIndex === 0) {
      historyIndex = -1;
      commandInput.value = '';
    }
  } else if (e.key === 'Enter') {
    const cmd = commandInput.value.trim();
    if (cmd && (commandHistory.length === 0 || commandHistory[commandHistory.length - 1] !== cmd)) {
      commandHistory.push(cmd);
      historyIndex = -1;
    }
    executeCommand();
  }
});

// Start with initial animation
statusText.textContent = 'Initializing...';
startProgressAnimation(2);