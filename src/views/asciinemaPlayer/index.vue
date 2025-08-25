<template>
  <div class="terminal-root">
    <div id="terminal"></div>
  </div>
</template>

<script setup lang="ts">
// @ts-ignore
import * as AsciinemaPlayer from '@cyolosecurity/asciinema-player';
import { useRoute } from 'vue-router';
import { computed, onMounted } from 'vue';

const route = useRoute();
const castUrl = computed(() => route.params?.castUrl as string);

onMounted(() => {
  AsciinemaPlayer.create(castUrl.value, document.getElementById('terminal')!, {
    fit: 'both',
    preload: true,
    autoplay: true
  });
});
</script>

<style scoped lang="scss">
.terminal-root {
  width: 100%;
  height: 100%;
}
#terminal {
  width: 100%;
  height: 100%;
}
:deep(.ap-wrapper) {
  width: 100%;
  height: 100%;
}
:deep(.ap-player) {
  width: 100% !important;
  height: 100% !important;
}
</style>
