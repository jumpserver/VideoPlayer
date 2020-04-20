<template>
<div class="content">
  <div class="header">
    <el-row>
      <el-col :span="2" :offset="1">
        <el-button round @click="$router.push({name:'mainPage'})" size="small">返回</el-button>
      </el-col>
      <el-col :span="2" :offset="2">
        <el-button round @click="speedDown" disable icon="el-icon-d-arrow-left" size="small">取消</el-button>
      </el-col>
      <el-col :span="3">
        <el-button round @click="toggle" icon="el-icon-video-play" size="small">播放/暂停</el-button>
      </el-col>
      <el-col :span="2">
        <el-button round @click="speedUp" disable icon="el-icon-d-arrow-right" size="small">快进</el-button>
      </el-col>
      <el-col :span="2">
        <el-button round @click="restart" icon="el-icon-refresh-right" size="small">重置</el-button>
      </el-col>
      <el-col :span="2" :offset="2">
      <p style="line-height:32px;text-aligin:center;">{{this.formatTime(this.time)}}/{{this.duration}}</p>
      </el-col>
      <el-col :span="4">
       <p style="line-height:32px;text-aligin:center;">当前播放速度:{{this.speed}}倍</p>
      </el-col>
      <el-col :span="2" :v-if="this.version_internal === 2">
        <el-tooltip placement="top" style="line-height:32px;" >
          <div slot="content">资产名: {{this.asset}}<br/>用户: {{this.admin_user}}<br/>系统用户: {{this.system_user}}<br/>开始时间: {{this.date_start}}<br/>结束时间: {{this.date_end}}</div>
          <i class="el-icon-warning"></i>
        </el-tooltip>
      </el-col>
      <el-col :span="20" :offset="2">
        <el-slider v-model="percentageTime" @change="runFrom" :format-tooltip="formatTooltip" :min="0" :max="100"></el-slider>
      </el-col>
    </el-row>
  </div>
    <div id="terminal" ref="terminal" style="padding-left:20px;"></div>

</div>
</template>

<script>
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
const fs = require('fs')
const electron = require('electron')
export default {
  name: 'linuxplayer',
  components: {},
  data () {
    return {
      replayData: {},
      timeList: [],
      // markTimeList: {},
      max: 0,
      time: 0,
      duration: '00:00',
      speed: 2,
      tick: 33, // 每33s滴答一次
      timeStep: 33, // 步长
      pos: 0, // 播放点
      timer: '',
      term: '', // 播放文字
      xterm: null,
      percentageTime: 0,
      videopeth: null,
      jsonpeth: null,
      starttime: '',
      asset: '',
      date_start: '',
      date_end: '',
      admin_user: '',
      system_user: '',
      version_internal: ''
    }
  },
  created: function () {
    this.loadfile()
  },
  methods: {
    delay: function (t, v) {
      return new Promise(function (resolve) {
        setTimeout(resolve.bind(null, v), t)
      })
    },
    loadfile: function () {
      let configDir = (electron.app || electron.remote.app).getPath('userData')
      this.videopeth = (configDir + '/' + this.$route.params.name)
      this.jsonpeth = (configDir + '/' + this.$route.params.name + '.json')
      fs.readFile(this.videopeth, 'utf-8', (err, basicdata) => {
        try {
          this.replayData = JSON.parse(basicdata)
        } catch (e) {
          this.$message.error('播放错误')
        }
        this.formatdata()
        console.log(err)
      })
      this.version_internal = 1
      // const date = new Date(Date.parse(this.replay.date_start));
      // this.starttime = date.toLocaleString('zh-CN', { hour12: false }).split('/').join('-');
      if (this.$route.params.version === 2) {
        this.version_internal = 2
        // eslint-disable-next-line handle-callback-err
        fs.readFile(this.jsonpeth, 'utf-8', (err, basicdata) => {
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
    formatdata: function () {
      this.timeList = Object.keys(this.replayData)
      this.timeList = this.timeList.sort((a, b) => {
        return a - b
      })
      this.max = this.timeList[this.timeList.length - 1] * 1000
      this.duration = this.formatTime(this.max)
      // for (let index = 0; index < this.timeList.length; index++) {
      //   this.markTimeList[parseInt(this.timeList[index] / this.max * 100)] = '输入'
      // }
    },
    zeroPad: function (num, minLength) {
      let str = num.toString()
      // Add leading zeroes until string is long enough
      while (str.length < minLength) {
        str = '0' + str
      }
      return str
    },
    restart: function () {
      clearInterval(this.timer)
      this.term = ''
      this.pos = 0
      this.time = 0
      this.percentageTime = 0
      this.isPlaying = true
      this.xterm.reset()
      this.timer = setInterval(() => {
        this.advance()
      }, this.tick)
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
    formatTooltip: function (time) {
      return this.formatTime(time / 100 * this.max)
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
    advance: function () {
    // 每个time间隔执行一次
    // for (let i in this.timeList) {
    // }
      for (; this.pos < this.timeList.length; this.pos++) {
        if (this.timeList[this.pos] * 1000 <= this.time) {
          this.term = this.term + (this.replayData[this.timeList[this.pos]])
          this.xterm.write(this.replayData[this.timeList[this.pos]])
        } else {
          break
        }
      }

      // 超过了总的时间点, 停止播放
      if (this.pos >= this.timeList.length) {
        this.isPlaying = !this.isPlaying
        clearInterval(this.timer)
      }
      this.time += this.timeStep * this.speed
      this.percentageTime = this.time / this.max * 100
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
    runFrom: function () {
      this.xterm.reset()
      this.term = ''
      for (let i = 0; i < this.timeList.length; i++) {
        const v = this.timeList[i]
        const preTime = this.timeList[i - 1]
        this.time = this.percentageTime / 100 * this.max
        if (this.time <= v * 1000 && this.time >= preTime * 1000) {
          this.time = v * 1000
          this.pos = i
          break
        }
      }
      this.advance()
    }
  },
  mounted: function () {
    let terminalContainer = this.$refs.terminal
    this.xterm = new Terminal(
      {
        fontFamily: 'monaco, Consolas, "Lucida Console", monospace',
        lineHeight: 1.2,
        fontSize: 15,
        rightClickSelectsWord: true,
        theme: {
          background: '#1f1b1b'
        }
      })
    const fitAddon = new FitAddon()
    this.xterm.loadAddon(fitAddon)
    this.xterm.open(terminalContainer)
    fitAddon.fit()
    this.xterm.scrollToBottom()
  },
  beforeDestroy: function () {
    this.xterm.destroy()
  }

}
</script>
<style lang="scss">
.xterm {
    font-feature-settings: "liga" 0;
    position: relative;
    user-select: none;
    -ms-user-select: none;
    -webkit-user-select: none;
}

.xterm.focus,
.xterm:focus {
    outline: none;
}

.xterm .xterm-helpers {
    position: absolute;
    top: 0;
    /**
     * The z-index of the helpers must be higher than the canvases in order for
     * IMEs to appear on top.
     */
    z-index: 5;
}

.xterm .xterm-helper-textarea {
    /*
     * HACK: to fix IE's blinking cursor
     * Move textarea out of the screen to the far left, so that the cursor is not visible.
     */
    position: absolute;
    opacity: 0;
    left: -9999em;
    top: 0;
    width: 0;
    height: 0;
    z-index: -5;
    /** Prevent wrapping so the IME appears against the textarea at the correct position */
    white-space: nowrap;
    overflow: hidden;
    resize: none;
}

.xterm .composition-view {
    /* TODO: Composition position got messed up somewhere */
    background: #000;
    color: #FFF;
    display: none;
    position: absolute;
    white-space: nowrap;
    z-index: 1;
}

.xterm .composition-view.active {
    display: block;
}

.xterm .xterm-viewport {
    /* On OS X this is required in order for the scroll bar to appear fully opaque */
    background-color: #000;
    overflow-y: scroll;
    cursor: default;
    position: absolute;
    right: 0;
    left: 0;
    top: 0;
    bottom: 0;
}

.xterm .xterm-screen {
    position: relative;
}

.xterm .xterm-screen canvas {
    position: absolute;
    left: 0;
    top: 0;
}

.xterm .xterm-scroll-area {
    visibility: hidden;
}

.xterm-char-measure-element {
    display: inline-block;
    visibility: hidden;
    position: absolute;
    top: 0;
    left: -9999em;
    line-height: normal;
}

.xterm {
    cursor: text;
}

.xterm.enable-mouse-events {
    /* When mouse events are enabled (eg. tmux), revert to the standard pointer cursor */
    cursor: default;
}

.xterm.xterm-cursor-pointer {
    cursor: pointer;
}

.xterm.column-select.focus {
    /* Column selection mode */
    cursor: crosshair;
}

.xterm .xterm-accessibility,
.xterm .xterm-message {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    right: 0;
    z-index: 10;
    color: transparent;
}

.xterm .live-region {
    position: absolute;
    left: -9999px;
    width: 1px;
    height: 1px;
    overflow: hidden;
}

.xterm-dim {
    opacity: 0.5;
}

.xterm-underline {
    text-decoration: underline;
}

.content{
  height: 100%;
}

.header{
  padding-top: 15px;
}
#terminal{
  // cursor: text;
  width: 100%;
  background: #1f1b1b;
  height: calc(100% - 85px);
}
.xterm-viewport::-webkit-scrollbar { width: 0 !important }
</style>
