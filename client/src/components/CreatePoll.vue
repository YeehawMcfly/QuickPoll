<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const question = ref('');
const options = ref(['', '']);
const error = ref<string | null>(null);
const loading = ref(false);

const router = useRouter();

const addOption = () => {
  options.value.push('');
};

const removeOption = (index: number) => {
  if (options.value.length > 2) {
    options.value.splice(index, 1);
  }
};

const createPoll = async () => {
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
    const response = await fetch('http://localhost:3000/api/polls', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
  background-color: #2d3748;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.form-group, .option-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #f3f4f6;
}

input {
  width: 100%;
  padding: 0.8rem;
  border-radius: 4px;
  border: 1px solid #4b5563;
  background-color: #1f2937;
  color: white;
  font-size: 1rem;
}

input:focus {
  border-color: #3b82f6;
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
}

.option-group {
  display: flex;
  gap: 0.5rem;
}

.remove-btn {
  background-color: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0 0.7rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.remove-btn:hover {
  background-color: #dc2626;
}

.add-option {
  background-color: #10b981;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  margin-top: 0.5rem;
  transition: background-color 0.2s;
}

.add-option:hover {
  background-color: #059669;
}

.submit-btn {
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1.5rem;
  transition: background-color 0.2s;
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

@media (prefers-color-scheme: light) {
  .poll-form {
    background-color: #fff;
    box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  }
  
  label {
    color: #374151;
  }
  
  input {
    border: 1px solid #d1d5db;
    background-color: #f9fafb;
    color: #1f2937;
  }
}
</style>