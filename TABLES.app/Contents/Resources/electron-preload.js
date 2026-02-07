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
  // Collaboration APIs
  getIP: () => ipcRenderer.invoke('collab-get-ip'),
  startServer: (port) => ipcRenderer.invoke('collab-start-server', port),
  stopServer: () => ipcRenderer.invoke('collab-stop-server'),
});