const { gunzipSync } = require('fflate');
const { join, resolve } = require('path');
const { app, BrowserWindow, ipcMain } = require('electron');
const { existsSync, readFileSync, writeFileSync, createReadStream } = require('fs');
const { createDiscreteApi, darkTheme } = require('naive-ui');
const { readFile } = require('node:fs/promises');
const { Transform, pipeline } = require('node:stream');

const { message } = createDiscreteApi(['message'], {
  configProviderProps: {
    theme: darkTheme
  }
});

let envConfig;

const envConfigPath = resolve(__dirname, 'env-config.json');

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

const CHUNK_SIZE = 1024 * 1024 * 100;

if (existsSync(envConfigPath)) {
  envConfig = JSON.parse(readFileSync(envConfigPath, 'utf8'));
} else {
  console.error('env-config.json file not found.');
}

const createWindow = async () => {
  const window = new BrowserWindow({
    width: 1180,
    height: 730,
    minWidth: 1024,
    minHeight: 600,
    useContentSize: true,
    webPreferences: {
      preload: resolve(__dirname, 'preload.cjs'),
      // 允许在渲染进程（网页）中使用 Node.js 的 API
      nodeIntegration: true,
      // 允许在渲染进程中使用 Electron 的 remote 模块,在渲染进程中调用主进程的功能
      enableRemoteModule: true,
      // 网页的 JavaScript 代码与 Electron 提供的 API（如 require）共享同一个上下文
      contextIsolation: true
    },
    title: 'JumpServer Video Player'
  });

  const serveUrl = envConfig.VITE_BASE_URL;

  if (process.env.NODE_ENV === 'development') {
    await window.loadURL(serveUrl);
    window.webContents.openDevTools();
  } else {
    await window.loadFile(join(__dirname, '../dist/index.html'));
  }
};

app.whenReady().then(async () => {
  await createWindow();

  ipcMain.handle('writeFile', async (event, buffer, fileName) => {
    try {
      // 解压过程放入主进程
      const decompressedData = gunzipSync(Buffer.from(buffer));
      const outputBuffer = Buffer.from(decompressedData);

      const filePath = join(__dirname, fileName);

      writeFileSync(filePath, outputBuffer);

      return filePath;
    } catch (e) {
      console.error(`File Processing Failed For ${e.message}`);
    }
  });

  ipcMain.handle('readFile', (event, filePath) => {
    const readStream = createReadStream(filePath, {
      highWaterMark: CHUNK_SIZE,
      encoding: 'utf8'
    });

    let chunks = '';

    readStream.on('data', chunk => {
      console.log('Sending chunk of data: ', chunk.length);

      event.sender.send('fileDataData', chunk);
      chunks += chunk;
    });

    readStream.on('end', () => {
      console.log('Stream End');

      event.sender.send('fileDataEnd', chunks);
    });

    readStream.on('error', err => {
      console.error('Stream Error: ', err.message);
      event.sender.send('fileDataError', err.message);
    });
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', async () => {
  await createWindow();
});
