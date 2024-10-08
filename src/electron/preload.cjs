const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  writeFile: (buffer, fileName) => ipcRenderer.invoke('writeFile', buffer, fileName),
  readFile: filePath => ipcRenderer.invoke('readFile', filePath),
  onFileDataChunk: callback => ipcRenderer.on('fileDataChunk', callback),
  onFileDataEnd: callback => ipcRenderer.on('fileDataEnd', callback),
  onFileDataError: callback => ipcRenderer.on('fileDataError', callback)
});
