<template>
  <Video :video-url="videoUrl" />
</template>

<script setup lang="ts">
import Video from '@/components/Video/index.vue';
import { useRoute } from 'vue-router';
import { computed } from 'vue';

const route = useRoute();

const videoUrl = computed(() => {
  return route.params?.videoUrl as string;
});
</script>

<style scoped></style>
