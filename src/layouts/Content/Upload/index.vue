<template>
  <n-upload
    pl-20px
    h-500px
    multiple
    directory-dnd
    :max="1"
    :custom-request="handleCustomRequest"
    :trigger-style="{ width: '100%', height: '90%' }"
  >
    <n-upload-dragger flex flex-col justify-center items-center h-full>
      <div mb-12px>
        <n-icon size="48" :depth="3">
          <ArchiveIcon />
        </n-icon>
      </div>
      <n-text style="font-size: 16px"> 点击或者拖动文件到该区域来上传 </n-text>
      <n-p depth="3" style="margin: 8px 0 0 0">
        只能上传录像文件，且限制单次上传只能为一个文件
      </n-p>
    </n-upload-dragger>
  </n-upload>
</template>

<script setup lang="ts">
import type { UploadFileInfo, UploadCustomRequestOptions } from 'naive-ui';
import { ArchiveOutline as ArchiveIcon } from '@vicons/ionicons5';

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
