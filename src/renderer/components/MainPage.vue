<template>
  <div class="content-wrapper">
    <input
      class="url-input"
      ref="urlinput"
      type="text" 
      placeholder="在此输入视频网址, 并按回车确认" 
      v-model="url"
      @blur="handleKeydown"
      @keydown="handleKeydown">
    <p class="tip">只有通过m3u8方式分发的视频才会被检测到</p>

    <webview ref="webview" allowpopups class="webview"></webview>

    <div class="log-wrapper" ref="log">
      <div class="target" v-for="target in targets" :key="target.key">{{target}}</div>
    </div>
  </div>
</template>

<script>
  export default {
    name: 'main-page',
    components: {},
    mounted () {
      this.$refs.urlinput.focus()
      this.$refs.webview.addEventListener('did-get-response-details', details => {
        this.handleResponse(details)
      })
    },
    activated () {
      this.url = ''
      this.$refs.webview.src = 'about:blank'
    },
    data () {
      return {
        url: '',
        targets: []
      }
    },
    methods: {
      handleResponse (details) {
        const {originalURL} = details
        if (originalURL.indexOf('m3u8') > -1) {
          this.makeRequest(originalURL)
        }
      },
      handleKeydown (e) {
        // https://www.duboku.com/vodplay/131-1-3.html
        if (e.keyCode === 13) {
          this.$refs.webview.src = this.url
        }
      },

      makeRequest (url) {
        this.$http(url)
          .then(res => {
            if (res.status === 200) {
              const data = res.data.split('\n')
              const dataFiltered = data.filter(line => {
                return line.indexOf('.ts') > -1
              })
              if (dataFiltered.length) {
                this.targets.push(`[发现]:  ${url}`)
                this.saveHistory(url, this.url, dataFiltered)
                this.$nextTick(() => {
                  this.$refs.log.scrollTop = this.$refs.log.scrollHeight
                })
              }
            }
          })
      },

      saveHistory (target, url, data) {
        let history = []
        if (localStorage.__history) {
          history = JSON.parse(localStorage.__history) || []
        }
        let index = history.findIndex(item => {
          return item.target === target
        })
        console.log(index)
        if (index > -1) {
          history[index] = {
            target,
            originalURL: url,
            createdAt: Date.now()
          }
        } else {
          history.push({
            target,
            originalURL: url,
            createdAt: Date.now()
          })
        }
        // /20190125/ujUl6YLp/hls/FFWly8722000.ts
        localStorage[target] = JSON.stringify(data)
        localStorage.__history = JSON.stringify(history)
      }
    }
  }
</script>

<style>
  .content-wrapper {
    -webkit-app-region: no-drag;
    width: calc(100vw - 80px);
    height: 100%;
    padding: 15px;
  }

  .content-wrapper p {
    color: #999;
    font-weight: bold;
  }

  .tip {
    font-size: 14px;
    margin-bottom: 10px;
  }

  .url-input {
    width: 80%;
    height: 60px;
    line-height: 60px;
    font-size: 30px;
    margin-bottom: 10px;
    border: 0;
    outline: none;
    border-bottom: 1px solid #ccc;
    background-color: transparent;
  }

  .webview {
    width: 100%;
    height: calc(100% - 200px);
    background-color: rgba(67, 147, 216, .2);
    border-top-left-radius: 3px;
    border-top-right-radius: 3px;
  }

  .log-wrapper {
    width: 100%;
    height: 100px;
    background-color: rgba(0, 0, 0, .08);
    border-bottom-left-radius: 3px;
    border-bottom-right-radius: 3px;
    overflow-y: auto;
    padding: 5px;
  }
</style>
