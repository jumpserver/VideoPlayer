<template>
  <n-upload
    flex
    h-full
    flex-col
    items-center
    justify-center
    multiple
    directory-dnd
    :max="1"
    :custom-request="handleCustomRequest"
    :trigger-style="{ width: '100%', height: '85%' }"
  >
    <n-upload-dragger flex flex-col justify-center items-center h-full upload-bg-base>
      <div mb-12px>
        <n-icon size="48" text-base :depth="3">
          <ArchiveIcon />
        </n-icon>
      </div>
      <n-text style="font-size: 16px" text-base> {{ t('uploadTitle') }} </n-text>
      <n-p text-base depth="3" style="margin: 8px 0 0 0">
        {{ t('uploadTip') }}
      </n-p>
    </n-upload-dragger>
  </n-upload>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { ArchiveOutline as ArchiveIcon } from '@vicons/ionicons5';
import type { UploadFileInfo, UploadCustomRequestOptions } from 'naive-ui';

const emits = defineEmits<{
  (
    e: 'parser',
    options: {
      file: UploadFileInfo;
      onError: () => void;
      onFinish: () => void;
      onProgress: (e: { percent: number }) => void;
    }
  ): void;
}>();

const { t } = useI18n();

/**
 * 自定义的上传事件
 *
 * @param file
 * @param onFinish
 * @param onError
 * @param onProgress
 */
const handleCustomRequest = ({
  file,
  onFinish,
  onError,
  onProgress
}: UploadCustomRequestOptions) => {
  emits('parser', { file, onError, onFinish, onProgress });
};
</script>

<style scoped lang="scss">
:deep(.n-upload-file-list) {
  width: 100%;
}
</style>
