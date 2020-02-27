<template>
  <div id="main" v-loading.fullscreen.lock="fullscreenLoading" element-loading-text="解压中">
    <el-row>
      <el-col :lg="{span:8,offset:8}" :md="{span:8,offset:6}">
        <img id="logo" src="~@/assets/jumpserver-menu-logo.png" alt="electron-vue" />
      </el-col>
      <el-col :lg="{span:8,offset:9}" :md="{span:8,offset:7}">
        <el-upload
          class="upload-demo"
          drag
          action=""
          :show-file-list='false'
          :http-request="checkfiletype"
          >
          <i class="el-icon-upload"></i>
          <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          <div class="el-upload__tip" slot="tip">只能上传录像文件，且不超过500mb</div>
        </el-upload>
      </el-col>
      <el-col :lg="{span:8,offset:10}" :md="{span:8,offset:9}" style="margin-top:20px;">
        <el-radio v-model="type" label="1">Linux录像</el-radio>
        <el-radio v-model="type" label="2">Windows录像</el-radio>
      </el-col>
      <el-col :lg="{span:4,offset:12}" :md="{span:4,offset:11}" style="margin-top:20px;">
        <el-button round @click="play" type="primary">播放</el-button>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import compressing from 'compressing'
// import path from 'path'
const electron = require('electron')
const decompress = require('decompress')
const decompressTargz = require('decompress-targz')
export default {
  name: 'mainPage',
  components: {},
  data () {
    return {
      type: '1',
      ispushed: false,
      filename: '',
      fullscreenLoading: false,
      version: null
      // version 1 旧版本
      // version 2 新版本
    }
  },
  methods: {
    delay: function (t, v) {
      return new Promise(function (resolve) {
        setTimeout(resolve.bind(null, v), t)
      })
    },
    // 解压文件
    // 1. 解压tar.gz
    // 2. 解压gz
    checkfiletype: function (data) {
      const configDir = (electron.app || electron.remote.app).getPath('userData')
      if (data.file.name.substring(data.file.name.length - 2, data.file.name.length) === 'gz') {
        if (data.file.name.substring(data.file.name.length - 6, data.file.name.length - 3) === 'tar') {
          decompress(data.file.path, configDir, {
            plugins: [
              decompressTargz()
            ]
          }).then(() => {
            this.version = 2
            this.filename = data.file.name.substring(0, data.file.name.length - 7)
            console.log(this.filename, configDir)
            compressing.gzip.uncompress((configDir + '/' + this.filename + '/' + this.filename + '.relay.gz'), (configDir + '/' + this.filename + '/' + this.filename))
              .then(files => {
                this.fullscreenLoading = true
                return this.delay(5000).then(() => {
                  this.fullscreenLoading = false
                  this.ispushed = true
                }
                )
              })
          })
        } else {
          this.version = 1
          this.uploadfile(data)
        }
      } else {

      }
    },
    unzipfile: function () {

    },
    uploadfile: function (data) {
      const configDir = (electron.app || electron.remote.app).getPath('userData')
      this.filename = data.file.name.substring(0, data.file.name.length - 3)
      compressing.gzip.uncompress(data.file.path, (configDir + '/' + this.filename))
        .then(files => {
          this.fullscreenLoading = true
          return this.delay(5000).then(() => {
            this.fullscreenLoading = false
            this.ispushed = true
          }
          )
        })
    },
    play: function () {
      if (!this.ispushed) {
        this.$message.error('请先上传文件')
        return
      }
      if (this.type === '1') {
        this.$router.push({ name: 'linuxplayer', params: {name: this.filename, version: this.version} })
      } else {
        this.$router.push({ name: 'guaplayer', params: {name: this.filename, version: this.version} })
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
