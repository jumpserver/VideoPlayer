<template>
  <div class="gua-player-root">
    <n-space v-if="loadingBuffer" justify="center" align="center" size="small" class="loading-mask">
      <n-spin :show="loadingBuffer">
        <template #description>{{ t('parsing') }}</template>
      </n-spin>
    </n-space>

    <div id="guacamolePlayer" class="player-area"></div>

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
        <n-button-group>
          <n-button size="small" @click="handleZoomOut" :disabled="scale <= 0.1">
            <n-icon :component="RemoveOutline" size="16" />
          </n-button>
          <n-button size="small" @click="handleZoomReset">
            <n-text class="scale-text">{{ Math.round(scale * 100) }}%</n-text>
          </n-button>
          <n-button size="small" @click="handleZoomIn" :disabled="scale >= 2.0">
            <n-icon :component="AddOutline" size="16" />
          </n-button>
        </n-button-group>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { useMessage } from 'naive-ui';
import { computed, onBeforeUnmount, onMounted, onUnmounted, ref } from 'vue';
import { PlayCircleOutline, StopCircleOutline, AddOutline, RemoveOutline } from '@vicons/ionicons5';
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

    // 确保 Display 在连接前已经准备好
    const defaultLayer = display.getDefaultLayer();
    if (defaultLayer) {
      // 如果层尺寸为0，设置默认尺寸
      if (defaultLayer.width === 0 || defaultLayer.height === 0) {
        console.warn('Setting default layer size before connect');
        if (defaultLayer.resize) {
          defaultLayer.resize(1024, 768);
        }
      }

      // 确保 Canvas 元素存在
      const canvas = defaultLayer.getCanvas();
      if (canvas && (canvas.width === 0 || canvas.height === 0)) {
        console.warn('Canvas has zero size, resizing');
        canvas.width = 1024;
        canvas.height = 768;
      }
    }

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
  });

  const parentEl = el.parentElement as HTMLElement;

  setTimeout(() => {
    if (parentEl) {
      const parentWidth = parentEl.offsetWidth;
      const parentHeight = parentEl.offsetHeight;

      let width = display.getDefaultLayer().width;
      let height = display.getDefaultLayer().height;

      // 如果 Display 尺寸为 0，设置默认尺寸
      if (width === 0 || height === 0) {
        console.warn('Display has zero size, setting default size...');
        width = 1024;
        height = 768;

        // 尝试设置默认层的尺寸
        const defaultLayer = display.getDefaultLayer();
        if (defaultLayer.resize) {
          defaultLayer.resize(width, height);
        }
      }

      // 智能处理超高分辨率
      if (width > 2560) {
        // 4K 及以上分辨率缩放
        width = width * 0.5;
        height = height * 0.5;
      } else if (width > 1920) {
        // 2K 分辨率轻微缩放
        width = width * 0.8;
        height = height * 0.8;
      }

      // 处理异常尺寸比例
      const originalRatio = width / height;
      if (originalRatio > 3) {
        // 超宽屏处理
        height = width / 2.5;
      } else if (originalRatio < 0.5) {
        // 超高屏处理
        width = height * 0.8;
      }

      // 确保最小显示尺寸
      const minWidth = 320;
      const minHeight = 240;
      if (width < minWidth) width = minWidth;
      if (height < minHeight) height = minHeight;

      // 计算缩放比例
      const containerRatio = parentWidth / parentHeight;
      const videoRatio = width / height;

      let scaleWidth = parentWidth / width;
      let scaleHeight = parentHeight / height;

      // 智能缩放策略
      if (containerRatio > videoRatio) {
        // 容器更宽，以高度为准
        scale.value = scaleHeight;
      } else {
        // 容器更高，以宽度为准
        scale.value = scaleWidth;
      }

      // 应用缩放限制
      const maxScale = 2.0; // 最大放大2倍
      const minScale = 0.1; // 最小缩小到0.1倍

      scale.value = Math.min(scale.value, maxScale);
      scale.value = Math.max(scale.value, minScale);

      // 确保缩放值有效
      if (scale.value <= 0 || !isFinite(scale.value)) {
        scale.value = 1;
      }

      console.log('缩放信息:', {
        原始尺寸: `${display.getDefaultLayer().width}x${display.getDefaultLayer().height}`,
        处理后尺寸: `${width}x${height}`,
        容器尺寸: `${parentWidth}x${parentHeight}`,
        缩放比例: scale.value.toFixed(2),
        显示尺寸: `${Math.round(width * scale.value)}x${Math.round(height * scale.value)}`
      });
    } else {
      console.log('No parent element found');
    }

    display.scale(scale.value);

    max.value = record.getDuration();
    totalDuration.value = formatTime(record.getDuration());

    // 最后再次验证 Canvas 尺寸
    setTimeout(() => {
      const finalLayer = display.getDefaultLayer();
      if (finalLayer.width === 0 || finalLayer.height === 0) {
        console.warn('Final layer still has zero size, forcing resize...');
        if (finalLayer.resize) {
          finalLayer.resize(1024, 768);
          display.scale(scale.value);
        }
      }
    }, 100);
  }, 100);
};

/**
 * @description 暂停与播放按键
 */
const handleVideoPlay = () => {
  // 检查并修复 Canvas 尺寸
  const currentLayer = display.getDefaultLayer();
  if (currentLayer.width === 0 || currentLayer.height === 0) {
    console.warn('Canvas has zero size during play/pause, fixing...');
    if (currentLayer.resize) {
      currentLayer.resize(1024, 768);
      if (scale.value && scale.value > 0) {
        display.scale(scale.value);
      }
    }
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
  if (isProcessing.value) return;

  isProcessing.value = true;

  // 保存当前的 Display 尺寸
  const currentWidth = display.getDefaultLayer().width;
  const currentHeight = display.getDefaultLayer().height;

  // 重写 seek 回调，确保 Canvas 尺寸正确
  const originalSeekCallback = () => {
    isProcessing.value = false;
  };

  // 创建一个包装的回调函数
  const wrappedCallback = () => {
    // 检查 seek 后的 Canvas 尺寸
    setTimeout(() => {
      const afterSeekWidth = display.getDefaultLayer().width;
      const afterSeekHeight = display.getDefaultLayer().height;

      // 如果尺寸变为 0，恢复到之前的尺寸
      if (afterSeekWidth === 0 || afterSeekHeight === 0) {
        console.warn('Canvas size became zero after seek, restoring...');

        // 尝试恢复尺寸
        const layerToFix = display.getDefaultLayer();
        if (layerToFix.resize) {
          layerToFix.resize(currentWidth || 1024, currentHeight || 768);
        }

        // 重新应用缩放
        if (scale.value && scale.value > 0) {
          display.scale(scale.value);
        }
      }

      originalSeekCallback();
    }, 50);
  };

  // 执行 seek 操作
  try {
    recording.seek(value, wrappedCallback);
  } catch (error) {
    console.error('Seek error:', error);
    isProcessing.value = false;
  }
};

/**
 * 缩放比例增加
 */
const handleZoomIn = () => {
  if (scale.value >= 2.0) {
    return;
  }
  scale.value += 0.1;
  display.scale(scale.value);
};

/**
 * 缩放比例减少
 */
const handleZoomOut = () => {
  if (scale.value <= 0.1) {
    return;
  }
  scale.value -= 0.1;
  display.scale(scale.value);
};

/**
 * 缩放比例重置
 */
const handleZoomReset = () => {
  scale.value = 1;
  display.scale(scale.value);
};

onMounted(async () => {
  // 修复 Guacamole Canvas 绘制问题的 monkey patch
  const originalToCanvas = Guacamole.Layer.prototype.toCanvas;
  Guacamole.Layer.prototype.toCanvas = function () {
    // 检查当前层的尺寸
    if (this.width === 0 || this.height === 0) {
      console.warn('Layer has zero size in toCanvas, skipping drawImage');
      // 返回一个空的 ImageData 或默认 Canvas
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      return canvas;
    }

    // 检查 Canvas 元素是否存在且有效
    const canvas = this.getCanvas();
    if (!canvas || canvas.width === 0 || canvas.height === 0) {
      console.warn('Canvas has zero size in toCanvas, creating fallback');
      const fallbackCanvas = document.createElement('canvas');
      fallbackCanvas.width = this.width || 1;
      fallbackCanvas.height = this.height || 1;
      return fallbackCanvas;
    }

    // 调用原始方法
    try {
      return originalToCanvas.call(this);
    } catch (error) {
      console.warn('Error in toCanvas, returning fallback:', error);
      const fallbackCanvas = document.createElement('canvas');
      fallbackCanvas.width = this.width || 1;
      fallbackCanvas.height = this.height || 1;
      return fallbackCanvas;
    }
  };

  // 修复 drawImage 方法
  const originalDrawImage = CanvasRenderingContext2D.prototype.drawImage;
  CanvasRenderingContext2D.prototype.drawImage = function (
    image: any,
    sx?: any,
    sy?: any,
    sw?: any,
    sh?: any,
    dx?: any,
    dy?: any,
    dw?: any,
    dh?: any
  ) {
    // 检查源图像是否有效
    if (image instanceof HTMLCanvasElement && (image.width === 0 || image.height === 0)) {
      console.warn('Attempting to draw canvas with zero size, skipping');
      return;
    }

    // 调用原始方法
    try {
      return (originalDrawImage as any).apply(this, arguments);
    } catch (error) {
      console.warn('Error in drawImage, skipping:', error);
      return;
    }
  };

  // 添加全局错误处理
  window.addEventListener('error', event => {
    if (
      event.error &&
      event.error.message &&
      event.error.message.includes("Failed to execute 'drawImage'")
    ) {
      console.warn('Caught drawImage error globally, attempting to fix display');

      // 尝试修复 display
      if (display && display.getDefaultLayer) {
        const layer = display.getDefaultLayer();
        if (layer && layer.resize) {
          layer.resize(1024, 768);
          if (scale.value > 0) {
            display.scale(scale.value);
          }
        }
      }

      // 阻止错误继续传播
      event.preventDefault();
      event.stopPropagation();
    }
  });

  tunnel = new Guacamole.StaticHTTPTunnel();
  recording = new Guacamole.SessionRecording(tunnel);
  display = recording.getDisplay();

  // 定义事件处理器
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case '+':
        case '=':
          event.preventDefault();
          handleZoomIn();
          break;
        case '-':
          event.preventDefault();
          handleZoomOut();
          break;
        case '0':
          event.preventDefault();
          handleZoomReset();
          break;
      }
    }
  };

  const handleWheel = (event: WheelEvent) => {
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      if (event.deltaY < 0) {
        handleZoomIn();
      } else {
        handleZoomOut();
      }
    }
  };

  // 添加事件监听器
  document.addEventListener('keydown', handleKeyDown);

  const guacamolePlayer = document.getElementById('guacamolePlayer');
  if (guacamolePlayer) {
    guacamolePlayer.addEventListener('wheel', handleWheel);
  }

  // 将事件处理器存储起来，以便在卸载时移除
  (window as any).guacamoleKeyHandler = handleKeyDown;
  (window as any).guacamoleWheelHandler = handleWheel;

  await loadResource(recording);
});

onBeforeUnmount(() => {
  // 移除事件监听器
  if ((window as any).guacamoleKeyHandler) {
    document.removeEventListener('keydown', (window as any).guacamoleKeyHandler);
  }

  if ((window as any).guacamoleWheelHandler) {
    const guacamolePlayer = document.getElementById('guacamolePlayer');
    if (guacamolePlayer) {
      guacamolePlayer.removeEventListener('wheel', (window as any).guacamoleWheelHandler);
    }
  }

  if (recording) {
    recording.pause();
    recording.disconnect();

    tunnel = null;
    recording = null;
    chunks.value = '';

    const el = document.getElementById('guacamolePlayer') as HTMLElement;
    if (el && display && display.getElement()) {
      try {
        el.removeChild(display.getElement());
      } catch (error) {
        console.log('Error removing display element:', error);
      }
    }
  }
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
