<template>
  <div class="cast-player-root">
    <div class="player-area" ref="playerAreaRef">
      <div id="terminal" ref="terminalRef"></div>
    </div>

    <div class="controls">
      <div class="controls-left">
        <n-text class="time-text">{{ t('playbackSpeed') }}</n-text>
      </div>

      <div class="controls-right">
        <n-select
          v-model:value="playbackSpeed"
          :options="speedOptions"
          size="small"
          class="speed-select"
          @update:value="handleSpeedChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// @ts-ignore
import * as AsciinemaPlayer from '@cyolosecurity/asciinema-player';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';

/** Asciinema 播放器实例类型（库未导出完整类型，按需声明常用方法） */
interface IAsciinemaPlayerInstance {
  dispose: () => void;
  getCurrentTime: () => number;
  play: () => void;
  pause: () => void;
  addEventListener: (name: string, callback: () => void) => void;
}

const route = useRoute();
const { t } = useI18n();

const castUrl = computed(() => route.params?.castUrl as string);
const terminalRef = ref<HTMLElement | null>(null);
const playerAreaRef = ref<HTMLElement | null>(null);

/** 当前播放倍速，默认 1x */
const playbackSpeed = ref(1);
/** 是否正在播放，用于切换倍速后恢复播放状态 */
const isPlaying = ref(false);

/** 倍速选项，与 Gua / MP4 播放器保持一致 */
const speedOptions = [
  { label: '0.75x', value: 0.75 },
  { label: '1x', value: 1 },
  { label: '1.5x', value: 1.5 },
  { label: '2x', value: 2 }
];

let playerInstance: IAsciinemaPlayerInstance | null = null;

/**
 * @description 创建或重建 Asciinema 播放器
 * @param url cast 文件 ObjectURL
 * @param speed 播放倍速
 * @param startAt 起始时间（秒）
 * @param autoPlay 是否自动播放
 *
 * 说明：Asciinema 仅在 create 时接受 speed 参数，运行时切换倍速需销毁并重建实例。
 */
const mountPlayer = (
  url: string,
  speed: number,
  startAt = 0,
  autoPlay = true
) => {
  const container = terminalRef.value;
  if (!container || !url) return;

  // 销毁旧实例，避免重复挂载
  if (playerInstance) {
    playerInstance.dispose();
    playerInstance = null;
  }

  container.innerHTML = '';

  playerInstance = AsciinemaPlayer.create(url, container, {
    fit: 'both',
    preload: true,
    autoPlay,
    speed,
    startAt,
    controls: 'auto'
  }) as IAsciinemaPlayerInstance;

  // 监听播放状态，便于倍速切换后恢复
  playerInstance.addEventListener('play', () => {
    isPlaying.value = true;
  });
  playerInstance.addEventListener('pause', () => {
    isPlaying.value = false;
  });
};

/**
 * @description 切换播放倍速
 * @param speed 新的倍速值
 */
const handleSpeedChange = (speed: number) => {
  if (!playerInstance) return;

  const currentTime = playerInstance.getCurrentTime();
  const shouldPlay = isPlaying.value;

  playerInstance.pause();
  mountPlayer(castUrl.value, speed, currentTime, shouldPlay);
};

watch(
  () => castUrl.value,
  url => {
    playbackSpeed.value = 1;
    isPlaying.value = false;
    mountPlayer(url, 1, 0, true);
  }
);

onMounted(() => {
  mountPlayer(castUrl.value, playbackSpeed.value, 0, true);
});

onBeforeUnmount(() => {
  playerInstance?.dispose();
  playerInstance = null;
});
</script>

<style scoped lang="scss">
.cast-player-root {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  width: 100%;
}

.player-area {
  flex: 1 1 auto;
  min-height: 0;
  width: 100%;
  overflow: hidden;
}

#terminal {
  width: 100%;
  height: 100%;
}

.controls {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px;
  width: 100%;
  box-sizing: border-box;
}

.controls-left {
  flex: 0 0 auto;
}

.time-text {
  font-size: 14px;
}

.controls-right {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
}

.speed-select {
  width: 88px;
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
