import { createRouter, createWebHistory } from 'vue-router';
import PollList from './components/PollList.vue';
import CreatePoll from './components/CreatePoll.vue';
import PollDetail from './components/PollDetail.vue';
import Login from './components/Login.vue';
import Register from './components/Register.vue';
import Dashboard from './components/Dashboard.vue';

const routes = [
  { path: '/', component: PollList },
  { path: '/create', component: CreatePoll },
  { path: '/poll/:id', component: PollDetail },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/dashboard', component: Dashboard },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;