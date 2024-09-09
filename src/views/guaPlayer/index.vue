<template>
  <div id="guacamolePlayer" w-full h-full></div>
</template>

<script setup lang="ts">
// @ts-ignore
import {
  Client,
  BlobReader,
  StaticHTTPTunnel,
  SessionRecording,
  InputStream
} from '@glokon/guacamole-common-js';
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const guaUrl = computed(() => route.params?.guaUrl as string);

// 创建一个 gua 播放器
onMounted(() => {
  const el: HTMLElement = document.getElementById('guacamolePlayer')!;
  const url = guaUrl.value;

  const client = new Client(new StaticHTTPTunnel());
  const recording = new SessionRecording(client);

  console.log(res);
});
</script>

<style scoped></style>
