<template>
  <div w-65px flex flex-col items-center justify-between h-full side-bg-base>
    <n-flex mt-20px>
      <n-image :src="Logo" :height="34" :width="34" :preview-disabled="true" cursor-pointer />
    </n-flex>
    <n-flex mb-20px>
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
import { SunnyOutline, MoonOutline } from '@vicons/ionicons5';
import { useSettingStore } from '@/store/modules/settingStroe.ts';
import { storeToRefs } from 'pinia';

const settingStore = useSettingStore();
const { theme } = storeToRefs(settingStore);

const handleChangeTheme = () => {
  settingStore.setTheme(theme.value === 'light' ? 'dark' : 'light');
};
</script>
