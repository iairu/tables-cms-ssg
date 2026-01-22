const output = document.getElementById('output');
const progressBar = document.getElementById('progress-bar');
const statusText = document.getElementById('status-text');
const closeBtn = document.getElementById('close-btn');

const progressStages = [
  { key: 'Checking for Node.js and npm...', progress: 10, status: 'Checking and updating environment...' },
  { key: 'Node.js and npm found.', progress: 20, status: 'Environment checked and updated.' },
  { key: 'Executing npm: install', progress: 30, status: 'Installing dependencies...' },
  { key: 'All binaries and scripts consolidated', progress: 50, status: 'Dependencies installed.' },
  { key: 'Starting Gatsby development server...', progress: 60, status: 'Starting server...' },
  { key: 'success compile gatsby files', progress: 70, status: 'Compiling files...' },
  { key: 'success onPreBootstrap', progress: 80, status: 'Bootstrapping...' },
  { key: 'bootstrap finished', progress: 90, status: 'Finishing up...' },
  { key: 'success extract queries from components', progress: 100, status: 'Extracting queries...' },
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
  window.scrollTo(0, document.body.scrollHeight);

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

closeBtn.addEventListener('click', () => {
  window.electron.closeApp();
});

startProgressAnimation(progressStages[0].progress);
