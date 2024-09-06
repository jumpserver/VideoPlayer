<template>
  <plyr-vue @register="registerVideoPlayer" p-20px />
</template>

<script setup lang="ts">
// @ts-ignore
import { PlyrVue, usePlyrVue } from 'plyr-vue';
import { onMounted, watch } from 'vue';

const props = defineProps<{
  videoUrl: string;
}>();

watch(
  () => props.videoUrl,
  () => {
    initVideoPlayer();
  }
);

const [registerVideoPlayer, videoPlayerInstance] = usePlyrVue({
  autoplay: false,
  clickToPlay: true,
  controls: ['play', 'progress', 'current-time', 'mute', 'volume', 'settings', 'fullscreen', 'pip'],
  settings: ['quality', 'speed', 'loop'],
  speed: {
    selected: 1, // 播放的默认速度
    options: [0.75, 1, 1.25, 1.5, 2] // 速度选项
  },
  // 国际化多语言配置
  i18n: {
    speed: '播放速率',
    normal: '正常'
  },
  // 时间轴段落标记
  markers: {
    enabled: false,
    points: [
      { time: 5, label: '段落标记1' },
      { time: 10, label: '段落标记2' }
    ]
  }
});

const initVideoPlayer = () => {
  videoPlayerInstance.value.source = {
    type: 'video',
    title: 'Example title',
    sources: [
      {
        src: props.videoUrl,
        type: 'video/mp4'
      }
    ],
    poster: 'https://cdn.plyr.io/static/demo/View_From_A_Blue_Moon_Trailer-HD.jpg',
    tracks: [
      {
        kind: 'captions',
        label: 'English',
        srcLang: 'en',
        src: '',
        default: true
      },
      {
        kind: 'captions',
        label: 'Vietnamese',
        srcLang: 'vi',
        src: ''
      }
    ]
  };
};

onMounted(() => {
  initVideoPlayer();
});
</script>
