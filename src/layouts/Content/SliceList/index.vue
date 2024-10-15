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
          <n-scrollbar style="max-height: 350px">
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
          </n-scrollbar>
        </n-list>
      </n-flex>
    </n-tab-pane>
    <!--    <n-tab-pane name="commandsList" :tab="t('commandsList')">-->
    <!--      <n-empty :description="t('emptyCommand')" />-->
    <!--    </n-tab-pane>-->
  </n-tabs>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { useMessage } from 'naive-ui';
import { ref, markRaw, watch, Component } from 'vue';
import { useFileStore } from '@/store/modules/fileStore.ts';
import { Close } from '@vicons/ionicons5';
import { UserAvatarFilledAlt } from '@vicons/carbon';
import { ProtocolHandler24Regular } from '@vicons/fluent';
import { AccessTimeSharp, ComputerRound } from '@vicons/material';
import type { IVideoList } from '@/store/interface';

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
  key: keyof IJsonFile;

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
const message = useMessage();
const fileStore = useFileStore();

const { videoList } = storeToRefs(fileStore);
const currentIndex = ref(0);
const videoInfoSetting = ref<IVideoInfoSetting[]>([
  {
    key: 'user',
    label: t('user'),
    iconName: markRaw(UserAvatarFilledAlt)
  },
  {
    key: 'asset',
    label: t('asset'),
    iconName: markRaw(ComputerRound)
  },
  {
    key: 'duration',
    label: t('duration'),
    iconName: markRaw(AccessTimeSharp)
  },
  {
    key: 'protocol',
    label: t('protocol'),
    iconName: markRaw(ProtocolHandler24Regular)
  }
]);

watch(
  () => props.jsonFile,
  newValue => {
    if (newValue) {
      videoInfoSetting.value.map((item: IVideoInfoSetting) => {
        item.message = newValue[item.key] as string;
      });
    }
  }
);

/**
 * 关闭 ListItem
 */
const handleClose = async (e: Event, list: IVideoList) => {
  e.stopPropagation();

  if (list.type === 'gua' || list.type === 'part') {
    const res = await window.electron.unLinkFile(list.videoUrl);

    if (!res) {
      return message.error(`Error : ${res}`);
    }
  }

  fileStore.removeListItem(list.name);

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
  height: 100%;
}
</style>
