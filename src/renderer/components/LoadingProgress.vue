<template>
<div v-loading.fullscreen.lock="isShowLoadingProgress" :element-loading-text="content">
</div>
</template>

<script>
export default {
  name: 'LoadingProgress',
  components: {},
  props: {
    isShowLoadingProgress: {
      type: Boolean,
      default: false
    },
    percentage: {
      type: Number,
      default: 0
    }
  },
  data () {
    return {
      content: '',
      contentPrefix: '视频格式特殊，玩命解析渲染中... '
    }
  },
  watch: {
    percentage (newValue, oldValue) {
      this.content = this.contentPrefix + newValue + '%'
    }
  },
  methods: {

  }
}
</script>

<style scoped>

</style>
