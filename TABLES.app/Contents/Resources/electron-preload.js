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
  getInterfaces: () => ipcRenderer.invoke('collab-get-interfaces'),
  startServer: (port, bindIP) => ipcRenderer.invoke('collab-start-server', port, bindIP),
  stopServer: () => ipcRenderer.invoke('collab-stop-server'),
  onServerFound: (callback) => {
    const listener = (_event, serverInfo) => callback(serverInfo);
    ipcRenderer.on('collab-server-found', listener);
    return () => ipcRenderer.removeListener('collab-server-found', listener);
  },
  saveContent: (type, data) => ipcRenderer.invoke('collab-save-content', type, data),
  uploadFile: (file) => ipcRenderer.invoke('collab-upload-file', file),
  getUploads: () => ipcRenderer.invoke('collab-get-uploads'),
});