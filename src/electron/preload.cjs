const { contextBridge, ipcRenderer } = require('electron');
const { Buffer } = require('buffer');

contextBridge.exposeInMainWorld('electron', {
  Buffer,
  writeFile: (buffer, fileName) => ipcRenderer.invoke('writeFile', buffer, fileName),
  readFile: filePath => ipcRenderer.invoke('readFile', filePath),
  onFileDataChunk: callback => ipcRenderer.on('fileDataChunk', callback),
  onFileDataEnd: callback => ipcRenderer.on('fileDataEnd', callback),
  onFileDataError: callback => ipcRenderer.on('fileDataError', callback)
});
