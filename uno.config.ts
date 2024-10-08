import presetWebFonts from '@unocss/preset-web-fonts';
import { defineConfig, presetUno, presetAttributify } from 'unocss';

export default defineConfig({
  presets: [
    presetAttributify(),
    presetUno(),
    presetWebFonts({
      provider: 'google',
      fonts: {
        sans: ['Open Sans']
      }
    })
  ],
  shortcuts: {
    'switch-animation': 'transition duration-300',
    'side-bg-base': 'bg-[#F6F7F8] dark:bg-[#202225] switch-animation',
    'main-bg-base': 'bg-[#ffffff] dark:bg-[#000000] switch-animation',
    'upload-bg-base': 'bg-[#F6F7F8] dark:bg-[#202225] switch-animation',
    'list-bg-base': 'bg-[#F6F7F8] dark:bg-[#252627] switch-animation',
    'text-base': 'text-[#20202a] dark:text-[#f0f0f0] switch-animation',
    'icon-hover': 'hover:color-[#1ab394] switch-animation',
    'header-base':
      'bg-[#123456] dark:bg-[#202225] text-[#20202a] dark:text-[#F6F7F8] switch-animation',
    'right-side':
      'text-[#20202a] dark:text-[#F6F7F8] bg-[#123456] dark:bg-[#18191B]  switch-animation'
  },
  theme: {
    fontSize: {
      'text-13': '13px'
    }
  }
});
