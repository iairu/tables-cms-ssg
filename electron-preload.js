const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  triggerBuild: () => ipcRenderer.invoke('trigger-build')
});