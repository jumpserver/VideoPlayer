<template>
  <n-flex justify="start" items-center h-full pl-10px>
    <n-popover>
      <template #trigger>
        <n-icon
          p-5px
          rounded-5px
          duration-300
          cursor-pointer
          transition-all
          size="20"
          color="#fff"
          class="hover:bg-[#363737]"
          :component="ArrowBack"
          @click="handleBack"
        />
      </template>
      {{ t('back') }}
    </n-popover>
  </n-flex>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { ArrowBack } from '@vicons/ionicons5';

const emit = defineEmits<{
  (e: 'back'): void;
}>();

const router = useRouter();
const { t } = useI18n();

const handleBack = () => {
  router.back();

  emit('back');
};
</script>

<style scoped></style>
