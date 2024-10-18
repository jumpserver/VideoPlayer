<template>
  <n-space
    v-if="loadingBuffer"
    justify="center"
    align="center"
    size="small"
    w-full
    h-full
    pos-absolute
    z-9999
  >
    <n-spin :show="loadingBuffer">
      <template #description> {{ t('parsing') }} </template>
    </n-spin>
  </n-space>
  <div id="guacamolePlayer" w-730px h-520px></div>
  <n-flex align="center" :wrap="false" w-full px-10px>
    <n-flex :wrap="false" w-160px align="center">
      <n-button
        v-if="!isPlaying"
        :disabled="isProcessing"
        text
        cursor-pointer
        @click="handleVideoPlay"
      >
        <n-icon :component="PlayCircleOutline" size="30" text-base />
      </n-button>
      <n-button v-else :disabled="isProcessing" text cursor-pointer @click="handleVideoPlay">
        <n-icon :component="StopCircleOutline" size="30" text-base />
      </n-button>
      <n-text text-base> {{ currentPosition }} / {{ totalDuration }} </n-text>
    </n-flex>
    <n-slider
      v-model:value="currentPercent"
      :max="max"
      :disabled="isProcessing"
      :format-tooltip="formatTooltip"
      @update:value="handleSliderChange"
    />
  </n-flex>
</template>

<script setup lang="ts">
import { useDebounceFn } from '@vueuse/core';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { useMessage } from 'naive-ui';
import { computed, onMounted, onUnmounted, ref, watchEffect, onBeforeUnmount } from 'vue';
import { PlayCircleOutline, StopCircleOutline } from '@vicons/ionicons5';
// @ts-ignore
import * as Guacamole from 'guacamole-common-js-jumpserver/dist/guacamole-common';

// @ts-ignore
const message = useMessage();

const { t } = useI18n();
const route = useRoute();
const guaUrl = computed(() => route.params?.guaUrl as string);

let tunnel: any;
let recording: any;
let display: any;

const max = ref(100);
const currentPercent = ref(0);
const chunks = ref('');
const totalDuration = ref('00:00');
const currentPosition = ref('00:00');
const isPlaying = ref(false);
const isProcessing = ref(false);
const loadingBuffer = ref(false);
const fileDataEndCalled = ref(false);

const handleFileDataChunk = (_event, chunk) => {
  try {
    chunks.value += chunk.trim();
  } catch (e) {
    console.log(e);
  }
};

const handleFileDataError = (_event, _chunks) => {
  loadingBuffer.value = false;
  message.error(t('errorLoadingFile'));
};

let handleFileDataEnd: any;

const loadResource = async (record: any) => {
  window.electron.removeFileDataChunk(handleFileDataChunk);
  window.electron.removeFileDataError(handleFileDataError);

  const el = document.getElementById('guacamolePlayer') as HTMLElement;
  const displayElement = display.getElement();

  el.innerHTML = '';
  el.appendChild(displayElement);

  await window.electron.readFile(guaUrl.value);

  chunks.value = '';

  window.electron.onFileDataChunk(handleFileDataChunk);

  handleFileDataEnd = (_event, _chunks) => {
    if (fileDataEndCalled.value) {
      chunks.value = '';
      window.electron.removeFileDataChunk(handleFileDataChunk);
      window.electron.removeFileDataEnd(handleFileDataEnd);
      window.electron.removeFileDataError(handleFileDataError);
      return;
    }

    fileDataEndCalled.value = true;
    loadingBuffer.value = false;

    console.log('loadResource recording2', record);

    record.connect(chunks.value);

    chunks.value = '';
    initRecordingEvent(record);
    record.play();
  };

  window.electron.onFileDataEnd(handleFileDataEnd);

  window.electron.onFileDataError(handleFileDataError);
};

const initRecordingEvent = record => {
  record.onerror = (message: string) => {
    console.log('Error occurred: ' + message);
  };

  record.onplay = () => {
    isPlaying.value = true;
  };

  record.onseek = (position: number) => {
    currentPercent.value = position;

    currentPosition.value = formatTime(position);
  };

  record.onpause = () => {
    isPlaying.value = false;
  };

  record.play();

  // todo))
  display.scale(0.42);

  max.value = record.getDuration();
  totalDuration.value = formatTime(record.getDuration());
};

/**
 * @description 暂停与播放按键
 */
const handleVideoPlay = () => {
  if (!recording.isPlaying()) {
    recording.play();
    isPlaying.value = true;
  } else {
    recording.pause();
    isPlaying.value = false;
  }
};

/**
 * 格式化时间
 *
 * @param seconds
 */
const formatTimeWithSeconds = (seconds: number) => {
  let hour = 0,
    minute = 0,
    second = 0;
  const ref = [3600, 60, 1];
  for (let i = 0; i < ref.length; i++) {
    const val = ref[i];
    while (val <= seconds) {
      seconds -= val;
      switch (i) {
        case 0:
          hour++;
          break;
        case 1:
          minute++;
          break;
        case 2:
          second++;
          break;
      }
    }
  }
  return [hour, minute, second];
};

const zeroPad = (num: number, minLength: number) => {
  let str = num.toString();

  while (str.length < minLength) {
    str = '0' + str;
  }

  return str;
};

/**
 * 格式化时间
 *
 * @param millis
 */
const formatTime = (millis: number) => {
  const totalSeconds = millis / 1000;
  const [hour, minute, second] = formatTimeWithSeconds(totalSeconds);
  let time = zeroPad(minute, 2) + ':' + zeroPad(second, 2);
  if (hour > 0) {
    time = zeroPad(hour, 2) + ':' + time;
  }
  return time;
};

/**
 * 格式化 toolTip
 *
 * @param value
 */
const formatTooltip = (value: number) => {
  return formatTime(value);
};

/**
 * 处理进度条变化
 * @param value
 */
const handleSliderChange = (value: number) => {
  isProcessing.value = true;
  recording.seek(value, () => {
    isProcessing.value = false;
  });
};

onMounted(async () => {
  tunnel = new Guacamole.StaticHTTPTunnel();
  recording = new Guacamole.SessionRecording(tunnel);
  display = recording.getDisplay();

  console.log('onMounted Recording', recording);

  await loadResource(recording);
});

watchEffect(() => {
  console.log(guaUrl);
});

onBeforeUnmount(() => {
  console.log('onBeforeUnmount', display);
  console.log('onBeforeUnmount', tunnel);

  window.electron.removeFileDataChunk(handleFileDataChunk);
  window.electron.removeFileDataEnd(handleFileDataEnd);
  window.electron.removeFileDataError(handleFileDataError);

  if (recording) {
    recording.pause();

    recording.disconnect();

    recording = null;
    chunks.value = '';

    const el = document.getElementById('guacamolePlayer') as HTMLElement;
    el.removeChild(display.getElement());

    console.log(el);
  }
});

onUnmounted(() => {
  chunks.value = '';
  currentPercent.value = 0;
  currentPosition.value = '00:00';
  isPlaying.value = false;
});
</script>
