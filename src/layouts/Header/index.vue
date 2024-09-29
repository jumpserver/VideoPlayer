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
          text-base
          icon-hover
          :component="ArrowBack"
          @click="handleBack"
        />
      </template>
      {{ t('back') }}
    </n-popover>
    <n-flex v-if="showInfo" align="center" justify="start">
      <n-h6 m-unset text-13px>
        <n-text flex items-center>
          <n-tag round :bordered="false" size="small" type="success">
            用户 {{ jsonFile?.user }}
            <template #icon>
              <n-icon :component="UserAvatarFilledAlt" />
            </template>
          </n-tag>
        </n-text>
      </n-h6>
      <n-h6 m-unset text-13px>
        <n-text perfx="bar" flex items-center>
          <n-tag round :bordered="false" size="small" type="success">
            资产名称 {{ jsonFile?.asset }}
            <template #icon>
              <n-icon :component="ComputerRound" />
            </template>
          </n-tag>
        </n-text>
      </n-h6>
    </n-flex>
  </n-flex>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { ArrowBack } from '@vicons/ionicons5';
import { ComputerRound } from '@vicons/material';
import { UserAvatarFilledAlt } from '@vicons/carbon';

interface IJsonFile {
  user: string;

  asset: string;

  command_amount: number;

  date_end: string;

  date_start: string;

  duration: string;

  protocol: string;
}

const props = defineProps<{
  jsonFile?: IJsonFile;
}>();

const emit = defineEmits<{
  (e: 'back'): void;
}>();

const showInfo = computed(() => {
  return props.jsonFile && Object.keys(props.jsonFile).length > 0;
});

const router = useRouter();
const { t } = useI18n();

const handleBack = () => {
  router.back();

  emit('back');
};
</script>

<style scoped></style>
