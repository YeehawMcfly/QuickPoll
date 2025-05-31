<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../store/auth';

const question = ref('');
const options = ref(['', '']);
const error = ref<string | null>(null);
const loading = ref(false);

const router = useRouter();
const auth = useAuth();
const API_URL = auth.getApiUrl();

onMounted(() => {
  // Redirect to login if not authenticated
  if (!auth.isAuthenticated.value) {
    router.push('/login');
  }
});

const addOption = () => {
  options.value.push('');
};

const removeOption = (index: number) => {
  if (options.value.length > 2) {
    options.value.splice(index, 1);
  }
};

const createPoll = async () => {
  if (!auth.isAuthenticated.value) {
    error.value = 'You must be logged in to create a poll';
    return;
  }

  if (question.value.trim() === '') {
    error.value = 'Question cannot be empty';
    return;
  }
  
  const validOptions = options.value.filter(opt => opt.trim() !== '');
  if (validOptions.length < 2) {
    error.value = 'At least 2 options are required';
    return;
  }
  
  loading.value = true;
  error.value = null;
  
  try {
    const token = auth.getToken();
    
    const response = await fetch(`${API_URL}/api/polls`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        question: question.value,
        options: validOptions,
      }),
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to create poll');
    }
    
    const newPoll = await response.json();
    router.push(`/poll/${newPoll._id}`);
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error occurred';
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="create-poll">
    <h2>Create a New Poll</h2>
    
    <form @submit.prevent="createPoll" class="poll-form">
      <div class="form-group">
        <label for="question">Question:</label>
        <input 
          type="text" 
          id="question" 
          v-model="question" 
          placeholder="Ask a question..." 
          required
        />
      </div>
      
      <div class="options-container">
        <h3>Options:</h3>
        <div 
          v-for="(option, index) in options" 
          :key="index" 
          class="option-group"
        >
          <input 
            type="text" 
            v-model="options[index]" 
            :placeholder="`Option ${index + 1}`" 
            required
          />
          <button 
            type="button" 
            @click="removeOption(index)" 
            class="remove-btn"
            :disabled="options.length <= 2"
          >
            X
          </button>
        </div>
        
        <button type="button" @click="addOption" class="add-option">
          + Add Option
        </button>
      </div>
      
      <div v-if="error" class="error-message">{{ error }}</div>
      
      <button type="submit" class="submit-btn" :disabled="loading">
        {{ loading ? 'Creating...' : 'Create Poll' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.create-poll {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.poll-form {
  background-color: #1e293b;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.form-group, .option-group {
  margin-bottom: 1.25rem;
}

label {
  display: block;
  margin-bottom: 0.6rem;
  color: #f1f5f9;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 0.8rem;
  border-radius: 8px;
  border: 1px solid #475569;
  background-color: #334155;
  color: white;
  font-size: 1rem;
  box-sizing: border-box;
  transition: all 0.2s ease;
}

input:focus {
  border-color: #818cf8;
  outline: none;
  box-shadow: 0 0 0 2px rgba(129, 140, 248, 0.3);
}

.option-group {
  display: flex;
  gap: 0.6rem;
}

.remove-btn {
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0 0.7rem;
  cursor: pointer;
  transition: background-color 0.2s;
  box-shadow: 0 2px 4px rgba(239, 68, 68, 0.2);
}

.remove-btn:hover {
  background-color: #dc2626;
  transform: translateY(-2px);
}

.add-option {
  background: linear-gradient(90deg, #10b981 0%, #34d399 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1rem;
  cursor: pointer;
  margin-top: 0.8rem;
  transition: all 0.3s ease;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
  display: inline-flex;
  align-items: center;
}

.add-option:hover {
  background: linear-gradient(90deg, #059669 0%, #10b981 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(16, 185, 129, 0.3);
}

.submit-btn {
  background: linear-gradient(90deg, #6366f1 0%, #818cf8 100%);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.9rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1.8rem;
  transition: all 0.3s ease;
  font-weight: 500;
  box-shadow: 0 4px 6px rgba(99, 102, 241, 0.25);
  width: 100%;
}

.submit-btn:hover {
  background: linear-gradient(90deg, #4f46e5 0%, #6366f1 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(99, 102, 241, 0.3);
}

.submit-btn:disabled {
  background: #64748b;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.error-message {
  color: #f87171;
  margin-top: 1rem;
  background-color: rgba(239, 68, 68, 0.1);
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border-left: 3px solid #ef4444;
}

@media (prefers-color-scheme: light) {
  .poll-form {
    background-color: white;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(0, 0, 0, 0.05);
  }
  
  label {
    color: #334155;
  }
  
  input {
    border: 1px solid #cbd5e1;
    background-color: #f8fafc;
    color: #334155;
  }
}
</style>