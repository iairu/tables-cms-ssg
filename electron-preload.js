const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  triggerBuild: () => ipcRenderer.invoke('trigger-build'),
  onConsoleOutput: (callback) => {
    ipcRenderer.on('console-output', (_event, msg) => callback(msg));
  },
  consoleReady: () => {
    ipcRenderer.send('console-ready');
  }
});