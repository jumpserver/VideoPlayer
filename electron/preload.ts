import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electron', {
  setTitle: () => ipcRenderer.invoke('set-title'),
  readFile: (filePath: string) => ipcRenderer.invoke('readFile', filePath),
  unLinkFile: (filePath: string) => ipcRenderer.invoke('unLinkFile', filePath),
  writeFile: (buffer: any, fileName: string) => ipcRenderer.invoke('writeFile', buffer, fileName),

  // @ts-ignore
  onFileDataEnd: callback => {
    ipcRenderer.removeAllListeners('fileDataEnd');
    ipcRenderer.on('fileDataEnd', callback);
  },

  // @ts-ignore
  onFileDataChunk: callback => {
    ipcRenderer.removeAllListeners('fileDataChunk');
    ipcRenderer.on('fileDataChunk', (_event, chunk) => callback(chunk));
  },

  // @ts-ignore
  onFileDataError: callback => {
    ipcRenderer.removeAllListeners('fileDataError');
    ipcRenderer.on('fileDataError', (_event, error) => callback(error));
  }
});
