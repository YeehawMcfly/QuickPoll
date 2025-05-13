import { createRouter, createWebHistory } from 'vue-router';
import PollList from './components/PollList.vue';
import CreatePoll from './components/CreatePoll.vue';
import PollDetail from './components/PollDetail.vue';

const routes = [
  { path: '/', component: PollList },
  { path: '/create', component: CreatePoll },
  { path: '/poll/:id', component: PollDetail },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;