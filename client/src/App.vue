<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useAuth } from './store/auth';
import { useRouter } from 'vue-router';
import PageTransition from './components/PageTransition.vue';

const { isAuthenticated, logout } = useAuth();   // <- destructure
const router = useRouter();
const notification = ref('');
const showNotification = ref(false);
const appLoaded = ref(false);

const displayNotification = (message: string) => {
  notification.value = message;
  showNotification.value = true;
  setTimeout(() => (showNotification.value = false), 3000);
};

const onLogout = () => {
  logout(); 
  displayNotification('You have been logged out successfully');
  router.push('/');
};

const navigateToLogin = () => router.push('/login');

onMounted(() => {
  setTimeout(() => {
    appLoaded.value = true;
  }, 500);
});
</script>

<template>
  <div v-if="!appLoaded" class="app-loader">
    <div class="loader"></div>
  </div>
  
  <div v-else class="app-container">
    <header>
      <div class="logo-container">
        <h1>QuickPoll</h1>
        <span class="tagline">Create and share polls in seconds</span>
      </div>
      <nav>
        <router-link to="/" class="nav-link">Home</router-link>

        <template v-if="isAuthenticated">
          <router-link to="/create" class="nav-link">Create Poll</router-link>
          <router-link to="/dashboard" class="nav-link">My Polls</router-link>
          <button @click="onLogout" class="auth-btn logout">
            <span class="icon">👤</span> Logout
          </button>
        </template>

        <template v-else>
          <router-link to="/login" class="auth-btn login nav-link">
            <span class="icon">👤</span> Login
          </router-link>
          <router-link to="/register" class="auth-btn register nav-link">
            Register
          </router-link>
        </template>
      </nav>
    </header>

    <div v-if="showNotification" class="notification">{{ notification }}</div>
    <main>
      <PageTransition>
        <router-view/>
      </PageTransition>
    </main>
    <footer>
      <div class="footer-content">
        <p>QuickPoll - Real-time polling application</p>
        <div class="footer-links">
          <a href="#">About</a>
          <a href="#">Terms</a>
          <a href="#">Privacy</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<style>
body {
  margin: 0;
  min-height: 100vh;
  display: flex;
  font-family: system-ui, -apple-system, sans-serif;
}

#app {
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding: 0;
  text-align: left;
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
}

/* Improved header styling for logged out state */
header {
  background: linear-gradient(90deg, #1e293b 0%, #334155 100%);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  position: sticky;
  top: 0;
  z-index: 10;
}

.logo-container h1 {
  background: linear-gradient(90deg, #4f46e5 0%, #818cf8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.tagline {
  font-size: 0.9rem;
  color: #94a3b8;
  margin-top: -0.5rem;
  font-weight: 300;
}

nav {
  display: flex;
  gap: 1rem;
  align-items: center;
}

nav a {
  color: #f1f5f9;
  text-decoration: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  transition: all 0.25s ease;
  font-weight: 500;
}

nav a:hover {
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

nav a.router-link-active {
  background: linear-gradient(90deg, #4f46e5 0%, #818cf8 100%);
  color: white;
  box-shadow: 0 4px 10px rgba(79, 70, 229, 0.3);
}

/* unify link base style */
nav .nav-link {
  color: #f1f5f9;
  background: transparent;
  border: 1px solid transparent;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-weight: 500;
  transition: 0.25s ease;
  text-decoration: none;
}
nav .nav-link:hover {
  background: rgba(255,255,255,0.1);
  transform: translateY(-2px);
}

/* active link gradient */
nav .nav-link.router-link-active {
  background: linear-gradient(90deg, #4f46e5 0%, #818cf8 100%);
  color: white;
  box-shadow: 0 4px 10px rgba(79,70,229,0.3);
}

/* logout stays a button */
.auth-btn.logout {
  background: transparent;
  border: 1px solid #f87171;
  color: #f87171;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.auth-btn.logout:hover {
  background: rgba(248,113,113,0.1);
  transform: translateY(-2px);
}

/* remove permanent gradients */
.auth-btn.login,
.auth-btn.register {
  background: transparent;
  border: 1px solid #818cf8;
  color: #f1f5f9;
}
.auth-btn.login:hover,
.auth-btn.register:hover {
  background: rgba(129,140,248,0.1);
  transform: translateY(-2px);
}

/* login/register active gradient */
.auth-btn.login.router-link-active,
.auth-btn.register.router-link-active {
  background: linear-gradient(90deg, #4f46e5 0%, #818cf8 100%);
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 10px rgba(79,70,229,0.3);
}

.icon {
  font-size: 0.95rem;
}

.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  background: linear-gradient(90deg, #10b981 0%, #34d399 100%);
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);
  font-weight: 500;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

main {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

footer {
  background: linear-gradient(90deg, #1a1e2c 0%, #2d3748 100%);
  padding: 2rem;
  color: #94a3b8;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-links {
  display: flex;
  gap: 2rem;
}

.footer-links a {
  color: #94a3b8;
  text-decoration: none;
  transition: all 0.3s ease;
}

.footer-links a:hover {
  color: #e5e7eb;
  transform: translateY(-2px);
}

/* Light mode styles */
@media (prefers-color-scheme: light) {
  header {
    background: linear-gradient(90deg, #4f46e5 0%, #818cf8 100%);
  }
  
  .logo-container h1 {
    background: white;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: 0 2px 10px rgba(255, 255, 255, 0.1);
  }
  
  .tagline {
    color: rgba(255, 255, 255, 0.9);
  }
  
  nav a {
    color: white;
  }
  
  nav a:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
  
  nav a.router-link-active {
    background-color: white;
    color: #4f46e5;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  }
  
  .auth-btn.login {
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.5);
    background-color: rgba(255, 255, 255, 0.2);
  }
  
  .auth-btn.login:hover {
    background-color: rgba(255, 255, 255, 0.3);
  }
  
  .highlight-btn.register {
    background-color: white;
    color: #4f46e5;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  }
  
  .auth-btn.logout {
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.7);
  }
  
  .auth-btn.logout:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
}

@media (max-width: 768px) {
  header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  nav {
    margin-top: 1rem;
    width: 100%;
    justify-content: space-between;
  }
  
  .footer-content {
    flex-direction: column;
    text-align: center;
  }
  
  .footer-links {
    margin-top: 1rem;
  }
}
</style>
