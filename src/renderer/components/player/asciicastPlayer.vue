<template>
<div class="content">
  <div class="header">
    <el-row>
      <el-col :span="2" :offset="1">
        <el-button round @click="$router.push({name:'mainPage'})" size="small">返回</el-button>
      </el-col>
      <el-col :span="2" :offset="17" :v-if="this.version_internal === 2">
        <el-tooltip placement="top" style="line-height:32px; cursor: pointer;" >
          <div slot="content">
            资产名: {{this.asset}}<br/>
            用户: {{this.admin_user}}<br/>
            系统用户: {{this.system_user}}<br/>
            开始时间: {{this.date_start}}<br/>
            结束时间: {{this.date_end}}
          </div>
          <i class="el-icon-warning"></i>
        </el-tooltip>
      </el-col>
    </el-row>
  </div>
  <div id="terminal" ref="terminal" style="padding:10px"></div>
</div>
</template>

<script>
const fs = require('fs')
const electron = require('electron')

export default {
  name: 'asciicastplayer',
  components: {},
  data () {
    return {
      replayData: '',
      timeList: [],
      videopeth: null,
      jsonpeth: null,
      asset: '',
      admin_user: '',
      system_user: '',
      version_internal: '',
      date_start: '',
      date_end: '',
      isPlaying: false,
      speed: 2,
      startAt: 0,
      cols: 0,
      rows: 0
    }
  },
  created: function () {
    this.loadfile()
  },
  methods: {
    loadfile: function () {
      let configDir = (electron.app || electron.remote.app).getPath('userData')
      this.videopeth = (configDir + '/' + this.$route.params.name)
      this.jsonpeth = (configDir + '/' + this.$route.params.name + '.json')
      this.version_internal = 1
      if (this.$route.params.version === 2) {
        this.version_internal = 2
        fs.readFile(this.jsonpeth, 'utf-8', (_, basicdata) => {
          let jsonData
          try {
            jsonData = JSON.parse(basicdata)
          } catch (e) {
            this.$message.error('播放错误')
          }
          fs.readFile(this.videopeth, 'utf-8', (_, basicdata) => {
            this.replayData = basicdata
            this.isPlaying = true
            this.player = this.createPlayer()
            console.log(this.player)
          })
          let dateStart = new Date(Date.parse(jsonData.date_start))
          let dataEnd = new Date(Date.parse(jsonData.date_end))
          this.date_start = dateStart.toLocaleString('zh-CN', { hour12: false }).split('/').join('-')
          this.date_end = dataEnd.toLocaleString('zh-CN', { hour12: false }).split('/').join('-')
          this.asset = jsonData.asset
          this.system_user = jsonData.system_user
          this.admin_user = jsonData.user
          this.cols = window.innerWidth
          this.rows = window.innerHeight - 50
        })
      }
    },
    getPlayerOptions () {
      return {
        width: this.cols,
        startAt: this.startAt,
        speed: this.speed,
        preload: true,
        fit: false,
        fontSize: '13px',
        autoPlay: this.isPlaying ? 1 : 0
      }
    },
    createPlayer () {
      const opt = this.getPlayerOptions()
      return window.AsciinemaPlayer.create(this.replayData, this.$refs.terminal, opt)
    },
    restart: function () {
      this.pos = 0
      this.isPlaying = true
    },
    toggle: function () {
      if (this.isPlaying) {
        clearInterval(this.timer)
        this.isPlaying = !this.isPlaying
      } else {
        this.timer = setInterval(() => {
          this.advance()
        }, this.tick)
        this.isPlaying = !this.isPlaying
      }
    },
    stop: function () {
      clearInterval(this.timer)
      this.isPlaying = false
    },
    speedUp: function () {
      this.speed += 1
    },
    speedDown: function () {
      this.speed -= 1
    },
    toSafeLocalDateStr (d) {
      const dates = d.toLocaleString('zh-CN', {hour12: false})
      return dates.split('/').join('-')
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
  padding-bottom: 15px;
}
#terminal{
  width: 100%;
  background: #1f1b1b;
  height: calc(100% - 62px);
}
</style>
