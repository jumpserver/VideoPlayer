import { join, dirname } from 'path';
import { Readable } from 'stream';
import { createGunzip } from 'zlib';
import { fileURLToPath } from 'node:url';
import { createReadStream, createWriteStream, unlink } from 'fs';

import { app, ipcMain } from 'electron';
import { BrowserWindow } from 'electron';

export const __dirname = dirname(fileURLToPath(import.meta.url));

const CHUNK_SIZE = 64 * 1024;
let window: any;

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

const createWindow = () => {
  window = new BrowserWindow({
    width: 1300,
    height: 800,
    minWidth: 1024,
    minHeight: 600,
    useContentSize: true,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, 'preload.mjs'),
      // 允许在渲染进程（网页）中使用 Node.js 的 API
      nodeIntegration: true,
      // 允许在渲染进程中使用 Electron 的 remote 模块,在渲染进程中调用主进程的功能
      // @ts-ignore
      enableRemoteModule: true,
      // 网页的 JavaScript 代码与 Electron 提供的 API（如 require）共享同一个上下文
      contextIsolation: true
    },
    title: 'JumpServer Video Player'
  });

  const serveUrl = process.env.VITE_DEV_SERVER_URL;

  if (app.isPackaged) {
    window.loadFile('./dist/index.html').catch(err => {
      console.error('Failed to load index.html:', err);
    });
  } else {
    window.loadURL(typeof serveUrl === 'string' ? serveUrl : '').catch(err => {
      console.error('Failed to load URL:', err);
    });
    window.webContents.openDevTools();
  }
};

app.whenReady().then(() => {
  createWindow();

  let readStream: null | Readable;

  ipcMain.handle('writeFile', async (_event, arrayBuffer, fileName) => {
    try {
      // 解压过程放入主进程
      const buffer = Buffer.from(arrayBuffer);
      const filePath = join(app.getPath('userData'), fileName);

      const bufferStream = new Readable();
      bufferStream.push(buffer);
      bufferStream.push(null);

      // 创建解压流和写入流
      const gunzipStream = createGunzip();
      const fileWriteStream = createWriteStream(filePath);

      // 管道：buffer -> 解压 -> 文件写入
      bufferStream.pipe(gunzipStream).pipe(fileWriteStream);

      return new Promise((resolve, reject) => {
        fileWriteStream.on('finish', () => resolve(filePath));
        fileWriteStream.on('error', reject);
        gunzipStream.on('error', error => {
          console.error('Decompression error:', error);
          reject(error);
        });
      });
    } catch (e: any) {
      console.error(`File Processing Failed For ${e.message}`);
    }
  });

  ipcMain.handle('readFile', (event, filePath) => {
    if (readStream) {
      readStream.removeAllListeners();
      readStream.destroy();
      readStream = null;
    }

    readStream = createReadStream(filePath, {
      highWaterMark: CHUNK_SIZE,
      encoding: 'utf8'
    });

    readStream.on('data', chunk => {
      event.sender.send('fileDataChunk', chunk);
    });

    readStream.on('end', () => {
      event.sender.send('fileDataEnd');
      readStream?.destroy();
      readStream = null;
    });

    readStream.on('error', err => {
      console.log('Stream Error: ', err.message);
      event.sender.send('fileDataError', err.message);
      readStream?.destroy();
      readStream = null;
    });
  });

  ipcMain.handle('unLinkFile', (_event, filePath) => {
    return new Promise((resolve, reject) => {
      unlink(filePath, err => {
        if (err) reject(false);
        resolve(true);
      });
    });
  });

  ipcMain.handle('set-title', _event => {
    window.setTitle('JumpServer Video Player');
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
