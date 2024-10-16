import { createI18n } from 'vue-i18n';
import { getBrowserLang } from '@/lang/helper';

import zh from './modules/zh';
import en from './modules/en';

export const i18n = createI18n({
  allowComposition: true,
  legacy: false,
  locale: getBrowserLang(),
  fallbackLocale: 'en',
  messages: {
    en,
    zh
  }
});
