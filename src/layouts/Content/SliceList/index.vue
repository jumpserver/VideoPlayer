<template>
  <n-tabs animated size="medium" type="bar" h-full p-10px right-side>
    <n-tab-pane name="playlists" :tab="t('playlists')">
      <n-empty v-if="videoList.length === 0" :description="t('emptyList')" />
      <n-flex vertical v-else>
        <n-list bordered>
          <n-list-item>
            <n-thing :title="t('videoInformation')">
              <n-h6 v-for="item of videoInfoSetting" :key="item.label">
                <n-tag round :bordered="false" size="small" type="info">
                  {{ item.label }} : {{ item.message }}
                  <template #icon>
                    <n-icon :component="item.iconName" />
                  </template>
                </n-tag>
              </n-h6>
            </n-thing>
          </n-list-item>
        </n-list>
        <n-list bordered hoverable clickable>
          <template #header>
            {{ t('videoSelection') }} {{ `( ${currentIndex} / ${videoList.length})` }}
          </template>
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
      </n-flex>
    </n-tab-pane>
    <n-tab-pane name="commandsList" :tab="t('commandsList')">
      <n-empty :description="t('emptyCommand')" />
    </n-tab-pane>
  </n-tabs>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { ref, markRaw, watch, Component } from 'vue';
import { Close } from '@vicons/ionicons5';
import { useFileStore } from '@/store/modules/fileStore.ts';
import type { IVideoList } from '@/store/interface';
import { AccessTimeSharp, ComputerRound } from '@vicons/material';
import { ProtocolHandler24Regular } from '@vicons/fluent';
import { UserAvatarFilledAlt } from '@vicons/carbon';

interface IJsonFile {
  user?: string;

  asset?: string;

  command_amount?: number;

  date_end?: string;

  date_start?: string;

  duration?: string;

  protocol?: string;
}
interface IVideoInfoSetting {
  label?: string;

  message?: string | undefined;

  iconName?: Component;
}

const emits = defineEmits<{
  (e: 'play', videoUrl: string, type: string, jsonFile: object): void;
  (e: 'show-upload'): void;
}>();

const props = defineProps<{
  jsonFile?: IJsonFile;
}>();

const { t } = useI18n();
const fileStore = useFileStore();

const { videoList } = storeToRefs(fileStore);
const currentIndex = ref(0);
const videoInfoSetting = ref<IVideoInfoSetting[]>([
  {
    label: t('user'),
    iconName: markRaw(UserAvatarFilledAlt)
  },
  {
    label: t('asset'),
    iconName: markRaw(ComputerRound)
  },
  {
    label: t('duration'),
    iconName: markRaw(AccessTimeSharp)
  },
  {
    label: t('protocol'),
    iconName: markRaw(ProtocolHandler24Regular)
  }
]);

watch(
  () => props.jsonFile,
  newValue => {
    if (newValue) {
      videoInfoSetting.value[0].message = newValue.user;
      videoInfoSetting.value[1].message = newValue.asset;
      videoInfoSetting.value[2].message = newValue.duration;
      videoInfoSetting.value[3].message = newValue.protocol;
    }
  }
);

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
  currentIndex.value = videoList.value.findIndex((item: IVideoList) => item.name === list.name) + 1;
  emits('play', list.videoUrl, list.type, list.jsonFile);
};
</script>

<style lang="scss" scoped>
:deep(.n-list-item__divider) {
  display: none;
}

:deep(.n-tabs-pane-wrapper) {
  //position: relative;
  height: 100%;

  //.n-empty {
  //  position: absolute;
  //  top: 50%;
  //  left: 50%;
  //  transform: translate(-50%, -50%);
  //}
}
</style>
