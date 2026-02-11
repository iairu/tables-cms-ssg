const output = document.getElementById('output');
const progressBar = document.getElementById('progress-bar');
const statusText = document.getElementById('status-text');
const closeBtn = document.getElementById('close-btn');
const commandInput = document.getElementById('command-input');
const executeButton = document.getElementById('execute-button');

let consoleMode = false;
let startupCompleted = false;

// More granular progress stages based on Gatsby build + Express server sequence
const progressStages = [
  { key: 'Binaries already present', progress: 2, status: 'Validating binaries...' },
  { key: 'Binaries validated successfully', progress: 5, status: 'Environment ready.' },
  { key: 'Running npm install', progress: 8, status: 'Installing dependencies (this may take a long time)...' },
  { key: 'audited', progress: 15, status: 'Dependencies verified.' },
  { key: 'npm install completed', progress: 18, status: 'Dependencies ready.' },
  // Fast path: existing build found
  { key: 'Existing build found', progress: 85, status: 'Cached build found, skipping rebuild!' },
  // Build path: gatsby build stages
  { key: 'Running gatsby build', progress: 20, status: 'Building site...' },
  { key: 'success compile gatsby files', progress: 25, status: 'Compiling Gatsby files...' },
  { key: 'success load gatsby config', progress: 28, status: 'Loading configuration...' },
  { key: 'success load plugins', progress: 32, status: 'Loading plugins...' },
  { key: 'success onPreInit', progress: 35, status: 'Pre-initializing...' },
  { key: 'success initialize cache', progress: 38, status: 'Initializing cache...' },
  { key: 'success copy gatsby files', progress: 42, status: 'Copying Gatsby files...' },
  { key: 'success Compiling Gatsby Functions', progress: 46, status: 'Compiling functions...' },
  { key: 'success onPreBootstrap', progress: 50, status: 'Pre-bootstrapping...' },
  { key: 'success createSchemaCustomization', progress: 54, status: 'Creating schema...' },
  { key: 'success source and transform nodes', progress: 58, status: 'Transforming nodes...' },
  { key: 'success building schema', progress: 62, status: 'Building schema...' },
  { key: 'success createPages', progress: 66, status: 'Creating pages...' },
  { key: 'success extract queries from components', progress: 70, status: 'Extracting queries...' },
  { key: 'success write out requires', progress: 74, status: 'Writing requirements...' },
  { key: 'Building production JavaScript', progress: 78, status: 'Building production bundle...' },
  { key: 'Building HTML renderer', progress: 82, status: 'Building HTML renderer...' },
  { key: 'Building static HTML', progress: 85, status: 'Generating static HTML...' },
  { key: 'Gatsby build completed', progress: 88, status: 'Build complete!' },
  // Server start (both paths converge here)
  { key: 'Starting CMS server', progress: 90, status: 'Starting CMS server...' },
  { key: '[CMS Server] Running on', progress: 95, status: 'Server ready!' },
  { key: 'CMS server is ready', progress: 96, status: 'Application ready!' }
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
    statusText.textContent = '⚠️ Please close and start the app again. If problem persists, contact support@iairu.com.';
    progressBar.style.background = 'orange';
    if (progressInterval) {
      clearInterval(progressInterval);
    }
    showConsoleHelp();
    return;
  }

  // Check for completion signal
  if (msg.includes('BUILD_END') || msg.includes('CMS server is ready') || msg.includes('[CMS Server] Running on')) {
    if (progressInterval) {
      clearInterval(progressInterval);
    }
    currentProgress = 100;
    targetProgress = 100;
    progressBar.style.width = '100%';
    statusText.textContent = '✓ Ready! Opening application...';
    progressBar.style.background = '#007bff';
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
        progressBar.style.background = '#007bff';
      } else if (stage.progress < 90) {
        progressBar.style.background = '#007bff';
      } else {
        progressBar.style.background = '#007bff';
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