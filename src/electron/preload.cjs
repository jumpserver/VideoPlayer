const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  readFile: filePath => ipcRenderer.invoke('readFile', filePath),
  unLinkFile: filePath => ipcRenderer.invoke('unLinkFile', filePath),
  writeFile: (buffer, fileName) => ipcRenderer.invoke('writeFile', buffer, fileName),
  onFileDataChunk: callback => ipcRenderer.on('fileDataChunk', callback),
  onFileDataEnd: callback => ipcRenderer.on('fileDataEnd', callback),
  onFileDataError: callback => ipcRenderer.on('fileDataError', callback)
});
