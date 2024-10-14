import { createRouter, createWebHashHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    name: 'mainPage',
    path: '/',
    component: () => import('@/layouts/index.vue'),
    children: [
      {
        name: 'asciicastPlayer',
        path: '/asciicastPlayer/:castUrl',
        component: () => import('@/views/asciinemaPlayer/index.vue')
      },
      {
        name: 'guaPlayer',
        path: 'guaPlayer/:guaUrl',
        component: () => import('@/views/guaPlayer/index.vue')
      },
      {
        name: 'linuxPlayer',
        path: 'linuxPlayer',
        component: () => import('@/views/linuxPlayer/index.vue')
      },
      {
        name: 'mp4Player',
        path: 'mp4Player/:videoUrl',
        component: () => import('@/views/mp4Player/index.vue')
      }
    ]
  }
];

export const router = createRouter({
  routes,
  history: createWebHashHistory(),
  scrollBehavior: () => ({ top: 0 })
});
