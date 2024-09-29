<template>
  <n-space v-if="loadingBuffer" justify="center" align="center" size="small" w-full h-full>
    <n-spin :show="loadingBuffer">
      <template #description> {{ t('parsing') }} </template>
    </n-spin>
  </n-space>
  <div id="guacamolePlayer" w-full h-full></div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { useMessage } from 'naive-ui';
import { computed, onMounted, ref } from 'vue';
// @ts-ignore
import { Display, SessionRecording, StaticHTTPTunnel } from '@glokon/guacamole-common-js';

const { t } = useI18n();
const route = useRoute();
const message = useMessage();
const guaUrl = computed(() => route.params?.guaUrl as string);

const tunnel: StaticHTTPTunnel = new StaticHTTPTunnel();
const recording: SessionRecording = new SessionRecording(tunnel);
const display: Display = recording.getDisplay();

const loadingBuffer = ref(false);

const initRecordingEvent = () => {
  recording.onerror = (message: string) => {
    console.log('Error occurred: ' + message);
  };

  recording.onplay = () => {
    message.success('Video is playing');
  };

  recording.onseek = (position: number, current: number, total: number) => {
    console.log('position', position);
    console.log('current', current);
    console.log('total', total);
  };

  recording.play();
  display.scale(0.85);
};

onMounted(async () => {
  loadingBuffer.value = true;

  const el: HTMLElement = document.getElementById('guacamolePlayer') as HTMLElement;

  el.appendChild(display.getElement());

  await window.electron.readFile(guaUrl.value);

  window.electron.onFileDataEnd((_event, _chunks) => {
    loadingBuffer.value = false;

    console.log(typeof _chunks);
    console.log('chunks', _chunks);
    recording.connect(_chunks);

    initRecordingEvent();
  });

  window.electron.onFileDataError((_event, errorMessage) => {
    message.error(`Error: ${errorMessage}`);
    loadingBuffer.value = false;
  });
});
</script>
