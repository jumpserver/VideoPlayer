<template>
  <n-tabs animated size="medium" type="bar" h-full p-10px right-side>
    <n-tab-pane name="playlists" :tab="t('playlists')">
      <n-empty v-if="videoList.length === 0" :description="t('emptyList')" />

      <div v-else class="sidebar">
        <!-- 信息卡片 -->
        <n-card class="info-card" :segmented="{ content: true }" size="small" :bordered="true">
          <template #header>
            <div class="card-header">
              <span class="title">{{ t('videoInformation') }}</span>
            </div>
          </template>

          <div class="info-grid">
            <n-popover
              v-for="item in videoInfoSetting"
              :key="item.key"
              trigger="hover"
              placement="top-start"
            >
              <template #trigger>
                <div class="info-chip" :class="{ 'is-empty': !item.message }">
                  <n-icon class="chip-icon" :component="item.iconName" />
                  <span class="chip-label">{{ item.label }}</span>
                  <span class="chip-sep">:</span>
                  <span class="chip-text" :title="item.message || '-'">{{
                    item.message || '-'
                  }}</span>
                </div>
              </template>
              {{ item.message || '-' }}
            </n-popover>
          </div>
        </n-card>

        <!-- 播放列表示例 -->
        <n-card class="list-card" size="small" :bordered="true">
          <template #header>
            <div class="card-header sticky">
              <span class="title">
                {{ t('videoSelection') }}
              </span>
              <n-tag size="small" type="success" round :bordered="false" class="count-tag">
                {{ `${currentIndex} / ${videoList.length}` }}
              </n-tag>
            </div>
          </template>

          <n-scrollbar class="list-scroll">
            <n-list bordered clickable hoverable class="playlist">
              <n-list-item
                v-for="(list, index) of videoList"
                :key="list.name"
                class="playlist-item"
                :class="{ active: index + 1 === currentIndex }"
                @click.prevent="handlePlayVideo(list)"
              >
                <div class="item-main">
                  <span class="item-title">Part {{ index + 1 }}</span>
                  <span class="item-sub" :title="list.name">{{ list.name }}</span>
                </div>

                <template #suffix>
                  <n-button text class="item-close" @click.stop="e => handleClose(e, list)">
                    <n-icon size="16" :component="Close" />
                  </n-button>
                </template>
              </n-list-item>
            </n-list>
          </n-scrollbar>
        </n-card>
      </div>
    </n-tab-pane>
  </n-tabs>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { useMessage } from 'naive-ui';
import { ref, markRaw, watch, Component, computed } from 'vue';
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

const router = useRouter();
const { t, locale } = useI18n();
const message = useMessage();
const fileStore = useFileStore();

const { videoList } = storeToRefs(fileStore);
const currentIndex = ref(0);
const videoInfoSetting = ref<IVideoInfoSetting[]>([]);

watch(
  () => props.jsonFile,
  newValue => {
    if (newValue) {
      setVideoInfoSetting();
    }
  }
);

watch(
  () => locale.value,
  newValue => {
    if (newValue) {
      setVideoInfoSetting();
    }
  }
);

const durationComputed = computed(() => {
  if (props.jsonFile && props.jsonFile.date_start && props.jsonFile.date_end) {
    const startDate = new Date(props.jsonFile.date_start);
    const endDate = new Date(props.jsonFile.date_end);

    const durationMs = endDate.getTime() - startDate.getTime();

    if (isNaN(durationMs) || durationMs < 0) return '';

    const seconds = Math.floor((durationMs / 1000) % 60);
    const minutes = Math.floor((durationMs / (1000 * 60)) % 60);
    const hours = Math.floor(durationMs / (1000 * 60 * 60));

    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  return '';
});

/**
 * 设置视频信息
 */
const setVideoInfoSetting = () => {
  videoInfoSetting.value = [
    {
      key: 'user',
      label: t('user'),
      iconName: markRaw(UserAvatarFilledAlt),
      message: props.jsonFile?.user
    },
    {
      key: 'asset',
      label: t('asset'),
      iconName: markRaw(ComputerRound),
      message: props.jsonFile?.asset
    },
    {
      key: 'duration',
      label: t('duration'),
      iconName: markRaw(AccessTimeSharp),
      message: durationComputed.value
    },
    {
      key: 'protocol',
      label: t('protocol'),
      iconName: markRaw(ProtocolHandler24Regular),
      message: props.jsonFile?.protocol
    }
  ];
};

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

setVideoInfoSetting();
</script>

<style lang="scss" scoped>
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 340px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  .title {
    font-weight: 600;
    letter-spacing: 0.2px;
  }
  &.sticky {
    position: sticky;
    top: 0;
    z-index: 1;
  }
}

.info-card {
  border-radius: 14px;
  :deep(.n-card__content) {
    padding-top: 10px;
  }
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 10px;
}

.info-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: 100%;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition:
    background 0.2s,
    border-color 0.2s;
  &.is-empty {
    opacity: 0.7;
  }
  .chip-icon {
    opacity: 0.9;
  }
  .chip-label {
    font-weight: 600;
    opacity: 0.9;
  }
  .chip-sep {
    opacity: 0.5;
  }
  .chip-text {
    opacity: 0.95;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.list-card {
  border-radius: 14px;
  :deep(.n-card__content) {
    padding-inline: 0;
  }
  .count-tag {
    margin-left: 8px;
  }
}

.list-scroll {
  max-height: 40vh;
}

.playlist {
  border: none;
  padding-left: 0;
  padding-right: 0;
  margin: 10px 0;

  :deep(.n-list) {
    padding-left: 0;
    padding-right: 0;
  }
  :deep(.n-list-item__divider) {
    display: none;
  }
}

.playlist-item {
  padding: 8px 10px;
  margin: 6px 0;
  border-radius: 10px;
  transition:
    background 0.15s,
    border-color 0.15s;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 10px;

  &:hover {
    background: rgba(255, 255, 255, 0.06);
    .item-close {
      opacity: 1;
      transform: translateX(0);
    }
  }
  &.active {
    background: rgba(64, 158, 255, 0.14);
    border-color: rgba(64, 158, 255, 0.35);
  }
  .item-main {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
  .item-title {
    font-weight: 600;
    line-height: 1.15;
  }
  .item-sub {
    font-size: 12px;
    opacity: 0.75;
    max-width: 220px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .item-close {
    opacity: 0;
    transform: translateX(4px);
    transition:
      opacity 0.15s,
      transform 0.15s;
  }
}

:deep(.n-tabs-pane-wrapper) {
  height: 100%;
}
</style>
