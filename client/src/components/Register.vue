<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../store/auth';

const auth = useAuth();
const router = useRouter();

const username = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const error = ref<string | null>(null);
const loading = ref(false);

const register = async () => {
  if (!username.value || !email.value || !password.value) {
    error.value = 'Please fill out all fields';
    return;
  }
  
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match';
    return;
  }
  
  if (password.value.length < 6) {
    error.value = 'Password must be at least 6 characters';
    return;
  }
  
  loading.value = true;
  error.value = null;
  
  try {
    // Call auth store register function with the form data
    await auth.register(username.value, email.value, password.value);
    
    // Redirect to home
    router.push('/');
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Registration failed';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="auth-container">
    <h2>Create an Account</h2>
    
    <form @submit.prevent="register" class="auth-form">
      <div class="form-group">
        <label for="username">Username:</label>
        <input 
          type="text" 
          id="username" 
          v-model="username" 
          placeholder="Choose a username..." 
          required
        />
      </div>
      
      <div class="form-group">
        <label for="email">Email:</label>
        <input 
          type="email" 
          id="email" 
          v-model="email" 
          placeholder="Your email address..." 
          required
        />
      </div>
      
      <div class="form-group">
        <label for="password">Password:</label>
        <input 
          type="password" 
          id="password" 
          v-model="password" 
          placeholder="Create a password..." 
          required
        />
      </div>
      
      <div class="form-group">
        <label for="confirm-password">Confirm Password:</label>
        <input 
          type="password" 
          id="confirm-password" 
          v-model="confirmPassword" 
          placeholder="Confirm your password..." 
          required
        />
      </div>
      
      <div v-if="error" class="error-message">{{ error }}</div>
      
      <button type="submit" class="submit-btn" :disabled="loading">
        {{ loading ? 'Registering...' : 'Register' }}
      </button>
      
      <div class="auth-footer">
        Already have an account? 
        <router-link to="/login">Log in</router-link>
      </div>
    </form>
  </div>
</template>

<style scoped>
.auth-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 450px;
  margin: 0 auto;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
}

.auth-form {
  background-color: #2d3748;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  width: 100%;
}

.form-group {
  margin-bottom: 1.5rem;
  width: 100%;
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
}

.submit-btn:hover {
  background-color: #2563eb;
}

.submit-btn:disabled {
  background-color: #4b5563;
  cursor: not-allowed;
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
}
</style>