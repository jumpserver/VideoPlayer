<template>
<div class="content" v-loading.fullscreen.lock="fullscreenLoading" element-loading-text="加载中">
  <div class="header">
    <el-row>
      <el-col :span="2" :offset="1">
        <el-button round @click="$router.push({name:'mainPage'})" size="small">返回</el-button>
      </el-col>
      <el-col :span="3">
        <el-button round icon="el-icon-video-play" @click="play" size="small">播放/暂停</el-button>
      </el-col>
      <el-col :span="2">
        <el-button round icon="el-icon-refresh-right" @click="restart" size="small">重置</el-button>
      </el-col>
      <el-col :span="2" :offset="2">
        <p style="line-height:1.5;text-aligin:center;">{{this.position}}/{{this.duration}}</p>
      </el-col>
      <el-col :span="2" :offset="2" :v-if="this.version_internal === 2">
        <el-tooltip placement="top" style="line-height:32px;">
          <div slot="content">
            资产名: {{this.asset}}<br/>
            用户: {{this.admin_user}}<br/>
            账号: {{this.account || ''}}<br/>
            开始时间: {{this.date_start}}<br/>
            结束时间: {{this.date_end}}
          </div>
          <i class="el-icon-warning"></i>
        </el-tooltip>
      </el-col>
      <el-col :span="20" :offset="2">
        <el-slider v-model="percent" @change="runFrom" :format-tooltip="formatTooltip" :min="0" :max="max"></el-slider>
      </el-col>
    </el-row>
  </div>
  <LoadingProgress
      :percentage="percentage"
      :is-show-loading-progress="isShowLoadingProgress"
  />
  <div>
    <div class="terminal center" ref="display" @click="play" ></div>
  </div>
</div>
</template>

<script>
import * as Guacamole from 'guacamole-common-js-jumpserver/dist/guacamole-common'
import LoadingProgress from '../LoadingProgress'

const fs = require('fs')
const electron = require('electron')
export default {
  name: 'guaplayer',
  components: {
    LoadingProgress
  },
  data () {
    return {
      percentage: 0,
      originalPosition: 0,
      destinationPosition: 0,
      isShowLoadingProgress: false,
      calcInterval: '',
      fullscreenLoading: true,
      recording: '',
      display: '',
      max: 100,
      percent: 0,
      duration: '00:00',
      position: '00:00',
      asset: '',
      date_start: '',
      date_end: '',
      admin_user: '',
      account: '',
      version_internal: Number
    }
  },
  mounted: function () {
    this.loadfile()
  },
  methods: {
    formatTooltip: function () {
      return this.formatTime(this.percent)
    },
    loadfile: function () {
      let configDir = (electron.app || electron.remote.app).getPath('userData')
      let videoPath = (configDir + '/' + this.$route.params.name)
      let jsonPath = (configDir + '/' + this.$route.params.name + '.json')
      fs.readFile(videoPath, 'utf-8', (err, data) => {
        const tunnel = new Guacamole.StaticHTTPTunnel()
        this.recording = new Guacamole.SessionRecording(tunnel)
        this.display = this.recording.getDisplay()
        const displayElm = this.$refs.display
        displayElm.appendChild(this.display.getElement())
        displayElm.addEventListener('contextmenu', e => {
          e.stopPropagation()
          if (e.preventDefault) {
            e.preventDefault()
          }
          e.returnValue = false
        })
        this.fullscreenLoading = false
        this.recording.connect(data)
        this.initRecording()
        console.log(err)
      })
      this.version_internal = 1
      if (this.$route.params.version === 2) {
        this.version_internal = 2
        // eslint-disable-next-line handle-callback-err
        fs.readFile(jsonPath, 'utf-8', (err, data) => {
          let jsonData
          try {
            jsonData = JSON.parse(data)
          } catch (e) {
            this.$message.error('视频摘要文件解析错误')
          }
          let dateStart = new Date(Date.parse(jsonData.date_start))
          let dataEnd = new Date(Date.parse(jsonData.date_end))
          this.date_start = dateStart.toLocaleString('zh-CN', { hour12: false }).split('/').join('-')
          this.date_end = dataEnd.toLocaleString('zh-CN', { hour12: false }).split('/').join('-')
          this.asset = jsonData.asset
          this.account = jsonData.account
          this.admin_user = jsonData.user
        })
      }
    },
    zeroPad: function (num, minLength) {
      let str = num.toString()
      // Add leading zeroes until string is long enough
      while (str.length < minLength) {
        str = '0' + str
      }
      return str
    },
    formatTimeWithSeconds: function (seconds) {
      let hour = 0
      let minute = 0
      let second = 0
      const ref = [3600, 60, 1]
      for (let i = 0; i < ref.length; i++) {
        const val = ref[i]
        while (val <= seconds) {
          seconds -= val
          switch (i) {
            case 0:
              hour++
              break
            case 1:
              minute++
              break
            case 2:
              second++
              break
          }
        }
      }
      return [hour, minute, second]
    },
    formatTime: function (millis) {
      const totalSeconds = millis / 1000
      const [hour, minute, second] = this.formatTimeWithSeconds(totalSeconds)
      let time = this.zeroPad(minute, 2) + ':' + this.zeroPad(second, 2)
      if (hour > 0) {
        time = this.zeroPad(hour, 2) + ':' + time
      }
      return time
    },
    initRecording: function () {
      this.recording.onplay = () => {
        this.isPlaying = true
      }
      this.recording.onseek = (millis) => {
        this.position = this.formatTime(millis)
        this.percent = millis
      }
      this.recording.onprogress = () => {
        this.play()
      }
      this.recording.onpause = () => {
        this.isPlaying = false
      }
      this.recording.play()
      this.display.scale(0.85)
      this.max = this.recording.getDuration()
      this.duration = this.formatTime(this.max)
    },
    restart () {
      this.percent = 0
      this.runFrom()
    },
    runFrom: function () {
      this.isShowLoadingProgress = true
      this.destinationPosition = this.percent
      this.originalPosition = this.recording.getPosition()
      this.percentage = 0
      this.recording.seek(this.percent, () => {
        this.percentage = 100
        this.isShowLoadingProgress = false
        if (this.calcInterval) {
          clearInterval(this.calcInterval)
          this.calcInterval = ''
        }
      })
      this.calculateProgress()
    },
    calculateProgress: function () {
      this.calcInterval = setInterval(() => {
        const currentPosition = this.recording.getPosition()
        this.percentage = Math.ceil((currentPosition - this.originalPosition) / (this.destinationPosition - this.originalPosition) * 100)
      }, 1000)
    },
    play: function () {
      if (!this.recording.isPlaying()) {
        this.recording.play()
        this.isPlaying = true
      } else {
        this.recording.pause()
        this.isPlaying = false
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.content{
  height: 100%;
}
.header{
  padding-top: 15px;
}
.center{
  display:flex;
  align-items:center;
  justify-content:center;
  text-align:justify;
}
.terminal{
  width: auto;
  height: calc(100% - 85px);
}
</style>
