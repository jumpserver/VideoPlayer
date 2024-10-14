import { execSync } from 'child_process';
import os from 'os';

execSync('vite build');

const platform = os.platform();

if (platform === 'darwin') {
  execSync('electron-builder --mac --win --linux');
} else {
  execSync('electron-builder --win --linux');
}
