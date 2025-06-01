<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from './store/auth';
import { io, Socket } from 'socket.io-client';

const auth = useAuth();
const router = useRouter();

// Socket connection
let socket: Socket;
const newPollNotification = ref(false);

const logout = () => {
  auth.logout();
  router.push('/');
};

onMounted(() => {
  // Connect to socket for real-time notifications
  socket = io(auth.getApiUrl());
  
  socket.on('newPoll', () => {
    newPollNotification.value = true;
    setTimeout(() => {
      newPollNotification.value = false;
    }, 3000);
  });
});

onUnmounted(() => {
  if (socket) {
    socket.disconnect();
  }
});
</script>

<template>
  <div class="app-container">
    <!-- Refined Header -->
    <header class="modern-header">
      <div class="header-content">
        <div class="logo-section">
          <router-link to="/" class="logo-link">
            <div class="logo-icon">📊</div>
            <div class="logo-text">
              <h1 class="logo-title">QuickPoll</h1>
              <span class="logo-subtitle">Real-time Polling</span>
            </div>
          </router-link>
        </div>

        <nav class="main-nav">
          <router-link v-if="auth.isAuthenticated.value" to="/create" class="nav-link">
            <span class="nav-icon">➕</span>
            <span class="nav-text">Create</span>
          </router-link>
          
          <router-link v-if="auth.isAuthenticated.value" to="/dashboard" class="nav-link">
            <span class="nav-icon">📈</span>
            <span class="nav-text">My Polls</span>
          </router-link>
        </nav>

        <div class="auth-section">
          <template v-if="!auth.isAuthenticated.value">
            <router-link to="/login" class="auth-btn login">
              <span class="auth-icon">🔐</span>
              <span>Login</span>
            </router-link>
            <router-link to="/register" class="auth-btn register">
              <span class="auth-icon">✨</span>
              <span>Sign Up</span>
            </router-link>
          </template>
          
          <template v-else>
            <div class="user-info">
              <div class="user-avatar">
                {{ auth.getUser()?.username?.charAt(0)?.toUpperCase() }}
              </div>
              <div class="user-details">
                <span class="user-name">{{ auth.getUser()?.username }}</span>
              </div>
            </div>
            <button @click="logout" class="auth-btn logout">
              <span class="auth-icon">🚪</span>
              <span>Logout</span>
            </button>
          </template>
        </div>
      </div>
    </header>

    <!-- New Poll Notification -->
    <div v-if="newPollNotification" class="notification">
      <span class="notification-icon">🎉</span>
      New poll created! Check it out.
    </div>

    <!-- Main Content -->
    <main class="main-content">
      <div class="content-wrapper">
        <router-view />
      </div>
    </main>

    <!-- Refined Footer -->
    <footer class="modern-footer">
      <div class="footer-content">
        <div class="footer-section">
          <div class="footer-logo">
            <span class="footer-icon">📊</span>
            <span class="footer-brand">QuickPoll</span>
          </div>
          <p class="footer-description">Create and share polls instantly with real-time results.</p>
        </div>
        
        <div class="footer-section">
          <h4>Quick Links</h4>
          <div class="footer-links">
            <router-link to="/">Home</router-link>
            <router-link to="/create" v-if="auth.isAuthenticated.value">Create Poll</router-link>
            <router-link to="/dashboard" v-if="auth.isAuthenticated.value">My Polls</router-link>
          </div>
        </div>
        
        <div class="footer-section">
          <h4>Built with</h4>
          <div class="tech-stack">
            <span class="tech-item">Vue 3</span>
            <span class="tech-item">TypeScript</span>
            <span class="tech-item">Node.js</span>
            <span class="tech-item">MongoDB</span>
          </div>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p>&copy; 2024 QuickPoll. Made with ❤️ for instant polling.</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--background);
}

/* Refined Header Styles */
.modern-header {
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0.75rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.logo-section {
  flex-shrink: 0;
}

.logo-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  transition: all 0.2s ease;
  padding: 0.25rem 0.5rem;
  border-radius: 8px;
}

.logo-link:hover {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.04);
}

.logo-icon {
  font-size: 1.75rem;
  filter: drop-shadow(0 2px 4px rgba(99, 102, 241, 0.3));
}

.logo-text {
  display: flex;
  flex-direction: column;
}

.logo-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logo-subtitle {
  font-size: 0.65rem;
  color: var(--text-muted);
  font-weight: 500;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  line-height: 1;
}

.main-nav {
  display: flex;
  gap: 0.5rem;
  flex: 1;
  justify-content: center;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  text-decoration: none;
  color: var(--text-secondary);
  font-weight: 500;
  transition: all 0.2s ease;
  font-size: 0.9rem;
}

.nav-link:hover {
  color: var(--text-primary);
  background: rgba(99, 102, 241, 0.08);
  transform: translateY(-1px);
}

.nav-link.router-link-active {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}

.nav-icon {
  font-size: 1rem;
}

.nav-text {
  font-size: 0.85rem;
}

.auth-section {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: white;
  font-size: 0.9rem;
}

.user-details {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: 500;
  color: var(--text-primary);
  font-size: 0.85rem;
}

.auth-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.85rem;
  transition: all 0.2s ease;
  border: none;
  cursor: pointer;
  white-space: nowrap;
}

.auth-btn.login {
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.auth-btn.login:hover {
  background: rgba(255, 255, 255, 0.04);
  color: var(--text-primary);
  transform: translateY(-1px);
}

.auth-btn.register {
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.25);
}

.auth-btn.register:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);
}

.auth-btn.logout {
  background: transparent;
  color: var(--danger);
  border: 1px solid rgba(239, 68, 68, 0.25);
}

.auth-btn.logout:hover {
  background: rgba(239, 68, 68, 0.08);
  transform: translateY(-1px);
}

.auth-icon {
  font-size: 0.9rem;
}

/* Notification */
.notification {
  position: fixed;
  top: 80px;
  right: 1.5rem;
  background: linear-gradient(135deg, var(--secondary) 0%, #34d399 100%);
  color: white;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.25);
  z-index: 1000;
  animation: slideInRight 0.4s ease-out;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  font-size: 0.9rem;
}

.notification-icon {
  font-size: 1rem;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Main Content */
.main-content {
  flex: 1;
  min-height: calc(100vh - 160px);
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { 
    opacity: 0; 
    transform: translateY(10px);
  }
  to { 
    opacity: 1; 
    transform: translateY(0);
  }
}

/* Refined Footer */
.modern-footer {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  margin-top: auto;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1.5rem 1.5rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.footer-section h4 {
  color: #f1f5f9;
  margin-bottom: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.footer-icon {
  font-size: 1.25rem;
}

.footer-brand {
  font-size: 1.1rem;
  font-weight: 600;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.footer-description {
  color: #cbd5e1;
  line-height: 1.5;
  margin: 0;
  font-size: 0.9rem;
}

.footer-links {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.footer-links a {
  color: #e2e8f0;
  text-decoration: none;
  padding: 0.2rem 0;
  transition: color 0.2s ease;
  font-size: 0.9rem;
}

.footer-links a:hover {
  color: var(--primary-light);
}

.tech-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.tech-item {
  background: rgba(99, 102, 241, 0.15);
  color: #c7d2fe;
  padding: 0.2rem 0.6rem;
  border-radius: 12px;
  font-size: 0.75rem;
  border: 1px solid rgba(99, 102, 241, 0.25);
}

.footer-bottom {
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  padding: 1rem 1.5rem;
  text-align: center;
  max-width: 1200px;
  margin: 0 auto;
}

.footer-bottom p {
  color: #cbd5e1;
  margin: 0;
  font-size: 0.85rem;
}

/* Light mode adjustments */
@media (prefers-color-scheme: light) {
  .modern-header {
    background: rgba(248, 250, 252, 0.9);
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  }
  
  .logo-link:hover {
    background: rgba(0, 0, 0, 0.04);
  }
  
  .nav-link:hover {
    background: rgba(99, 102, 241, 0.08);
  }
  
  .user-info {
    background: rgba(0, 0, 0, 0.04);
    border-color: rgba(0, 0, 0, 0.08);
  }
  
  .auth-btn.login {
    border-color: rgba(0, 0, 0, 0.15);
  }
  
  .auth-btn.login:hover {
    background: rgba(0, 0, 0, 0.04);
  }
  
  .modern-footer {
    background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
    border-top: 1px solid rgba(0, 0, 0, 0.12);
  }
  
  .footer-section h4 {
    color: #1e293b;
  }
  
  .footer-description {
    color: #475569;
  }
  
  .footer-links a {
    color: #334155;
  }
  
  .footer-links a:hover {
    color: var(--primary);
  }
  
  .tech-item {
    background: rgba(99, 102, 241, 0.1);
    color: var(--primary);
    border-color: rgba(99, 102, 241, 0.2);
  }
  
  .footer-bottom p {
    color: #64748b;
  }
}

/* Responsive Design */
@media (max-width: 1024px) {
  .header-content {
    padding: 0.75rem 1rem;
  }
  
  .main-nav {
    gap: 0.25rem;
  }
  
  .nav-text {
    display: none;
  }
  
  .user-details {
    display: none;
  }
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 0.75rem;
    align-items: stretch;
    padding: 0.75rem 1rem;
  }
  
  .logo-section {
    align-self: center;
  }
  
  .main-nav {
    justify-content: center;
    order: 2;
  }
  
  .auth-section {
    justify-content: center;
    order: 1;
  }
  
  .nav-text {
    display: block;
  }
  
  .content-wrapper {
    padding: 1rem;
  }
  
  .footer-content {
    padding: 1.5rem 1rem 1rem;
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .notification {
    right: 1rem;
    left: 1rem;
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .logo-icon {
    font-size: 1.5rem;
  }
  
  .logo-title {
    font-size: 1.1rem;
  }
  
  .nav-link {
    padding: 0.4rem 0.75rem;
  }
  
  .auth-btn {
    padding: 0.4rem 0.75rem;
    font-size: 0.8rem;
  }
}
</style>
