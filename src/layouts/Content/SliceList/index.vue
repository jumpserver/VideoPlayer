<template>
  <n-list hoverable clickable bordered m-20px h-500px w-full>
    <template #header>
      <n-text> 播放列表： </n-text>
    </template>
    <n-list-item v-for="(list, index) of videoList" :key="list.name" @click="handlePlayVideo(list)">
      <n-popover trigger="hover">
        <template #trigger>
          {{ `Part ${index + 1}` }}
        </template>
        {{ list.name }}
      </n-popover>
      <template #suffix>
        <n-flex h-full p-5px justify="center" align="center">
          <n-button
            text
            @click="
              (e: Event) => {
                handleClose(e, list);
              }
            "
          >
            <n-icon size="14" :component="Close" />
          </n-button>
        </n-flex>
      </template>
    </n-list-item>
  </n-list>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useFileStore } from '@/store/modules/fileStore.ts';
import { Close } from '@vicons/ionicons5';
import type { IVideoList } from '@/store/interface';

const emits = defineEmits<{
  (e: 'play', videoUrl: string, type: string): void;
  (e: 'show-upload'): void;
}>();

const fileStore = useFileStore();

const { videoList } = storeToRefs(fileStore);

/**
 * 关闭 ListItem
 */
const handleClose = (e: Event, list: IVideoList) => {
  fileStore.removeListItem(list.name);

  e.stopPropagation();

  URL.revokeObjectURL(list.videoUrl);

  emits('show-upload');
};

/**
 * 点击列表项开始播放
 */
const handlePlayVideo = (list: IVideoList) => {
  emits('play', list.videoUrl, list.type);
};
</script>

<style lang="scss" scoped>
:deep(.n-list-item__divider) {
  display: none;
}
</style>
