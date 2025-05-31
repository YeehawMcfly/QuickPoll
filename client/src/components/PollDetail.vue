<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { io } from 'socket.io-client';
import { useAuth } from '../store/auth';

interface Poll {
  _id: string;
  question: string;
  options: string[];
  votes: number[];
  createdAt: string;
}

const route = useRoute();
const router = useRouter();
const pollId = computed(() => route.params.id as string);

const poll = ref<Poll | null>(null);
const selectedOption = ref<number | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const votingInProgress = ref(false);

const auth = useAuth();
const API_URL = auth.getApiUrl();
const socket = io(API_URL);

const totalVotes = computed(() => {
  if (!poll.value) return 0;
  return poll.value.votes.reduce((sum, votes) => sum + votes, 0);
});

const getPercentage = (votes: number) => {
  if (!totalVotes.value) return 0;
  return Math.round((votes / totalVotes.value) * 100);
};

const fetchPoll = async () => {
  loading.value = true;
  try {
    const response = await fetch(`${API_URL}/api/polls/${pollId.value}`);
    if (!response.ok) throw new Error('Failed to fetch poll');
    poll.value = await response.json();
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error occurred';
  } finally {
    loading.value = false;
  }
};

const submitVote = async () => {
  if (selectedOption.value === null) return;
  
  if (!auth.isAuthenticated.value) {
    error.value = "Please log in to vote on this poll";
    router.push('/login');
    return;
  }
  
  votingInProgress.value = true;
  try {
    const response = await fetch(`${API_URL}/api/polls/${pollId.value}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        optionIndex: selectedOption.value,
      }),
    });
    
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to submit vote');
    }
    
    poll.value = await response.json();
    selectedOption.value = null;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error occurred';
  } finally {
    votingInProgress.value = false;
  }
};

onMounted(() => {
  fetchPoll();
  
  socket.on('pollUpdated', (updatedPoll: Poll) => {
    if (updatedPoll._id === pollId.value) {
      poll.value = updatedPoll;
    }
  });
});
</script>

<template>
  <div class="poll-detail">
    <div v-if="loading" class="loading">Loading poll...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="!poll" class="not-found">Poll not found</div>
    
    <div v-else class="poll-container">
      <h1>{{ poll.question }}</h1>
      <p class="date">Created on: {{ new Date(poll.createdAt).toLocaleDateString() }}</p>
      
      <div v-if="!auth.isAuthenticated.value" class="login-prompt">
        <p>Please <router-link to="/login">log in</router-link> to vote on this poll.</p>
      </div>

      <form @submit.prevent="submitVote" class="vote-form">
        <div class="options">
          <div 
            v-for="(option, index) in poll.options" 
            :key="index" 
            class="option"
          >
            <div class="option-header">
              <input 
                type="radio" 
                :id="`option-${index}`" 
                :value="index" 
                v-model="selectedOption" 
                name="poll-option"
              />
              <label :for="`option-${index}`">{{ option }}</label>
            </div>
            
            <div class="progress-container">
              <div 
                class="progress-bar" 
                :style="{ width: `${getPercentage(poll.votes[index])}%` }"
              ></div>
              <span class="vote-count">
                {{ poll.votes[index] }} votes ({{ getPercentage(poll.votes[index]) }}%)
              </span>
            </div>
          </div>
        </div>
        
        <button 
          type="submit" 
          class="vote-btn" 
          :disabled="selectedOption === null || votingInProgress || !auth.isAuthenticated.value"
        >
          {{ votingInProgress ? 'Submitting...' : (auth.isAuthenticated.value ? 'Vote' : 'Login to Vote') }}
        </button>
        
        <div class="vote-summary">
          Total votes: {{ totalVotes }}
        </div>
      </form>
      
      <div class="actions">
        <router-link to="/" class="back-link">← Back to All Polls</router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.poll-detail {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.poll-container {
  background-color: #2d3748;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.date {
  font-size: 0.9rem;
  color: #9ca3af;
  margin-bottom: 2rem;
}

.options {
  margin-bottom: 2rem;
}

.option {
  margin-bottom: 1rem;
}

.option-header {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.option-header label {
  margin-left: 0.5rem;
  color: #f3f4f6;
}

.progress-container {
  position: relative;
  height: 2.5rem;
  background-color: #1f2937;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background-color: #3b82f6;
  transition: width 0.3s ease;
}

.vote-count {
  position: absolute;
  top: 50%;
  left: 1rem;
  transform: translateY(-50%);
  font-size: 0.9rem;
  color: white;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0,0,0,0.3);
}

.vote-btn {
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.8rem 1.5rem;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.vote-btn:hover {
  background-color: #2563eb;
}

.vote-btn:disabled {
  background-color: #4b5563;
  cursor: not-allowed;
}

.vote-summary {
  margin-top: 1rem;
  font-size: 0.9rem;
  color: #9ca3af;
  text-align: right;
}

.actions {
  margin-top: 2rem;
  text-align: center;
}

.back-link {
  color: #60a5fa;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
}

.back-link:hover {
  color: #93c5fd;
}

.loading, .error, .not-found {
  text-align: center;
  padding: 2rem;
}

.error {
  color: #ef4444;
}

.login-prompt {
  background-color: rgba(59, 130, 246, 0.1);
  border-left: 3px solid #3b82f6;
  padding: 0.75rem 1rem;
  margin: 1rem 0;
  color: #3b82f6;
}

@media (prefers-color-scheme: light) {
  .poll-container {
    background-color: #fff;
    box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  }
  
  .date {
    color: #6b7280;
  }
  
  .option-header label {
    color: #374151;
  }
  
  .progress-container {
    background-color: #f1f5f9;
  }
  
  .vote-summary {
    color: #6b7280;
  }
}
</style>