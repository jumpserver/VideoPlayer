<template>
  <div
    id="main"
    v-loading.fullscreen.lock="fullscreenLoading"
    element-loading-text="解压中"
  >
    <el-row>
      <el-col
        class="main-col"
        :lg="{span:8,offset:8}"
        :md="{span:8,offset:6}"
      >
        <img
          id="logo"
          src="@/assets/jumpserver-menu-logo.png"
          alt="electron-vue"
        />
      </el-col>
      <el-col
        class="main-col"
        :lg="{span:8,offset:9}"
        :md="{span:8,offset:7}"
      >
        <el-upload
          class="upload-demo"
          drag
          action=""
          :show-file-list='false'
          :http-request="checkFileType"
          >
          <i class="el-icon-upload" />
          <div class="el-upload__text">
            将文件拖到此处，或<em>点击上传</em>
          </div>
          <div class="el-upload__tip" slot="tip">
            只能上传录像文件，且不超过500mb
          </div>
        </el-upload>
      </el-col>
      <el-col
        v-if="version === 1"
        :lg="{span:8,offset:10}"
        :md="{span:8,offset:9}"
        style="margin-top:20px;"
      >
        <el-radio v-model="type" label="1">Linux录像</el-radio>
        <el-radio v-model="type" label="2">Windows录像</el-radio>
      </el-col>
      <el-col
        v-if="version === 1"
        :lg="{span:4,offset:12}"
        :md="{span:4,offset:11}"
        style="margin-top:20px;"
      >
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
      type: '0',
      isPushed: false,
      filename: '',
      fullscreenLoading: false,
      version: Number,
      jsonData: ''
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
    checkFileType: function (data) {
      const configDir = (electron.app || electron.remote.app).getPath('userData')
      const fileName = data.file.name
      const fileNameLength = fileName.length
      if (fileName.substring(fileNameLength - 3, fileNameLength) === 'tar') {
        this.filename = fileName.substring(0, fileNameLength - 4)
        compressing.tar.uncompress(data.file.path, configDir).then((files) => {
          this.version = 2
          let condensedFile = (configDir + '/' + this.filename + '.replay.gz')
          const exists = fs.existsSync(condensedFile)
          if (exists) {
            this.type = '1'
          } else {
            this.type = '0'
            condensedFile = configDir + '/' + this.filename + '.cast.gz'
          }
          this.uploadFile(this.filename, condensedFile)
        })
      } else if (fileName.substring(fileNameLength - 2, fileNameLength) === 'gz') {
        this.filename = fileName.substring(0, fileNameLength - 6)
        this.version = 1
        this.uploadFile(this.filename, data.file.path)
      } else {
        this.$message.error('录像文件错误')
      }
    },
    unzipFile: function () {

    },
    uploadFile: function (filename, filepath) {
      const configDir = (electron.app || electron.remote.app).getPath('userData')
      compressing.gzip.uncompress(filepath, (configDir + '/' + filename))
        .then(files => {
          this.fullscreenLoading = true
          if (this.version === 2) {
            console.log('uploadFile')
            let jsonPath = (configDir + '/' + this.filename + '.json')
            fs.readFile(jsonPath, 'utf-8', (_, basicData) => {
              try {
                this.jsonData = JSON.parse(basicData)
              } catch (e) {
                this.$message.error('Json解析错误')
              }
              if (this.jsonData.protocol === 'rdp' || this.jsonData.protocol === 'vnc') {
                this.type = '2'
              }
            })
          }
          return this.delay(5000).then(() => {
            this.fullscreenLoading = false
            this.isPushed = true
            if (this.version === 1) {
              this.$message.warning('1.5.6以前版本的录像，请选择录像类型')
            } else { this.play() }
          }
          )
        }).catch(() => {
          this.$message.error('压缩和录像文件不符, 请重试')
        })
    },
    play: function () {
      if (!this.isPushed) {
        this.$message.error('请先上传文件')
        return
      }
      if (this.type === '0') {
        this.$router.push({ name: 'asciicastplayer', params: {name: this.filename, version: this.version} })
      } else if (this.type === '1') {
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
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  background: radial-gradient(
    ellipse at top left,
    rgb(47, 64, 80) 40%,
    rgb(103, 106, 108) 100%
  );
}
#logo {
  height: auto;
  width: 420px;
  margin-top: -20px;
  margin-bottom: 20px;
}
.main-col {
  text-align: center;
}
</style>
