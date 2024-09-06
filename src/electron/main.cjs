const { app, BrowserWindow } = require('electron');
const { join, resolve } = require('path');
const { existsSync, readFileSync } = require('fs');

let envConfig;

const envConfigPath = resolve(__dirname, 'env-config.json');

process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

if (existsSync(envConfigPath)) {
  envConfig = JSON.parse(readFileSync(envConfigPath, 'utf8'));
  console.log('API URL:', envConfig.VITE_BASE_URL);
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
      // 允许在渲染进程（网页）中使用 Node.js 的 API
      nodeIntegration: true,
      // 允许在渲染进程中使用 Electron 的 remote 模块,在渲染进程中调用主进程的功能
      enableRemoteModule: true,
      // 网页的 JavaScript 代码与 Electron 提供的 API（如 require）共享同一个上下文
      contextIsolation: false
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
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', async () => {
  await createWindow();
});
