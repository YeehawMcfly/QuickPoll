import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import PollList from './components/PollList.vue';
import Login from './components/Login.vue';
import Register from './components/Register.vue';
import CreatePoll from './components/CreatePoll.vue';
import PollDetail from './components/PollDetail.vue';
import Dashboard from './components/Dashboard.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'Home',
    component: PollList
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/create',
    name: 'CreatePoll',
    component: CreatePoll
  },
  {
    path: '/poll/:id',
    name: 'PollDetail',
    component: PollDetail,
    props: true
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard
  },
  // Catch-all route for 404s
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
];

// Detect if we're on GitHub Pages and use appropriate base
const isGitHubPages = window.location.hostname.includes('github.io');
const base = isGitHubPages ? '/QuickPoll/' : '/';

// Use history mode for GitHub Pages with proper fallback
const router = createRouter({
  history: createWebHistory(base),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  }
});

// Handle navigation errors gracefully
router.onError((error) => {
  console.warn('Router navigation error:', error);
  // Fallback to home page on navigation errors
  router.push('/');
});

export default router;