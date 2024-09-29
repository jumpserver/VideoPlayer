<template>
  <n-config-provider :theme-overrides="overrides[theme]" :theme="darkTheme" :class="theme">
    <n-message-provider>
      <router-view />
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { darkTheme } from 'naive-ui';
import { GlobalThemeOverrides } from 'naive-ui';
import { useSettingStore } from '@/store/modules/settingStroe.ts';
import { storeToRefs } from 'pinia';

interface ThemeOverrides {
  [key: string]: GlobalThemeOverrides;
}

const lightOverrides: GlobalThemeOverrides = {
  Layout: {
    headerBorderColor: '#fff'
  },
  List: {
    color: '#fff'
  }
};
const darkOverrides: GlobalThemeOverrides = {
  Layout: {
    headerBorderColor: '#232527'
  },
  List: {
    color: '#252627'
  }
};

const overrides: ThemeOverrides = {
  light: lightOverrides,
  dark: darkOverrides
};

const settingStore = useSettingStore();
const { theme } = storeToRefs(settingStore);
</script>
