<template>
  <n-upload
    p-20px
    h-500px
    multiple
    directory-dnd
    :max="1"
    :trigger-style="{ width: '100%', height: '90%' }"
    @change="handleFileChange"
  >
    <n-upload-dragger flex flex-col justify-center items-center h-full>
      <div mb-12px>
        <n-icon size="48" :depth="3">
          <ArchiveIcon />
        </n-icon>
      </div>
      <n-text style="font-size: 16px"> 点击或者拖动文件到该区域来上传 </n-text>
      <n-p depth="3" style="margin: 8px 0 0 0">
        请不要上传敏感数据，比如你的银行卡号和密码，信用卡号有效期和安全码
      </n-p>
    </n-upload-dragger>
  </n-upload>
</template>

<script setup lang="ts">
import { ArchiveOutline as ArchiveIcon } from '@vicons/ionicons5';

import type { UploadFileInfo } from 'naive-ui';

import { useResolveFile } from '@/hooks/useResolveFile.ts';

const { fileParser } = useResolveFile();

// .gz 用户需要选择类型
// .zip .mp4 直接播放 asc

/**
 * change 事件的回调
 */
const handleFileChange = (options: { file: UploadFileInfo }) => {
  fileParser(options.file);
};
</script>

<style scoped lang="scss"></style>
