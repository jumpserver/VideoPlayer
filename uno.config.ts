import presetWebFonts from '@unocss/preset-web-fonts';
import { defineConfig, presetUno, presetAttributify } from 'unocss';

export default defineConfig({
  // ...UnoCSS options
  presets: [
    presetAttributify(),
    presetUno(),
    presetWebFonts({
      provider: 'google',
      fonts: {
        sans: ['Open Sans']
      }
    })
  ]
});
