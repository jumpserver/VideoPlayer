import { defineStore } from 'pinia';
import type { ISetting, ThemeType } from '@/store/interface';

export const useSettingStore = defineStore('setting', {
  state: (): ISetting => ({
    theme: 'dark',
    lang: 'zh'
  }),
  actions: {
    setTheme(theme: ThemeType) {
      this.theme = theme;
    },
    setLanguage(lang: string) {
      this.lang = lang;
    }
  }
});
