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
  <div id="guacamolePlayer" w-full style="height: 90%"></div>
  <n-flex align="center" :wrap="false" w-full px-10px style="height: 10%">
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
import { computed, onBeforeUnmount, onMounted, onUnmounted, ref } from 'vue';
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

const scale = ref(0);
const max = ref(100);
const currentPercent = ref(0);
const chunks = ref('');
const totalDuration = ref('00:00');
const currentPosition = ref('00:00');
const isPlaying = ref(false);
const isProcessing = ref(false);
const loadingBuffer = ref(false);
const fileDataEndCalled = ref(false);

const loadResource = async (record: any) => {
  const el = document.getElementById('guacamolePlayer') as HTMLElement;
  const displayElement = display.getElement();

  el.innerHTML = '';
  el.appendChild(displayElement);

  await window.electron.readFile(guaUrl.value);

  chunks.value = '';

  window.electron.onFileDataChunk(chunk => {
    try {
      chunks.value += chunk.trim();
    } catch (e) {
      console.log(e);
    }
  });

  window.electron.onFileDataEnd(() => {
    if (fileDataEndCalled.value) {
      chunks.value = '';
      return;
    }

    fileDataEndCalled.value = true;
    loadingBuffer.value = false;

    record.connect(chunks.value);

    chunks.value = '';
    initRecordingEvent(record, el);
  });

  window.electron.onFileDataError(() => {
    loadingBuffer.value = false;
  });
};

const initRecordingEvent = (record, el: HTMLElement) => {
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

  window.addEventListener('resize', () => {
    const parentEl = el.parentElement as HTMLElement;

    setTimeout(() => {
      if (parentEl) {
        const parentWidth = parentEl.offsetWidth;
        const parentHeight = parentEl.offsetHeight;

        let width = display.getDefaultLayer().width;
        let height = display.getDefaultLayer().height;

        if (width >= 3000) {
          width = width / 2;
        }

        if (width <= 700) {
          height = 1060;
        }

        const targetWidth = parentWidth;
        const targetHeight = parentHeight;

        const scaleWidth = targetWidth / width;
        const scaleHeight = targetHeight / height;

        scale.value = Math.min(scaleWidth, scaleHeight);
      } else {
        console.log('No parent element found');
      }

      display.scale(scale.value);

      max.value = record.getDuration();
      totalDuration.value = formatTime(record.getDuration());
    }, 100);

  })


  const parentEl = el.parentElement as HTMLElement;

  setTimeout(() => {
    if (parentEl) {
      const parentWidth = parentEl.offsetWidth;
      const parentHeight = parentEl.offsetHeight;

      let width = display.getDefaultLayer().width;
      let height = display.getDefaultLayer().height;

      if (width >= 3000) {
        width = width / 2;
      }

      if (width <= 700) {
        height = 1060;
      }

      const targetWidth = parentWidth;
      const targetHeight = parentHeight;

      const scaleWidth = targetWidth / width;
      const scaleHeight = targetHeight / height;

      scale.value = Math.min(scaleWidth, scaleHeight);
    } else {
      console.log('No parent element found');
    }

    display.scale(scale.value);

    max.value = record.getDuration();
    totalDuration.value = formatTime(record.getDuration());
  }, 100);
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

  await loadResource(recording);
});

onBeforeUnmount(() => {
  if (recording) {
    recording.pause();

    recording.disconnect();

    tunnel = null;
    recording = null;
    chunks.value = '';

    const el = document.getElementById('guacamolePlayer') as HTMLElement;
    el.removeChild(display.getElement());
  }
});

onUnmounted(() => {
  chunks.value = '';
  currentPercent.value = 0;
  currentPosition.value = '00:00';
  isPlaying.value = false;
});
</script>
