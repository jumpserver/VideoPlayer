<template>
  <div id="main" v-loading.fullscreen.lock="fullscreenLoading" element-loading-text="解压中">
    <el-row>
      <el-col :span="8" :offset="6">
        <img id="logo" src="~@/assets/jumpserver-menu-logo.png" alt="electron-vue" />
      </el-col>
      <el-col :span="8" :offset="7">
        <el-upload
          class="upload-demo"
          drag
          action=""
          :show-file-list='false'
          :http-request="uploadfile"
          >
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <div class="el-upload__tip" slot="tip">只能上传录像文件，且不超过500mb</div>
        </el-upload>
      </el-col>
      <el-col :span="8" :offset="8" style="margin-top:20px;">
        <el-radio v-model="type" label="1">Linux录像</el-radio>
        <el-radio v-model="type" label="2">Windows录像</el-radio>
      </el-col>
      <el-col :span="4" :offset="10" style="margin-top:20px;">
        <el-button round @click="play" type="primary">播放</el-button>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import compressing from 'compressing'
// import path from 'path'
const electron = require('electron')
export default {
  name: 'mainPage',
  components: {},
  data () {
    return {
      type: '1',
      filename: '',
      fullscreenLoading: false
    }
  },
  methods: {
    delay: function (t, v) {
      return new Promise(function (resolve) {
        setTimeout(resolve.bind(null, v), t)
      })
    },
    uploadfile: function (data) {
      const configDir = (electron.app || electron.remote.app).getPath('userData')
      this.filename = data.file.name.substring(0, data.file.name.length - 3)
      compressing.gzip.uncompress(data.file.path, (configDir + '/' + this.filename))
        .then(files => {
          this.fullscreenLoading = true
          return this.delay(5000).then(() => {
            this.fullscreenLoading = false
          }
          )
        })
    },
    play: function () {
      if (this.type === '1') {
        this.$router.push({ name: 'linuxplayer', params: {name: this.filename} })
      } else {
        this.$router.push({ name: 'guaplayer', params: {name: this.filename} })
      }
    }
  }
}
</script>

<style>
@import url("https://fonts.googleapis.com/css?family=Source+Sans+Pro");
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: "Source Sans Pro", sans-serif;
}

#main {
  background: radial-gradient(
    ellipse at top left,
    rgb(47, 64, 80) 40%,
    rgb(103, 106, 108) 100%
  );
  height: 100vh;
  padding: 60px 80px;
  width: 100vw;
}
#logo {
  height: auto;
  margin-bottom: 20px;
  width: 420px;
}
</style>
