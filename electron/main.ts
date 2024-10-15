import { join, dirname } from 'path';
import { fileURLToPath } from 'node:url';
import { writeFile } from 'fs/promises';
import { createReadStream, unlink } from 'fs';
import install, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer';

import { gunzip } from 'fflate';
import { app, ipcMain } from 'electron';
import { BrowserWindow } from 'electron';

export const __dirname = dirname(fileURLToPath(import.meta.url));

const CHUNK_SIZE = 1024 * 64;

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

const createWindow = () => {
  const window = new BrowserWindow({
    width: 1180,
    height: 730,
    minWidth: 1024,
    minHeight: 600,
    useContentSize: true,
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

  ipcMain.handle('writeFile', async (_event, buffer, fileName) => {
    console.log('buffer', buffer);
    try {
      // 解压过程放入主进程
      const data = await new Promise((resolve, reject) => {
        gunzip(Buffer.from(buffer), (err, decompressedData) => {
          if (err) {
            console.error('Decompression error:', err);
            return reject('');
          }

          resolve(decompressedData);
        });
      });

      const filePath = join(app.getPath('userData'), fileName);

      await writeFile(filePath, data as Uint8Array);

      return filePath;
    } catch (e: any) {
      console.error(`File Processing Failed For ${e.message}`);
    }
  });

  ipcMain.handle('readFile', (event, filePath) => {
    const readStream = createReadStream(filePath, {
      highWaterMark: CHUNK_SIZE,
      encoding: 'utf8'
    });

    // let chunks = '';

    readStream.on('data', chunk => {
      // chunks += chunk;
      event.sender.send('fileDataChunk', chunk);
    });

    readStream.on('end', () => {
      event.sender.send('fileDataEnd');
      // event.sender.send('fileDataEnd', chunks);
    });

    readStream.on('error', err => {
      console.error('Stream Error: ', err.message);
      event.sender.send('fileDataError', err.message);
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
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('ready', () => {
  install(VUEJS3_DEVTOOLS).then((_r: string) => {});
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
