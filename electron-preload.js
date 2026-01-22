const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  onConsoleOutput: (callback) => {
    ipcRenderer.on('console-output', (_event, msg) => callback(msg));
  },
  closeApp: () => {
    ipcRenderer.send('close-app');
  },
});