<template>
  <n-flex class="page-root">
    <Side />
    <n-layout class="page-main">
      <n-layout-header class="page-header">
        <Header @back="handleBack" />
      </n-layout-header>
      <n-divider />
      <n-layout-content
        class="page-content"
        content-style="overflow: hidden; height: calc(100vh - 56px);"
      >
        <n-grid :cols="12" class="page-grid">
          <n-gi :span="8">
            <div class="pane-left">
              <Upload v-if="!showPlayer" @parser="handleParser" class="pane-fill" />

              <router-view v-else :key="route.fullPath" class="pane-fill" />
            </div>
          </n-gi>
          <n-gi :span="4">
            <div class="pane-right">
              <SliceList
                @play="handlePlay"
                :json-file="currentPartJsonFile"
                @show-upload="handleShowUpload"
                class="pane-fill"
              />
            </div>
          </n-gi>
        </n-grid>
      </n-layout-content>
    </n-layout>
  </n-flex>
</template>

<script setup lang="ts">
import Side from './Side/index.vue';
import Header from '@/layouts/Header/index.vue';
import Upload from './Content/Upload/index.vue';
import SliceList from './Content/SliceList/index.vue';

import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useMessage } from 'naive-ui';
import { useResolveFile } from '@/hooks/useResolveFile.ts';
import type { UploadFileInfo } from 'naive-ui';

const route = useRoute();
const router = useRouter();
const message = useMessage();
const { fileParser } = useResolveFile();

const jsonFile = ref<string>('');
const videoUrl = ref<string>('');
const showPlayer = ref<boolean>(false);
const currentPartJsonFile = ref({});

/**
 * 处理返回时间
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
 *
 * @param videoUrl
 * @param type
 * @param jsonFile
 */
const handlePlay = (videoUrl: string, type: string, jsonFile: object) => {
  switch (type) {
    case 'mp4': {
      showPlayer.value = true;
      currentPartJsonFile.value = jsonFile;

      router.push({
        name: 'mp4Player',
        params: { videoUrl }
      });

      break;
    }
    case 'cast': {
      showPlayer.value = true;
      currentPartJsonFile.value = jsonFile;
      router.push({
        name: 'asciicastPlayer',
        params: { castUrl: videoUrl }
      });

      break;
    }
    case 'gua': {
      showPlayer.value = true;
      router.push({
        name: 'guaPlayer',
        params: { guaUrl: videoUrl }
      });

      break;
    }
    case 'part': {
      showPlayer.value = true;

      currentPartJsonFile.value = jsonFile;

      setTimeout(() => {
        router.push({
          name: 'guaPlayer',
          params: { guaUrl: videoUrl }
        });
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
</script>

<style scoped lang="scss">
.page-root {
  gap: unset !important;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

.page-main {
  width: calc(100vw - 65px);
  height: 100vh;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.page-header {
  display: flex;
  align-items: center;
  width: 100%;
  height: 55px;
}

:deep(.n-divider) {
  margin: 0 !important;
}

.page-content {
  flex: 1 1 auto;
  min-height: 0;
  width: 100%;
}

.page-grid {
  width: 100%;
  height: 100%;
}

.pane-left,
.pane-right {
  height: 100%;
  width: 98%;
  display: flex;
  flex-direction: column;
}

.pane-left {
  align-items: stretch;
  justify-content: stretch;
}

.pane-right {
  align-items: stretch;
  justify-content: stretch;
}

.pane-fill {
  width: 100%;
  height: 100%;
}
</style>
