<template>
<div class="content" v-loading.fullscreen.lock="fullscreenLoading" element-loading-text="加载中">
  <div class="header">
    <el-row>
      <el-col :span="2" :offset="1">
        <el-button round @click="$router.push({name:'mainPage'})" size="small">返回</el-button>
      </el-col>
      <el-col :span="2" :offset="2">
        <el-button round disabled icon="el-icon-d-arrow-left"  size="small">取消</el-button>
      </el-col>
      <el-col :span="3">
        <el-button round icon="el-icon-video-play" @click="play" size="small">播放/暂停</el-button>
      </el-col>
      <el-col :span="2">
        <el-button round disabled icon="el-icon-d-arrow-right"  size="small">快进</el-button>
      </el-col>
      <el-col :span="2">
        <el-button round icon="el-icon-refresh-right" @click="restart" size="small">重置</el-button>
      </el-col>
      <el-col :span="2" :offset="2">
      <p style="line-height:32px;text-aligin:center;">{{this.position}}/{{this.duration}}</p>
      </el-col>
      <el-col :span="2" :offset="2" :v-if="this.version_internal === 2">
        <el-tooltip placement="top" style="line-height:32px;">
          <div slot="content">资产名: {{this.asset}}<br/>用户: {{this.admin_user}}<br/>系统用户: {{this.system_user}}<br/>开始时间: {{this.date_start}}<br/>结束时间: {{this.date_end}}</div>
          <i class="el-icon-warning"></i>
        </el-tooltip>
      </el-col>
      <el-col :span="20" :offset="2">
        <el-slider v-model="percentageTime" @change="runFrom" :format-tooltip="formatTooltip" :min="0" :max="100"></el-slider>
      </el-col>
    </el-row>
  </div>
  <div>
    <el-col :span="22" :offset="1" class="terminal">
    <div ref="display" @click="play"></div>
    </el-col>
  </div>
</div>
</template>

<script>
import * as Guacamole from 'guacamole-common-js-jumpserver/dist/guacamole-common'
const fs = require('fs')
const electron = require('electron')
export default {
  name: 'guaplayer',
  components: {},
  data () {
    return {
      replayData: '',
      fullscreenLoading: true,
      recording: '',
      display: '',
      recordingDisplay: '',
      max: 100,
      percent: 0,
      spend: 0,
      duration: '00:00',
      position: '00:00',
      asset: '',
      date_start: '',
      date_end: '',
      admin_user: '',
      system_user: '',
      version_internal: Number
    }
  },
  created: function () {
    this.loadfile()
  },
  methods: {
    debugelement: function () {

    },
    formatTooltip: function (time) {
      return this.formatTime(time / 100 * this.max)
    },
    loadfile: function () {
      let configDir = (electron.app || electron.remote.app).getPath('userData')
      let videopeth = (configDir + '/' + this.$route.params.name)
      let jsonpeth = (configDir + '/' + this.$route.params.name + '.json')
      fs.readFile(videopeth, 'utf-8', (err, basicdata) => {
        this.replayData = basicdata
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
        this.recording.connect(this.replayData)
        this.initRecording()
        console.log(err)
      })
      this.version_internal = 1
      if (this.$route.params.version === 2) {
        this.version_internal = 2
        // eslint-disable-next-line handle-callback-err
        fs.readFile(jsonpeth, 'utf-8', (err, basicdata) => {
          let jsonData
          try {
            jsonData = JSON.parse(basicdata)
          } catch (e) {
            this.$message.error('播放错误')
          }
          let dateStart = new Date(Date.parse(jsonData.date_start))
          let dataEnd = new Date(Date.parse(jsonData.date_end))
          this.date_start = dateStart.toLocaleString('zh-CN', { hour12: false }).split('/').join('-')
          this.date_end = dataEnd.toLocaleString('zh-CN', { hour12: false }).split('/').join('-')
          this.asset = jsonData.asset
          this.system_user = jsonData.system_user
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
      this.recording.onresize = (width, height) => {
        console.log(width, height)
      // Do not scale if displayRef has no width
        // if (!height) {
        //   return
        // }
        // Scale displayRef to fit width of container
        // const widthScale = this.displayRef.offsetWidth / width
        // const heightScale = this.displayRef.offsetHeight / height
        // const minScale = widthScale < heightScale ? widthScale : heightScale
        // this.recordingDisplay.scale(minScale)
      }
      this.recording.onseek = (millis) => {
        this.position = this.formatTime(millis)
        this.percent = millis
      }

      this.recording.onprogress = (millis) => {
        this.duration = this.formatTime(millis)
        this.max = millis
        this.play()
      }
      // If paused, the play/pause button should read "Play"
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
      // this.recording.seek(this.percentageTime / 100 * this.max)
      this.recording.seek(this.percentageTime / 100 * this.max, () => {})
    },
    cancelSeek: function (e) {
      this.recording.play()
      e.stopPropagation()
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
  },
  computed: {
    percentageTime: {
      get () {
        return this.percent / this.max * 100
      },
      set () {

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
.terminal{
  width: 100%;
  height: calc(100% - 85px);
}
</style>
