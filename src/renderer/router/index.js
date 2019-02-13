import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'main-page',
      component: require('@/components/MainPage').default
    },
    {
      path: '/history',
      name: 'history-page',
      component: require('@/components/HistoryPage').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
