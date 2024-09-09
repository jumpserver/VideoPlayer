<template>
  <n-flex class="!gap-col-0" h-screen>
    <Side />
    <n-layout font="sans" h-screen class="w-[calc(100vw-65px)]">
      <n-layout-header h-75px bordered class="bg-[#17181A] border-[#232527]">
        <Header @back="handleBack" />
      </n-layout-header>
      <n-layout-content w-full class="bg-[#17181A] h-[calc(100%-75px)]">
        <n-grid x-gap="12" :cols="12" h-full>
          <n-gi :span="8">
            <n-flex h-full justify="center" align="center">
              <Upload v-if="!showPlayer" @parser="handleParser" />
              <template v-else>
                <router-view></router-view>
              </template>
            </n-flex>
          </n-gi>
          <n-gi :span="4">
            <n-flex h-full justify="center" align="center">
              <SliceList @play="handlePlay" @show-upload="handleShowUpload" />
            </n-flex>
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
import { useRouter } from 'vue-router';
import { useMessage } from 'naive-ui';
import { useResolveFile } from '@/hooks/useResolveFile.ts';
import type { UploadFileInfo } from 'naive-ui';

const router = useRouter();
const message = useMessage();
const { fileParser } = useResolveFile();

const jsonFile = ref<string>('');
const videoUrl = ref<string>('');
const showPlayer = ref<boolean>(false);

/**
 * 处理返回时间
 */
const handleBack = () => {
  showPlayer.value = false;
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
 */
const handlePlay = (videoUrl: string, type: string) => {
  switch (type) {
    case 'mp4': {
      showPlayer.value = true;

      router.push({
        name: 'mp4Player',
        params: { videoUrl }
      });

      break;
    }
    case 'cast': {
      showPlayer.value = true;

      router.push({
        name: 'asciicastPlayer',
        params: { castUrl: videoUrl }
      });

      break;
    }
    case 'gua': {
      // gua replay.gz
      showPlayer.value = true;

      router.push({
        name: 'guaPlayer',
        params: { guaUrl: videoUrl }
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
  }, 100);
};
</script>
