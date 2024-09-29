export const getBrowserLang = () => {
  //@ts-ignore
  let browserLang = navigator.language ? navigator.language : navigator.browserLanguage;
  let defaultBrowserLang = '';
  if (['cn', 'zh', 'zh-cn'].includes(browserLang.toLowerCase())) {
    defaultBrowserLang = 'zh';
  } else {
    defaultBrowserLang = 'en';
  }
  return defaultBrowserLang;
};
