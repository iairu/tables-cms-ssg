const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  onConsoleOutput: (callback) => {
    ipcRenderer.on('console-output', (_event, msg) => callback(msg));
  },
  runCommand: (command) => {
    ipcRenderer.send('run-command', command);
  },
  closeApp: () => {
    ipcRenderer.send('close-app');
  },
});