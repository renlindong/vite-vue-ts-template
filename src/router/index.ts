import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/Home/index.vue')
  },
  {
    path: '/',
    name: 'about',
    component: () => import('@/views/About/index.vue')
  }
]

export default createRouter({
  history: createWebHistory(),
  routes
})
