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
    'side-bg-base': 'bg-[#F0F2F5] dark:bg-[#202225] switch-animation',
    'main-bg-base': 'bg-[#ffffff] dark:bg-[#000000] switch-animation',
    'upload-bg-base': 'bg-[#F0F2F5] dark:bg-[#202225] switch-animation',
    'list-bg-base': 'bg-[#F6F7F8] dark:bg-[#252627] switch-animation',
    'text-base': 'text-[#20202a] dark:text-[#f0f0f0] switch-animation',
    'text-secondary': 'text-[#666666] dark:text-[#a0a0a0] switch-animation',
    'text-muted': 'text-[#999999] dark:text-[#767676] switch-animation',
    'icon-hover': 'hover:color-[#1ab394] switch-animation',
    'header-base':
      'bg-[#F0F2F5] dark:bg-[#202225] text-[#20202a] dark:text-[#F6F7F8] switch-animation',
    'right-side':
      'text-[#20202a] dark:text-[#F6F7F8] bg-[#FFFFFF] dark:bg-[#18191B] switch-animation',
    'card-bg-base': 'bg-[#FFFFFF] dark:bg-[#1E1E1E] switch-animation',
    'border-base': 'border-[#E5E7EB] dark:border-[#374151] switch-animation',
    'border-light': 'border-[#F3F4F6] dark:border-[#2D3748] switch-animation',
    'divider-base': 'bg-[#E5E7EB] dark:bg-[#374151] switch-animation',
    'hover-bg-light': 'hover:bg-[#F9FAFB] dark:hover:bg-[#2D3748] switch-animation',
    'hover-bg-medium': 'hover:bg-[#F3F4F6] dark:hover:bg-[#374151] switch-animation',
    'active-bg': 'bg-[#EBF8FF] dark:bg-[#1A202C] switch-animation',
    'shadow-light': 'shadow-sm shadow-[#00000008] dark:shadow-[#FFFFFF08]',
    'shadow-medium': 'shadow-md shadow-[#00000010] dark:shadow-[#FFFFFF10]',
    'input-bg':
      'bg-[#FFFFFF] dark:bg-[#2D3748] border-[#D1D5DB] dark:border-[#4A5568] switch-animation',
    'btn-primary': 'bg-[#3B82F6] hover:bg-[#2563EB] text-white switch-animation',
    'btn-secondary':
      'bg-[#F3F4F6] hover:bg-[#E5E7EB] dark:bg-[#374151] dark:hover:bg-[#4A5568] switch-animation'
  },
  theme: {
    fontSize: {
      'text-13': '13px'
    }
  }
});
