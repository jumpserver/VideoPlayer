import { defineStore } from 'pinia';
import type { ISetting, ThemeType } from '@/store/interface';

export const useSettingStore = defineStore('setting', {
  state: (): ISetting => ({
    theme: 'light'
  }),
  actions: {
    setTheme(theme: ThemeType) {
      this.theme = theme;
    }
  }
});
