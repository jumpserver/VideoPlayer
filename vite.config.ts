import { resolve } from 'path';
import { builtinModules } from 'module';
import { defineConfig, loadEnv } from 'vite';
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers';

import UnoCSS from 'unocss/vite';
import vue from '@vitejs/plugin-vue';
import electron from 'vite-plugin-electron/simple';
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
    base: './',
    root: __dirname,
    build: {
      fileName: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        external: ['electron', ...builtinModules]
      }
    },
    optimizeDeps: {
      exclude: ['electron']
    },
    plugins: [
      vue(),
      renderer(),
      UnoCSS(),
      AutoImport({
        imports: ['vue', 'vue-router', 'pinia']
      }),
      Components({
        resolvers: [NaiveUiResolver()]
      }),
      electron({
        main: {
          entry: 'electron/main.ts'
        },
        preload: {
          input: resolvePath('electron/preload.ts')
        }
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
