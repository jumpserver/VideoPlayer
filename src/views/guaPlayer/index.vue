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
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { useMessage } from 'naive-ui';
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { PlayCircleOutline, StopCircleOutline } from '@vicons/ionicons5';
// @ts-ignore
import * as Guacamole from 'guacamole-common-js-jumpserver/dist/guacamole-common';

// @ts-ignore
const message = useMessage();

const { t } = useI18n();
const route = useRoute();
const guaUrl = computed(() => route.params?.guaUrl as string);

const tunnel = new Guacamole.StaticHTTPTunnel();
const recording = new Guacamole.SessionRecording(tunnel);
const display = recording.getDisplay();

const max = ref(100);
const currentPercent = ref(0);
const chunks = ref('');
const totalDuration = ref('00:00');
const currentPosition = ref('00:00');
const isPlaying = ref(false);
const isProcessing = ref(false);
const loadingBuffer = ref(false);

const initRecordingEvent = () => {
  recording.onerror = (message: string) => {
    console.log('Error occurred: ' + message);
  };

  recording.onplay = () => {
    isPlaying.value = true;
  };

  recording.onseek = (position: number) => {
    currentPercent.value = position;

    currentPosition.value = formatTime(position);
  };

  recording.onpause = () => {
    isPlaying.value = false;
  };

  recording.play();

  // todo))
  display.scale(0.42);

  max.value = recording.getDuration();
  totalDuration.value = formatTime(recording.getDuration());
};

const handleVideoPlay = () => {
  if (!recording.isPlaying()) {
    recording.play();
    isPlaying.value = true;
  } else {
    recording.pause();
    isPlaying.value = false;
  }
};

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

const formatTime = (millis: number) => {
  const totalSeconds = millis / 1000;
  const [hour, minute, second] = formatTimeWithSeconds(totalSeconds);
  let time = zeroPad(minute, 2) + ':' + zeroPad(second, 2);
  if (hour > 0) {
    time = zeroPad(hour, 2) + ':' + time;
  }
  return time;
};

const formatTooltip = (value: number) => {
  return formatTime(value);
};

const handleSliderChange = (value: number) => {
  isProcessing.value = true;
  recording.seek(value, () => {
    isProcessing.value = false;
  });
};

onMounted(async () => {
  loadingBuffer.value = true;

  const el: HTMLElement = document.getElementById('guacamolePlayer') as HTMLElement;
  const displayElement = display.getElement();

  el.appendChild(displayElement);

  await window.electron.readFile(guaUrl.value);

  window.electron.onFileDataChunk((_event, chunk) => {
    chunk = chunk.trim();
    chunks.value += chunk;
  });

  window.electron.onFileDataEnd((_event, _chunks) => {
    loadingBuffer.value = false;
    recording.connect(chunks.value);
    initRecordingEvent();
  });

  window.electron.onFileDataError((_event, _errorMessage) => {
    loadingBuffer.value = false;
  });
});

onUnmounted(() => {
  recording.disconnect();
  chunks.value = '';
});
</script>
