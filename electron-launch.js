const output = document.getElementById('output');
const progressBar = document.getElementById('progress-bar');
const statusText = document.getElementById('status-text');
const closeBtn = document.getElementById('close-btn');

const progressStages = [
  { key: 'Checking for Node.js and npm...', progress: 10, status: 'Checking environment...' },
  { key: 'Node.js and npm found.', progress: 20, status: 'Environment checked.' },
  { key: 'Running npm install...', progress: 30, status: 'Installing dependencies...' },
  { key: 'npm install completed successfully.', progress: 50, status: 'Dependencies installed.' },
  { key: 'Starting Gatsby development server...', progress: 60, status: 'Starting server...' },
  { key: 'success compile gatsby files', progress: 70, status: 'Compiling files...' },
  { key: 'success onPreBootstrap', progress: 80, status: 'Bootstrapping...' },
  { key: 'bootstrap finished', progress: 90, status: 'Finishing up...' },
  { key: 'success extract queries from components', progress: 95, status: 'Extracting queries...' },
  { key: 'You can now view tables-cms in the browser.', progress: 100, status: 'Ready!' },
];

let currentProgress = 0;
let targetProgress = 0;
let progressInterval = null;

const startProgressAnimation = (target) => {
  targetProgress = target;
  if (progressInterval) {
    clearInterval(progressInterval);
  }
  progressInterval = setInterval(() => {
    if (currentProgress < targetProgress) {
      currentProgress += 0.1;
      progressBar.style.width = `${currentProgress}%`;
    } else {
      clearInterval(progressInterval);
    }
  }, 100);
};

window.electron.onConsoleOutput((msg) => {
  output.innerHTML += msg + "\n";
  output.scrollTop = output.scrollHeight;

  if (msg.includes('BUILD_END')) {
    if (progressInterval) {
      clearInterval(progressInterval);
    }
    currentProgress = 100;
    progressBar.style.width = '100%';
    statusText.textContent = 'Build complete!';
    // Re-enable any disabled buttons here
    return; // Stop processing other stages
  }

  for (const stage of progressStages) {
    if (msg.includes(stage.key) && stage.progress > currentProgress) {
      currentProgress = stage.progress;
      progressBar.style.width = `${currentProgress}%`;
      statusText.textContent = stage.status;
      const nextStage = progressStages.find(s => s.progress > currentProgress);
      if (nextStage) {
        startProgressAnimation(nextStage.progress);
      }
    }
  }
});

if (closeBtn) {
  closeBtn.addEventListener('click', () => {
    window.electron.closeApp();
  });
}

startProgressAnimation(progressStages[0].progress);
