import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'mainPage',
      component: require('@/components/mainPage').default
    },
    {
      path: '/linuxplayer',
      name: 'linuxplayer',
      component: require('@/components/player/linuxPlayer').default
    },
    {
      path: '/guaplayer',
      name: 'guaplayer',
      component: require('@/components/player/guaPlayer').default
    },
    {
      path: '*',
      redirect: '/'
    }
  ]
})
