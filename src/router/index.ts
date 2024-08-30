import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    name: 'mainPage',
    path: '/',
    component: () => import('@/views/mainPage/index.vue')
  },
  {
    name: 'asciinemaPlayer',
    path: '/asciicastPlayer',
    component: () => import('@/views/asciinemaPlayer/index.vue')
  },
  {
    name: 'guaPlayer',
    path: '/guaPlayer',
    component: () => import('@/views/guaPlayer/index.vue')
  },
  {
    name: 'linuxPlayer',
    path: '/linuxPlayer',
    component: () => import('@/views/linuxPlayer/index.vue')
  }
];

export const router = createRouter({
  routes,
  history: createWebHistory(),
  scrollBehavior: () => ({ top: 0 })
});
