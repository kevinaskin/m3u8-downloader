<template>
  <div id="app">
    <div id="wrapper">
    <div class="side-bar">
      <div 
        class="sidebar-icon" 
        v-for="(icon, index) in icons" 
        :key="icon.key"
        @click="handleRoute(icon, index)"
        :class="index === curIconIndex ? 'active' : ''">{{icon.name}}</div>
      
      <div class="close" @click="handleClose">关闭</div>
    </div>
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
  </div>
  </div>
</template>

<script>
  export default {
    name: 'm3u8-downloader',

    data () {
      return {
        icons: [
          {
            name: '主界面',
            path: '/'
          },
          {
            name: '探测',
            path: '/history'
          }
        ],
        curIconIndex: 0
      }
    },

    methods: {
      handleRoute (icon, index) {
        this.curIconIndex = index
        this.$router.push(icon.path)
      },

      handleClose () {
        console.log(this.$electron.ipcRenderer)
        window.t = this.$electron.ipcRenderer
        this.$electron.ipcRenderer.send('close-window')
      }
    }
  }
</script>

<style>
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: 'Courier New', Courier, monospace;
  }

  body::-webkit-scrollbar {
    width: 0;
    height: 0;
  }

  #wrapper {
    -webkit-app-region: drag;
    background:
      radial-gradient(
        ellipse at top left,
        rgba(255, 255, 255, 1) 40%,
        rgba(229, 229, 229, .8) 100%
      );
    height: 100vh;
    width: 100vw;
    display: flex;
  }

  .side-bar {
    user-select: none;
    -webkit-app-region: drag;
    width: 80px;
    height: 100%;
    background-color: rgba(67, 147, 216, .8);
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    padding: 15px 0;
    position: relative;
  }

  .sidebar-icon {
    width: 60px;
    border-radius: 30px;
    background: rgba(67, 147, 216, 1);
    text-align: center;
    line-height: 60px;
    color: #fff;
    font-size: 14px;
    font-weight: bold;
    font-family: 'Courier New', Courier, monospace;
    margin-bottom: 15px;
    cursor: pointer;
  }

  .sidebar-icon.active {
    background: #fff;
    color: rgba(67, 147, 216, 1);
  }

  .side-bar .close {
    position: absolute;
    left: 0;
    bottom: 15px;
    width: 100%;
    text-align: center;
    color: #fff;
    padding: 5px;
    cursor: pointer;
  }
</style>
