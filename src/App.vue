<template>
  <n-config-provider :theme-overrides="overrides[theme]" :theme="darkTheme" :class="theme">
    <n-message-provider>
      <router-view />
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { darkTheme } from 'naive-ui';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { GlobalThemeOverrides } from 'naive-ui';
import { useSettingStore } from '@/store/modules/settingStroe.ts';

interface ThemeOverrides {
  [key: string]: GlobalThemeOverrides;
}

const lightOverrides: GlobalThemeOverrides = {
  Layout: {
    headerBorderColor: '#fff'
  },
  List: {
    color: '#F0F2F5',
    textColor: '#232527',
    colorHover: '#E0E0E0'
  },
  Thing: {
    titleTextColor: '#232527'
  },
  Divider: {
    color: '#E0E0E0'
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
    tabTextColorBar: '#232527',
    tabTextColorHoverBar: '#232527',
    tabTextColorActiveBar: '#232527',
    colorBar: '#F6F7F8',
    paneTextColor: '#232527',
    tabFontSizeMedium: '15px'
  },
  Empty: {
    iconColor: '#232527',
    textColor: '#232527'
  },
  Typography: {
    headerMargin6: '0 0 5px 0',
    headerFontSize6: '13px'
  },
  Slider: {
    railColor: '#E0E0E0',
    trackColor: '#E0E0E0',
    railColorHover: '#E0E0E0',
    trackColorHover: '#E0E0E0',
    railColorActive: '#E0E0E0',
    trackColorActive: '#E0E0E0'
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
  },
  Tabs: {
    tabFontSizeMedium: '15px'
  },
  Typography: {
    headerMargin6: '0 0 5px 0',
    headerFontSize6: '13px'
  }
};

const overrides: ThemeOverrides = {
  light: lightOverrides,
  dark: darkOverrides
};

const router = useRouter();
const settingStore = useSettingStore();
const { theme } = storeToRefs(settingStore);

router.afterEach(() => {
  window.electron.setTitle();
});
</script>
