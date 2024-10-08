import { resolve } from 'path';
import { writeFileSync } from 'fs';
import { defineConfig, loadEnv } from 'vite';
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers';

import UnoCSS from 'unocss/vite';
import vue from '@vitejs/plugin-vue';
import electron from 'vite-plugin-electron';
import AutoImport from 'unplugin-auto-import/vite';
import renderer from 'vite-plugin-electron-renderer';
import Components from 'unplugin-vue-components/vite';

const resolvePath = (path: string) => {
  return resolve(__dirname, '.', path);
};

export default defineConfig(({ mode }) => {
  //@ts-ignore
  const env = loadEnv(mode, process.cwd());

  return {
    plugins: [
      vue(),
      renderer({}),
      UnoCSS(),
      AutoImport({
        imports: ['vue', 'vue-router', 'pinia']
      }),
      Components({
        resolvers: [NaiveUiResolver()]
      }),
      {
        name: 'write-env',
        closeBundle() {
          const writeEnv = {
            VITE_BASE_URL: env.VITE_BASE_URL
          };
          const filePath = resolve(__dirname, 'src/electron/env-config.json');

          writeFileSync(filePath, JSON.stringify(writeEnv, null, 2));
        }
      },
      electron({
        entry: './src/electron/main.cjs'
      })
    ],
    resolve: {
      extensions: ['.ts', '.js', '.vue', '.json'],
      alias: {
        '@': resolvePath('./src')
      }
    }
  };
});
