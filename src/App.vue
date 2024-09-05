<template>
  <n-config-provider :theme-overrides="overrides" :theme="darkTheme">
    <n-message-provider>
      <router-view />
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { darkTheme } from 'naive-ui';
import { GlobalThemeOverrides } from 'naive-ui';

const overrides: GlobalThemeOverrides = {
  Layout: {
    headerBorderColor: '#232527'
  }
};
</script>

<style scoped lang="scss"></style>
