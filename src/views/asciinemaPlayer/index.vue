<template>
  <div id="terminal" w-full p-20px></div>
</template>

<script setup lang="ts">
// @ts-ignore
import * as AsciinemaPlayer from '@cyolosecurity/asciinema-player';
import { useRoute } from 'vue-router';
import { computed, onMounted, nextTick } from 'vue';

const route = useRoute();
const castUrl = computed(() => route.params?.castUrl as string);

onMounted(async () => {
  AsciinemaPlayer.create(
    'data:text/plain;base64,' + castUrl.value,
    document.getElementById('terminal')
  );

  await nextTick();
});
</script>

<style scoped lang="scss">
:deep(.ap-wrapper) {
  height: 578px;

  .ap-player {
    height: unset !important;
  }
}
</style>
