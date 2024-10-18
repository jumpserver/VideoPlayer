import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  setTitle: () => ipcRenderer.invoke('set-title'),
  remove: () => ipcRenderer.invoke('remove'),
  readFile: filePath => ipcRenderer.invoke('readFile', filePath),
  unLinkFile: filePath => ipcRenderer.invoke('unLinkFile', filePath),
  writeFile: (buffer, fileName) => ipcRenderer.invoke('writeFile', buffer, fileName),

  onFileDataEnd: callback => ipcRenderer.on('fileDataEnd', callback),
  onFileDataChunk: callback => ipcRenderer.on('fileDataChunk', callback),
  onFileDataError: callback => ipcRenderer.on('fileDataError', callback),

  removeFileDataEnd: callback => ipcRenderer.removeListener('fileDataEnd', callback),
  removeFileDataChunk: callback => ipcRenderer.removeListener('fileDataChunk', callback),
  removeFileDataError: callback => ipcRenderer.removeListener('fileDataError', callback)
});
