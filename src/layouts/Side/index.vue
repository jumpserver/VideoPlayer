<template>
  <div w-65px flex flex-col items-center justify-between h-full side-bg-base>
    <n-flex mt-10px>
      <n-image :src="Logo" :height="34" :width="34" :preview-disabled="true" cursor-pointer />
    </n-flex>
    <n-flex mb-20px align="center" justify="center" w-full>
      <n-icon
        size="24"
        p-5px
        icon-hover
        text-base
        rounded-5px
        transition-all
        duration-300
        cursor-pointer
        :component="LanguageOutline"
        @click="handleChangeLanguage"
      />

      <n-icon
        size="24"
        p-5px
        icon-hover
        text-base
        rounded-5px
        transition-all
        duration-300
        cursor-pointer
        :component="theme === 'light' ? MoonOutline : SunnyOutline"
        @click="handleChangeTheme"
      />
    </n-flex>
  </div>
</template>

<script setup lang="ts">
import Logo from '@/assets/Logo.svg';
import { useMessage } from 'naive-ui';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { useSettingStore } from '@/store/modules/settingStroe.ts';
import { SunnyOutline, MoonOutline, LanguageOutline } from '@vicons/ionicons5';

const i18n = useI18n();
const message = useMessage();
const settingStore = useSettingStore();
const { theme, lang } = storeToRefs(settingStore);

const handleChangeLanguage = () => {
  i18n.locale.value = lang.value === 'zh' ? 'en' : 'zh';
  settingStore.setLanguage(i18n.locale.value);

  message.success(i18n.t('toggleLangSuccess'));
};

const handleChangeTheme = () => {
  settingStore.setTheme(theme.value === 'light' ? 'dark' : 'light');
};
</script>
