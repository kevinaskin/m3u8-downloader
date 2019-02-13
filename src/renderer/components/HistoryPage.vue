<template>
  <div class="history-wrapper">
    <div class="title-bar">
      <div class="title">探测历史</div>
      <div class="btn" @click="clearHistroy">清除历史</div>
    </div>

    <div class="historys">
      <div class="history-item" v-for="history in historys" :key="history.key">
        <p>源地址: {{history.target}}</p>
        <p>生成时间: {{new Date(history.createdAt).toLocaleString()}}</p>
        <div class="percent" :style="`width: ${currPercent ? currPercent * 100 + '%' : '0'}`"></div>
        <div class="btn-wrap">
          <div class="download" @click="handleDownload(history)">下载</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import url from 'url'
import fs from 'fs'
import os from 'os'
import path from 'path'
import https from 'https'
import http from 'http'

export default {
  name: 'history-page',

  data () {
    return {
      historys: [],
      currPercent: 0
    }
  },

  mounted () {
    this.getHistory()
  },

  activated () {
    this.getHistory()
  },

  methods: {
    getHistory () {
      let history = localStorage.__history || '[]'
      this.historys = JSON.parse(history)
    },

    clearHistroy () {
      localStorage.clear()
      this.getHistory()
    },

    handleDownload (history) {
      if (localStorage[history.target]) {
        let data = JSON.parse(localStorage[history.target])
        let length = 0
        let parsedUrl = url.parse(history.target)
        data.forEach(d => {
          let targetUrl = `${parsedUrl.protocol}//${parsedUrl.host}${d}`
          let homePath = os.homedir()
          let mkdirs = dir => {
            if (fs.existsSync(dir)) return
            let parent = path.dirname(dir)
            if (!fs.existsSync(parent)) {
              mkdirs(parent)
            }
            fs.mkdirSync(dir)
          }
          const outputFilename = d.split('/')[d.split('/').length - 1]
          let TARGET_DIR = homePath + '/m3u8-downloader-files'
          mkdirs(TARGET_DIR)
          let downloader = parsedUrl.protocol === 'https:' ? https : http
          downloader.get(targetUrl, res => {
            const ws = fs.createWriteStream(path.join(TARGET_DIR, outputFilename))
            res.pipe(ws)
            ws.on('close', () => {
              console.log(length / data.length)
              this.currPercent = length / data.length
              length++
              if (length === data.length) {
                let bufferArray = []
                for (let i = 0; i < data.length; i++) {
                  const name = data[i].split('/')[data[i].split('/').length - 1]
                  const buffer = fs.readFileSync(path.join(TARGET_DIR, name))
                  bufferArray[i] = buffer
                  if (data.length === bufferArray.length) {
                    let newBuffer = Buffer.concat(bufferArray)
                    fs.writeFile(path.join(TARGET_DIR, '合并 ' + name), newBuffer, () => {
                      data.forEach(f => {
                        fs.unlinkSync(path.join(TARGET_DIR, f.split('/')[f.split('/').length - 1]))
                      })
                      this.currPercent = 0
                    })
                  }
                }
              }
            })
          })
        })
      }
    }
  }
}
</script>

<style>
  .history-wrapper {
    -webkit-app-region: no-drag;
    width: calc(100vw - 80px);
    height: 100%;
    padding: 15px;

    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .title-bar {
    display: flex;
    justify-content: space-between;
    width: 100%;
    align-items: center;
  }

  .title {
    color: #666;
    font-size: 24px;
    font-weight: bold;
  }

  .btn {
    cursor: pointer;
    background-color: rgba(67, 147, 216, .58);
    border-radius: 3px;
    font-size: 16px;
    height: 40px;
    padding: 0 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #fff;
  }

  .historys {
    width: 100%;
    height: calc(100% - 50px);
    background: rgba(67, 147, 216, .18);
    border-radius: 3px;
    overflow-y: auto;
  }

  .history-item {
    padding: 15px;
    width: calc(100% - 30px);
    margin: 15px;
    background: #fff;
    border-radius: 2px;
    position: relative;
    overflow: hidden;
  }

  .history-item .percent {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 0;
    background: rgba(0, 255, 0, .2);
    transition: .2s;
  }

  .history-item:hover {
    background: rgba(255, 255, 255, .68);
    box-shadow: 0 0 10px rgba(0,0,0,.08);
  }

  .history-item:hover .btn-wrap {
    transform: translateX(-100%);
  }

  .history-item p {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .history-item .btn-wrap {
    position: absolute;
    left: 100%;
    top: 0;
    width: 120px;
    height: 100%;
    background: rgba(67, 147, 216, .58);
    transition: .3s;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .history-item .btn-wrap .download {
    padding: 15px;
    color: #fff;
    font-weight: bold;
    cursor: pointer;
  }
</style>
