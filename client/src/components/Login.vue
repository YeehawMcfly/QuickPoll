<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../store/auth';

const auth = useAuth();
const router = useRouter();

const email = ref('');
const password = ref('');
const error = ref<string | null>(null);
const loading = ref(false);

const API_URL = auth.getApiUrl();

const login = async () => {
  if (!email.value || !password.value) {
    error.value = 'Please enter your email and password';
    return;
  }
  
  loading.value = true;
  error.value = null;
  
  try {
    console.log('Frontend login attempt:', {
      email: email.value,
      password: password.value ? 'provided' : 'missing',
      apiUrl: API_URL
    });

    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.value,
        password: password.value,
      }),
    });
    
    console.log('Login response status:', response.status);
    
    if (!response.ok) {
      const data = await response.json();
      console.error('Login failed response:', data);
      throw new Error(data.message || 'Login failed');
    }
    
    const data = await response.json();
    console.log('Login successful:', { hasToken: !!data.token, user: data.user });
    
    // Store token and user in auth store
    auth.login(data.token, data.user);
    
    // Redirect to home
    router.push('/');
  } catch (err) {
    console.error('Login error:', err);
    error.value = err instanceof Error ? err.message : 'Login failed';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <h2>Welcome Back!</h2>
        <p>Log in to create polls and view your results</p>
      </div>
      
      <form @submit.prevent="login" class="auth-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input 
            type="email" 
            id="email" 
            v-model="email" 
            placeholder="Your email..." 
            required
          />
        </div>
        
        <div class="form-group">
          <label for="password">Password</label>
          <input 
            type="password" 
            id="password" 
            v-model="password" 
            placeholder="Your password..." 
            required
          />
        </div>
        
        <div v-if="error" class="error-message">{{ error }}</div>
        
        <button type="submit" class="submit-btn" :disabled="loading">
          <span v-if="loading" class="loading-spinner small"></span>
          {{ loading ? 'Logging in...' : 'Log In' }}
        </button>
        
        <div class="auth-footer">
          Don't have an account? 
          <router-link to="/register">Register</router-link>
        </div>
      </form>
    </div>
    
    <div class="auth-features">
      <h3>With QuickPoll, you can:</h3>
      <ul class="feature-list">
        <li>
          <div class="feature-icon">📊</div>
          <div class="feature-text">
            <h4>Create custom polls</h4>
            <p>Design polls with unlimited options</p>
          </div>
        </li>
        <li>
          <div class="feature-icon">⚡</div>
          <div class="feature-text">
            <h4>See results in real-time</h4>
            <p>Watch votes as they happen with live updates</p>
          </div>
        </li>
        <li>
          <div class="feature-icon">📱</div>
          <div class="feature-text">
            <h4>Share with anyone</h4>
            <p>Simple links that work on any device</p>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.auth-container {
  display: flex;
  gap: 3rem;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
}

.auth-card {
  flex: 1;
  max-width: 450px;
  width: 100%;
}

.auth-header {
  margin-bottom: 1.5rem;
  text-align: center;
}

.auth-header h2 {
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
}

.auth-header p {
  color: #9ca3af;
}

.auth-form {
  background-color: #2d3748;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #f3f4f6;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 0.8rem;
  border-radius: 4px;
  border: 1px solid #4b5563;
  background-color: #1f2937;
  color: white;
  font-size: 1rem;
  box-sizing: border-box;
}

input:focus {
  border-color: #3b82f6;
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
}

.submit-btn {
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  width: 100%;
  margin-top: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}

.submit-btn:hover {
  background-color: #2563eb;
}

.submit-btn:disabled {
  background-color: #4b5563;
  cursor: not-allowed;
}

.loading-spinner.small {
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-top: 2px solid white;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  color: #ef4444;
  margin-top: 1rem;
  background-color: rgba(239, 68, 68, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  border-left: 3px solid #ef4444;
}

.auth-footer {
  margin-top: 1.5rem;
  text-align: center;
  color: #9ca3af;
}

.auth-footer a {
  color: #60a5fa;
  text-decoration: none;
  font-weight: 500;
}

.auth-footer a:hover {
  text-decoration: underline;
}

.auth-features {
  flex: 1;
  max-width: 450px;
  display: flex;
  flex-direction: column;
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 2rem 0 0 0;
}

.feature-list li {
  display: flex;
  margin-bottom: 1.5rem;
  gap: 1rem;
  align-items: center;
}

.feature-icon {
  font-size: 2rem;
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.feature-text h4 {
  margin: 0 0 0.25rem 0;
  font-size: 1.1rem;
}

.feature-text p {
  margin: 0;
  color: #9ca3af;
}

@media (prefers-color-scheme: light) {
  .auth-form {
    background-color: #fff;
    box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  }
  
  label {
    color: #374151;
  }
  
  input {
    border-color: #d1d5db;
    background-color: #f9fafb;
    color: #1f2937;
  }
  
  .auth-footer {
    color: #6b7280;
  }
  
  .feature-text p {
    color: #6b7280;
  }
}

@media (max-width: 768px) {
  .auth-container {
    flex-direction: column;
    gap: 2rem;
    align-items: stretch;
  }
  
  .auth-card, .auth-features {
    max-width: 100%;
  }
  
  .auth-features {
    order: -1;
  }
}
</style>