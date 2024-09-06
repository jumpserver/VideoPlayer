<template>
  <Video :video-url="videoUrl" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import Video from '@/components/Video/index.vue';

const route = useRoute();

// 直接绑定 videoUrl 到 route.params.videoUrl
const videoUrl = computed(() => route.params?.videoUrl as string);
</script>
