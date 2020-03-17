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
      <el-col  v-if="version === 1" :lg="{span:8,offset:10}" :md="{span:8,offset:9}" style="margin-top:20px;">
        <el-radio v-model="type" label="1">Linux录像</el-radio>
        <el-radio v-model="type" label="2">Windows录像</el-radio>
      </el-col>
      <el-col  v-if="version === 1" :lg="{span:4,offset:12}" :md="{span:4,offset:11}" style="margin-top:20px;">
        <el-button round @click="play" type="primary">播放</el-button>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import compressing from 'compressing'
// import path from 'path'
const fs = require('fs')
const electron = require('electron')
export default {
  name: 'mainPage',
  components: {},
  data () {
    return {
      type: '1',
      ispushed: false,
      filename: '',
      fullscreenLoading: false,
      version: Number,
      jsonData: ''
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
      if (data.file.name.substring(data.file.name.length - 3, data.file.name.length) === 'tar') {
        this.filename = data.file.name.substring(0, data.file.name.length - 4)
        compressing.tar.uncompress(data.file.path, configDir).then((files) => {
          this.version = 2
          this.uploadfile(this.filename, (configDir + '/' + this.filename + '.replay.gz'))
        })
      } else if (data.file.name.substring(data.file.name.length - 2, data.file.name.length) === 'gz') {
        this.filename = data.file.name.substring(0, data.file.name.length - 6)
        this.version = 1
        this.uploadfile(this.filename, data.file.path)
      } else {
        this.$message.error('录像文件错误')
      }
    },
    unzipfile: function () {

    },
    uploadfile: function (filename, filepath) {
      const configDir = (electron.app || electron.remote.app).getPath('userData')
      compressing.gzip.uncompress(filepath, (configDir + '/' + filename))
        .then(files => {
          this.fullscreenLoading = true
          if (this.version === 2) {
            let jsonpeth = (configDir + '/' + this.filename + '.json')
            fs.readFile(jsonpeth, 'utf-8', (_, basicdata) => {
              try {
                this.jsonData = JSON.parse(basicdata)
              } catch (e) {
                this.$message.error('Json解析错误')
              }
              if (this.jsonData.protocol === 'rdp') {
                this.type = '2'
              } else { this.type = '1' }
            })
          }
          return this.delay(5000).then(() => {
            this.fullscreenLoading = false
            this.ispushed = true
            if (this.version === 1) {
              this.$message.warning('1.5.6以前版本的录像，请选择录像类型')
            } else { this.play() }
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
