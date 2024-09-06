<template>
  <n-flex class="!gap-col-0">
    <div w-65px h-screen class="bg-[#1E2022]"></div>
    <n-layout font="sans" h-screen class="w-[calc(100vw-65px)]">
      <n-layout-header h-75px bordered class="bg-[#17181A] border-[#232527]">
        <Header />
      </n-layout-header>
      <n-layout-content w-full class="bg-[#17181A] h-[calc(100%-75px)]">
        <n-grid x-gap="12" :cols="12" h-full>
          <n-gi :span="10">
            <n-flex h-full justify="center" align="center">
              <Upload v-if="!videoUrl" @parser="handleParser" />
              <template v-else>
                <router-view></router-view>
              </template>
            </n-flex>
          </n-gi>
          <n-gi :span="2"></n-gi>
        </n-grid>
      </n-layout-content>
    </n-layout>
  </n-flex>
</template>

<script setup lang="ts">
import Header from '@/layouts/Header/index.vue';
import Upload from './Content/Upload/index.vue';

import { ref } from 'vue';
import { useMessage } from 'naive-ui';
import { useResolveFile } from '@/hooks/useResolveFile.ts';
import type { UploadFileInfo } from 'naive-ui';
import { useRouter } from 'vue-router';

const router = useRouter();
const message = useMessage();
const { fileParser } = useResolveFile();

const jsonFile = ref<string>('');
const videoUrl = ref<string>('');

const handleParser = async (options: { file: UploadFileInfo }) => {
  try {
    const result = await fileParser(options.file);

    jsonFile.value = result.jsonFile;
    videoUrl.value = result.videoUrl;

    await router.push({
      name: 'asciicastPlayer',
      params: { videoUrl: result.videoUrl }
    });
  } catch (e) {
    message.error(`${e}`);
  }
};
</script>
