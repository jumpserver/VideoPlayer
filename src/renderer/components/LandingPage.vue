<template>
  <div id="main">
    <el-row>
      <el-col :span="8" :offset="5">
        <img id="logo" src="~@/assets/logo.png" alt="electron-vue" />
      </el-col>
      <el-col :span="8" :offset="6">
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
    </el-row>
  </div>
</template>

<script>
// import { remote } from 'electron'
export default {
  name: 'landing-page',
  components: {},
  data () {
    return {
      datasrc: ''
    }
  },
  methods: {
    uploadfile: function (data) {
      // 打开系统本地文件或者网页链接
      const {shell} = require('electron')
      // Open a local file in the default app
      shell.openItem(data.file.path)

      // Open a URL in the default way
      shell.openExternal('https://github.com')
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
    rgba(255, 255, 255, 1) 40%,
    rgba(229, 229, 229, 0.9) 100%
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
