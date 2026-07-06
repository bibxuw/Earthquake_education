// router/index.ts
import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  { path: '/', name: 'Home', component: () => import('../views/Home.vue') },
  // 补全对应的 name，确保与 Home.vue 中的 goToComponent 参数一致
  { path: '/wave', name: 'WaveSimulator', component: () => import('../views/WaveSimulator.vue') },
  { path: '/hazard', name: 'HazardHunt', component: () => import('../views/HazardGame.vue') },
  { path: '/action', name: 'EvacuationRoute', component: () => import('../views/BusInertia.vue') }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;