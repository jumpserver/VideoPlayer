<template>
  <n-flex class="!gap-0 !flex-nowrap main-bg-base">
    <Side />

    <n-layout class="flex flex-col main-bg-base">
      <n-layout-header class="flex items-center w-full h-14 header-base">
        <Header @back="handleBack" />
      </n-layout-header>

      <n-divider class="!m-0 divider-base" />

      <n-layout
        has-sider
        :content-style="{ gap: '24px', height: 'calc(100vh - 3.6rem)' }"
        sider-placement="right"
        class="w-full main-bg-base"
      >
        <n-layout-content
          :content-style="{
            display: 'flex',
            padding: '0 12px 0 20px'
          }"
          class="main-bg-base"
        >
          <Upload v-if="!showPlayer" @parser="handleParser" />

          <div v-else ref="playerWrapRef" class="w-full h-full main-bg-base">
            <router-view :key="route.fullPath" />
          </div>
        </n-layout-content>

        <n-layout-sider
          bordered
          :collapsed-width="0"
          :width="480"
          :native-scrollbar="false"
          show-trigger="bar"
          collapse-mode="width"
          v-model:collapsed="siderCollapsed"
          content-style="padding: 24px;"
          class="right-side"
        >
          <SliceList
            @play="handlePlay"
            :json-file="currentPartJsonFile"
            @show-upload="handleShowUpload"
          />
        </n-layout-sider>
      </n-layout>
    </n-layout>
  </n-flex>
</template>

<script setup lang="ts">
import Side from './Side/index.vue';
import Header from '@/layouts/Header/index.vue';
import Upload from './Content/Upload/index.vue';
import SliceList from './Content/SliceList/index.vue';

import { useMessage } from 'naive-ui';
import type { UploadFileInfo } from 'naive-ui';
import { useRouter, useRoute } from 'vue-router';
import { useResolveFile } from '@/hooks/useResolveFile.ts';
import { useResizeObserver, useDebounceFn } from '@vueuse/core';
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';

const route = useRoute();
const router = useRouter();
const message = useMessage();
const { fileParser } = useResolveFile();

const siderCollapsed = ref(false);
const playerWrapRef = ref<HTMLElement | null>(null);

const jsonFile = ref<string>('');
const videoUrl = ref<string>('');
const showPlayer = ref<boolean>(false);
const currentPartJsonFile = ref({});

/**
 * 返回：关闭播放器回到上传
 */
const handleBack = () => {
  showPlayer.value = false;
  currentPartJsonFile.value = {};
};

const handleParser = async (options: {
  file: UploadFileInfo;
  onError: () => void;
  onFinish: () => void;
  onProgress: (e: { percent: number }) => void;
}) => {
  try {
    const result = await fileParser(options.file, {
      onFinish: options.onFinish,
      onError: options.onError,
      onProgress: options.onProgress
    });

    jsonFile.value = result.jsonFile;
    videoUrl.value = result.videoUrl;
  } catch (e) {
    options.onError();
    message.error(`${e}`);
  }
};

/**
 * 点击 Item 开始播放
 */
const handlePlay = (videoUrl: string, type: string, jsonFile: object) => {
  switch (type) {
    case 'mp4': {
      showPlayer.value = true;
      currentPartJsonFile.value = jsonFile;
      router.push({ name: 'mp4Player', params: { videoUrl } });
      break;
    }
    case 'cast': {
      showPlayer.value = true;
      currentPartJsonFile.value = jsonFile;
      router.push({ name: 'asciicastPlayer', params: { castUrl: videoUrl } });
      break;
    }
    case 'gua': {
      showPlayer.value = true;
      router.push({ name: 'guaPlayer', params: { guaUrl: videoUrl } });
      break;
    }
    case 'part': {
      showPlayer.value = true;
      currentPartJsonFile.value = jsonFile;
      setTimeout(() => {
        router.push({ name: 'guaPlayer', params: { guaUrl: videoUrl } });
      });
      break;
    }
    default: {
      showPlayer.value = false;
      break;
    }
  }
};

/**
 * 关闭 Player 展示 Upload 组件
 */
const handleShowUpload = () => {
  setTimeout(() => {
    showPlayer.value = false;
    currentPartJsonFile.value = {};
  }, 100);
};

const triggerRecomputeScale = () => {
  window.dispatchEvent(new CustomEvent('recompute-scale', { detail: Date.now() }));
};

const debouncedTrigger = useDebounceFn(triggerRecomputeScale, 80);

useResizeObserver(playerWrapRef as any, () => {
  debouncedTrigger();
});

watch(siderCollapsed, async () => {
  await nextTick();

  // 立即触发一次
  triggerRecomputeScale();

  // 在动画期间多次触发，确保各个阶段都能自适应
  const delays = [50, 150, 250, 400, 600];
  delays.forEach(delay => {
    setTimeout(triggerRecomputeScale, delay);
  });
});

onMounted(() => {
  window.addEventListener('resize', debouncedTrigger);
  if (showPlayer.value) {
    setTimeout(triggerRecomputeScale, 200);
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', debouncedTrigger);
});
</script>
