<template>
  <n-tabs type="segment" animated h-full pt-10px text-base>
    <n-tab-pane name="playlists" :tab="t('playlists')">
      <n-empty v-if="videoList.length === 0" />
      <n-list v-else hoverable clickable bordered>
        <n-list-item
          v-for="(list, index) of videoList"
          :key="list.name"
          @click="handlePlayVideo(list)"
        >
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
                <n-icon size="14" :component="Close" text-base />
              </n-button>
            </n-flex>
          </template>
        </n-list-item>
      </n-list>
    </n-tab-pane>
    <n-tab-pane name="commandsList" :tab="t('commandsList')">
      <n-empty />
    </n-tab-pane>
  </n-tabs>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { Close } from '@vicons/ionicons5';
import { useFileStore } from '@/store/modules/fileStore.ts';
import type { IVideoList } from '@/store/interface';

const emits = defineEmits<{
  (e: 'play', videoUrl: string, type: string, jsonFile: object): void;
  (e: 'show-upload'): void;
}>();

const { t } = useI18n();
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
  emits('play', list.videoUrl, list.type, list.jsonFile);
};
</script>

<style lang="scss" scoped>
:deep(.n-list-item__divider) {
  display: none;
}
</style>
