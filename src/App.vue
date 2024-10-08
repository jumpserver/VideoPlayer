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
    color: '#F6F7F8',
    textColor: '#232527',
    colorHover: '#E0E0E0'
  },
  Divider: {
    color: '#D9D9D9'
  },
  Upload: {
    draggerColor: '#F6F7F8',
    itemTextColor: '#232527',
    itemColorHover: '#E0E0E0',
    peers: {
      Button: {
        textColor: '#232527',
        colorHover: '#444B51'
      }
    }
  },
  Tabs: {
    tabTextColorSegment: '#232527',
    tabTextColorHoverSegment: '#232527',
    tabTextColorActiveSegment: '#232527',
    colorSegment: '#F6F7F8',
    paneTextColor: '#232527'
  },
  Empty: {
    iconColor: '#232527',
    textColor: '#232527'
  }
};
const darkOverrides: GlobalThemeOverrides = {
  Layout: {
    headerBorderColor: '#232527'
  },
  List: {
    color: '#252627'
  },
  Divider: {
    color: '#333333'
  }
};

const overrides: ThemeOverrides = {
  light: lightOverrides,
  dark: darkOverrides
};

const settingStore = useSettingStore();
const { theme } = storeToRefs(settingStore);
</script>
