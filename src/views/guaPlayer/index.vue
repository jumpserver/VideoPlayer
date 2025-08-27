<template>
  <div class="gua-player-root">
    <n-space v-if="loadingBuffer" justify="center" align="center" size="small" class="loading-mask">
      <n-spin :show="loadingBuffer">
        <template #description>{{ t('parsing') }}</template>
      </n-spin>
    </n-space>

    <div class="player-area" ref="playerAreaRef">
      <div id="guacamolePlayer" class="player-canvas"></div>
    </div>

    <div class="controls">
      <div class="controls-left">
        <n-button v-if="!isPlaying" :disabled="isProcessing" text @click="handleVideoPlay">
          <n-icon :component="PlayCircleOutline" size="30" />
        </n-button>
        <n-button v-else :disabled="isProcessing" text @click="handleVideoPlay">
          <n-icon :component="StopCircleOutline" size="30" />
        </n-button>
        <n-text class="time-text">{{ currentPosition }} / {{ totalDuration }}</n-text>
      </div>

      <div class="controls-slider">
        <n-slider
          v-model:value="currentPercent"
          :max="max"
          :disabled="isProcessing"
          :format-tooltip="formatTooltip"
          @update:value="handleSliderChange"
        />
      </div>

      <div class="controls-right">
        <n-tag round size="small" :bordered="false" type="success">
          {{ t('scalingRatio') }}: {{ Math.round(scale * 100) }}%
        </n-tag>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { useMessage } from 'naive-ui';
import { computed, onBeforeUnmount, onMounted, onUnmounted, ref } from 'vue';
import { useResizeObserver, useDebounceFn } from '@vueuse/core';
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

const playerAreaRef = ref<HTMLElement | null>(null);

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

const recomputeScale = () => {
  if (!display || !display.getDefaultLayer) return;

  const area = playerAreaRef.value;

  if (!area) return;

  const containerWidth = area.clientWidth;
  const containerHeight = area.clientHeight;

  if (!containerWidth || !containerHeight) return;

  const layer = display.getDefaultLayer();

  let canvasWidth = layer.width || 1024;
  let canvasHeight = layer.height || 768;

  // 确保 canvas 有合理的尺寸
  if (canvasWidth <= 0 || canvasHeight <= 0) {
    canvasWidth = 1024;
    canvasHeight = 768;
    layer.resize?.(canvasWidth, canvasHeight);
  }

  // 计算最佳缩放比例
  const scaleX = containerWidth / canvasWidth;
  const scaleY = containerHeight / canvasHeight;
  let newScale = Math.min(scaleX, scaleY);

  // 限制缩放范围
  newScale = Math.max(0.1, Math.min(2.0, newScale));

  // 更新缩放
  scale.value = Math.round(newScale * 1000) / 1000; // 保留3位小数
  display.scale(scale.value);

  // 更新时长信息
  if (recording?.getDuration) {
    max.value = recording.getDuration();
    totalDuration.value = formatTime(recording.getDuration());
  }
};

// 创建多个不同延迟的防抖函数，用于不同场景
const debouncedRecompute = useDebounceFn(recomputeScale, 100);
const fastRecompute = useDebounceFn(recomputeScale, 50);
const slowRecompute = useDebounceFn(recomputeScale, 200);

/**
 * @description 加载资源
 * @param record
 */
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

    const defaultLayer = display.getDefaultLayer();
    if (defaultLayer) {
      if (defaultLayer.width === 0 || defaultLayer.height === 0) {
        defaultLayer.resize?.(1024, 768);
      }
      const canvas = defaultLayer.getCanvas?.();
      if (canvas && (canvas.width === 0 || canvas.height === 0)) {
        canvas.width = 1024;
        canvas.height = 768;
      }
    }

    record.connect(chunks.value);
    chunks.value = '';
    initRecordingEvent(record);
  });

  window.electron.onFileDataError(() => {
    loadingBuffer.value = false;
  });
};

/**
 * @description 初始化 guacamole 事件
 * @param record
 */
const initRecordingEvent = (record: any) => {
  record.onerror = (message: string) => console.log('Error occurred: ' + message);
  record.onplay = () => {
    isPlaying.value = true;
  };
  record.onpause = () => {
    isPlaying.value = false;
  };
  record.onseek = (position: number) => {
    currentPercent.value = position;
    currentPosition.value = formatTime(position);
    // seek 后快速自适应
    setTimeout(fastRecompute, 50);
  };

  record.play();

  // 初始化后的多次自适应确保稳定
  setTimeout(fastRecompute, 100);
  setTimeout(debouncedRecompute, 300);
  setTimeout(slowRecompute, 600);
};

/**
 * @description 播放/暂停
 */
const handleVideoPlay = () => {
  const currentLayer = display.getDefaultLayer();
  if (currentLayer.width === 0 || currentLayer.height === 0) {
    currentLayer.resize?.(1024, 768);
    if (scale.value > 0) display.scale(scale.value);
  }

  if (!recording.isPlaying()) {
    recording.play();
    isPlaying.value = true;
  } else {
    recording.pause();
    isPlaying.value = false;
  }
};

/**
 * @description 格式化时间
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

      if (i === 0) hour++;
      else if (i === 1) minute++;
      else second++;
    }
  }
  return [hour, minute, second];
};

const zeroPad = (num: number, minLength: number) => {
  let str = num.toString();
  while (str.length < minLength) str = '0' + str;
  return str;
};

const formatTime = (millis: number) => {
  const totalSeconds = Math.floor(millis / 1000);
  const [hour, minute, second] = formatTimeWithSeconds(totalSeconds);
  let time = `${zeroPad(minute, 2)}:${zeroPad(second, 2)}`;
  if (hour > 0) time = `${zeroPad(hour, 2)}:${time}`;
  return time;
};

const formatTooltip = (value: number) => formatTime(value);

/**
 * @description 处理 slider 变化
 * @param value
 */
const handleSliderChange = (value: number) => {
  if (isProcessing.value) return;
  isProcessing.value = true;

  const currentWidth = display.getDefaultLayer().width;
  const currentHeight = display.getDefaultLayer().height;

  const done = () => {
    isProcessing.value = false;
  };

  const wrappedCallback = () => {
    setTimeout(() => {
      const afterW = display.getDefaultLayer().width;
      const afterH = display.getDefaultLayer().height;

      if (afterW === 0 || afterH === 0) {
        const layerToFix = display.getDefaultLayer();
        layerToFix.resize?.(currentWidth || 1024, currentHeight || 768);
        if (scale.value > 0) display.scale(scale.value);
      }

      done();
      fastRecompute(); // 拖动后快速自适应
    }, 50);
  };

  try {
    recording.seek(value, wrappedCallback);
  } catch (error) {
    console.error('Seek error:', error);
    isProcessing.value = false;
  }
};

const handleZoomIn = () => {
  if (scale.value >= 2.0) return;
  scale.value = +(scale.value + 0.1).toFixed(3);
  display.scale(scale.value);
};
const handleZoomOut = () => {
  if (scale.value <= 0.1) return;
  scale.value = +(scale.value - 0.1).toFixed(3);
  display.scale(scale.value);
};
const handleZoomReset = () => {
  scale.value = 1;
  display.scale(scale.value);
};

onMounted(async () => {
  // 修复 Guacamole Canvas 绘制问题的 monkey patch（保留你的逻辑）
  const originalToCanvas = Guacamole.Layer.prototype.toCanvas;

  Guacamole.Layer.prototype.toCanvas = function () {
    if (this.width === 0 || this.height === 0) {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      return canvas;
    }
    const canvas = this.getCanvas?.();
    if (!canvas || canvas.width === 0 || canvas.height === 0) {
      const fallbackCanvas = document.createElement('canvas');
      fallbackCanvas.width = this.width || 1;
      fallbackCanvas.height = this.height || 1;
      return fallbackCanvas;
    }
    try {
      return originalToCanvas.call(this);
    } catch {
      const fallbackCanvas = document.createElement('canvas');
      fallbackCanvas.width = this.width || 1;
      fallbackCanvas.height = this.height || 1;
      return fallbackCanvas;
    }
  };

  const originalDrawImage = CanvasRenderingContext2D.prototype.drawImage;
  CanvasRenderingContext2D.prototype.drawImage = function (image: any, ...args: any[]) {
    if (image instanceof HTMLCanvasElement && (image.width === 0 || image.height === 0)) return;
    try {
      return (originalDrawImage as any).call(this, image, ...args);
    } catch {
      return;
    }
  };

  window.addEventListener('error', event => {
    if (event.error?.message?.includes("Failed to execute 'drawImage'")) {
      const layer = display?.getDefaultLayer?.();
      layer?.resize?.(1024, 768);
      if (scale.value > 0) display.scale(scale.value);
      event.preventDefault();
      event.stopPropagation();
    }
  });

  tunnel = new Guacamole.StaticHTTPTunnel();
  recording = new Guacamole.SessionRecording(tunnel);
  display = recording.getDisplay();

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.ctrlKey || event.metaKey) {
      if (event.key === '+' || event.key === '=') {
        event.preventDefault();
        handleZoomIn();
      } else if (event.key === '-') {
        event.preventDefault();
        handleZoomOut();
      } else if (event.key === '0') {
        event.preventDefault();
        handleZoomReset();
      }
    }
  };
  const handleWheel = (event: WheelEvent) => {
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      // event.deltaY < 0 ? handleZoomIn() : handleZoomOut();
    }
  };
  document.addEventListener('keydown', handleKeyDown);
  (playerAreaRef.value || document).addEventListener('wheel', handleWheel as any);

  (window as any).guacamoleKeyHandler = handleKeyDown;
  (window as any).guacamoleWheelHandler = handleWheel;

  const handleResize = () => {
    fastRecompute();
  };

  const handleParentRecompute = () => {
    recomputeScale();
    setTimeout(debouncedRecompute, 100);
  };

  window.addEventListener('recompute-scale', handleParentRecompute);

  useResizeObserver(playerAreaRef as any, handleResize);

  window.addEventListener('resize', handleResize);

  (window as any).__gua_handlers = {
    resize: handleResize,
    recompute: handleParentRecompute
  };

  await loadResource(recording);
});

onBeforeUnmount(() => {
  if ((window as any).guacamoleKeyHandler) {
    document.removeEventListener('keydown', (window as any).guacamoleKeyHandler);
  }
  if ((window as any).guacamoleWheelHandler) {
    (playerAreaRef.value || document).removeEventListener(
      'wheel',
      (window as any).guacamoleWheelHandler
    );
  }

  const handlers = (window as any).__gua_handlers;

  if (handlers) {
    window.removeEventListener('recompute-scale', handlers.recompute);
    window.removeEventListener('resize', handlers.resize);
    delete (window as any).__gua_handlers;
  }

  if (recording) {
    try {
      recording.pause();
      recording.disconnect();
    } catch (e) {}

    const el = document.getElementById('guacamolePlayer') as HTMLElement;
    if (el && display && display.getElement()) {
      try {
        el.removeChild(display.getElement());
      } catch (error) {
        console.log('Error removing display element:', error);
      }
    }

    tunnel = null;
    recording = null;
    display = null;
    chunks.value = '';
  }

  delete (window as any).guacamoleKeyHandler;
  delete (window as any).guacamoleWheelHandler;
});

onUnmounted(() => {
  chunks.value = '';
  currentPercent.value = 0;
  currentPosition.value = '00:00';
  isPlaying.value = false;
});
</script>

<style scoped lang="scss">
.gua-player-root {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  width: 100%;
}

.loading-mask {
  position: absolute;
  inset: 0;
  z-index: 10;
}

.player-area {
  flex: 1 1 auto;
  min-height: 0;
  width: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.player-canvas {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.controls {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  width: 100%;
  box-sizing: border-box;
}

.controls-left {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 8px;
  width: 180px;
}

.time-text {
  font-size: 14px;
}

.controls-slider {
  flex: 1 1 auto;
  min-width: 0;
}

.controls-right {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: 200px;
}

.scale-text {
  font-size: 12px;
}

:deep(.n-slider) {
  width: 100%;
}
:deep(.n-slider-rail) {
  margin: 0;
}
</style>
