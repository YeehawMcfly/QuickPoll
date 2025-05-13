<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAuth } from '../store/auth';
import { io } from 'socket.io-client';
import { useRouter } from 'vue-router';

interface Poll {
  _id: string;
  question: string;
  options: string[];
  votes: number[];
  createdAt: string;
  isActive?: boolean;
}

const polls = ref<Poll[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const searchQuery = ref('');

const auth = useAuth();
const router = useRouter();

const API_URL = 'http://localhost:3000/api';
const socket = io('http://localhost:3000');

const filteredPolls = computed(() => {
  if (!searchQuery.value.trim()) return polls.value;
  const query = searchQuery.value.toLowerCase();
  return polls.value.filter(poll => 
    poll.question.toLowerCase().includes(query) ||
    poll.options.some(option => option.toLowerCase().includes(query))
  );
});

const totalVotes = (poll: Poll) => {
  return poll.votes.reduce((sum, voteCount) => sum + voteCount, 0);
};

const createNewPoll = () => {
  if (auth.isAuthenticated.value) {
    router.push('/create');
  } else {
    router.push('/login');
  }
};

// Fetch polls on component mount
onMounted(async () => {
  try {
    const response = await fetch(`${API_URL}/polls`);
    if (!response.ok) throw new Error('Failed to fetch polls');
    polls.value = await response.json();
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error occurred';
  } finally {
    loading.value = false;
  }
  
  // Listen for poll updates via Socket.IO
  socket.on('pollUpdated', (updatedPoll: Poll) => {
    const index = polls.value.findIndex(p => p._id === updatedPoll._id);
    if (index !== -1) {
      polls.value[index] = updatedPoll;
    }
  });
  
  socket.on('newPoll', (newPoll: Poll) => {
    polls.value.unshift(newPoll);
  });
});
</script>

<template>
  <div class="poll-list">
    <div class="header-section">
      <div class="title-section">
        <h2>Available Polls</h2>
        <p class="subtitle">Vote on existing polls or create your own</p>
      </div>
      <div class="actions-section">
        <div class="search-container">
          <input 
            type="text" 
            v-model="searchQuery" 
            placeholder="Search polls..." 
            class="search-input"
          />
        </div>
        <button @click="createNewPoll" class="create-poll-btn">
          <span class="plus-icon">+</span> Create Poll
        </button>
      </div>
    </div>
    
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading polls...</p>
    </div>
    
    <div v-else-if="error" class="error">
      <p>{{ error }}</p>
      <button @click="createNewPoll" class="create-poll-btn">Create Your First Poll</button>
    </div>
    
    <div v-else-if="polls.length === 0" class="empty-state">
      <div class="empty-icon">📊</div>
      <h3>No polls available yet</h3>
      <p>Be the first to create a poll and get instant feedback!</p>
      <button @click="createNewPoll" class="create-poll-btn large">Create Your First Poll</button>
    </div>
    
    <div v-else class="polls">
      <div v-if="filteredPolls.length === 0" class="no-results">
        <p>No polls match your search. Try different keywords or create a new poll.</p>
      </div>
      
      <div v-for="poll in filteredPolls" :key="poll._id" class="poll-card">
        <div class="poll-header">
          <h3>{{ poll.question }}</h3>
          <span v-if="poll.isActive === false" class="inactive-badge">Inactive</span>
        </div>
        
        <div class="poll-preview">
          <div class="options-preview">
            <span v-for="(option, idx) in poll.options.slice(0, 2)" :key="idx" class="option-chip">
              {{ option }}
            </span>
            <span v-if="poll.options.length > 2" class="more-options">
              +{{ poll.options.length - 2 }} more
            </span>
          </div>
        </div>
        
        <div class="poll-footer">
          <div class="poll-info">
            <span class="vote-count">{{ totalVotes(poll) }} votes</span>
            <span class="date">{{ new Date(poll.createdAt).toLocaleDateString() }}</span>
          </div>
          <router-link :to="`/poll/${poll._id}`" class="view-poll">
            View Poll
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.poll-list {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.title-section {
  flex: 1;
  min-width: 200px;
}

.subtitle {
  color: #9ca3af;
  margin-top: -0.5rem;
}

.actions-section {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-container {
  position: relative;
}

.search-input {
  padding: 0.5rem 1rem 0.5rem 2rem;
  border: 1px solid #4b5563;
  border-radius: 4px;
  background-color: #1f2937;
  color: white;
  width: 200px;
  font-size: 0.9rem;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='11' cy='11' r='8'%3E%3C/circle%3E%3Cpath d='M21 21l-4.35-4.35'%3E%3C/path%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: 0.5rem center;
  background-size: 1rem;
}

.create-poll-btn {
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  transition: background-color 0.2s;
}

.create-poll-btn:hover {
  background-color: #2563eb;
}

.create-poll-btn.large {
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
}

.plus-icon {
  font-weight: bold;
  font-size: 1.2rem;
  line-height: 1;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
}

.loading-spinner {
  border: 3px solid rgba(59, 130, 246, 0.2);
  border-top: 3px solid #3b82f6;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  text-align: center;
  padding: 2rem;
  background-color: rgba(239, 68, 68, 0.1);
  border-radius: 8px;
  border-left: 4px solid #ef4444;
}

.empty-state {
  text-align: center;
  padding: 3rem 2rem;
  border: 2px dashed #4b5563;
  border-radius: 8px;
  color: #9ca3af;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.no-results {
  text-align: center;
  padding: 2rem;
  color: #9ca3af;
}

.polls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.poll-card {
  background: rgba(45, 55, 72, 0.5);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.05);
  animation: slideUp 0.5s ease-out;
  animation-fill-mode: both;
}

.poll-card:nth-child(2) {
  animation-delay: 0.1s;
}

.poll-card:nth-child(3) {
  animation-delay: 0.2s;
}

.poll-card:nth-child(n+4) {
  animation-delay: 0.3s;
}

.poll-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  border-color: rgba(79, 70, 229, 0.3);
}

.poll-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #4f46e5 0%, #818cf8 100%);
  transform: scaleX(0);
  transform-origin: 0 0;
  transition: transform 0.3s ease;
}

.poll-card:hover::before {
  transform: scaleX(1);
}

.view-poll {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  background: linear-gradient(90deg, #4f46e5 0%, #818cf8 100%);
  color: white;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  font-weight: 500;
  box-shadow: 0 4px 10px rgba(79, 70, 229, 0.3);
}

.view-poll:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(79, 70, 229, 0.4);
}

.view-poll::after {
  content: "→";
  opacity: 0;
  transform: translateX(-5px);
  transition: all 0.3s ease;
}

.view-poll:hover::after {
  opacity: 1;
  transform: translateX(3px);
}

.inactive-badge {
  background-color: #6b7280;
  color: white;
  font-size: 0.7rem;
  padding: 0.25rem 0.5rem;
  border-radius: 999px;
  position: absolute;
  top: 1rem;
  right: 1rem;
}

.poll-header {
  margin-bottom: 1rem;
}

.poll-preview {
  margin-bottom: 1rem;
}

.options-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.option-chip {
  background-color: #1f2937;
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.8rem;
}

.more-options {
  color: #9ca3af;
  font-size: 0.8rem;
  padding: 0.25rem 0;
}

.poll-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.poll-info {
  display: flex;
  flex-direction: column;
  font-size: 0.8rem;
}

.vote-count {
  color: #10b981;
  font-weight: 500;
}

.date {
  color: #9ca3af;
}

@media (prefers-color-scheme: light) {
  .subtitle {
    color: #6b7280;
  }
  
  .search-input {
    border-color: #d1d5db;
    background-color: #f9fafb;
    color: #1f2937;
  }
  
  .poll-card {
    background: rgba(255, 255, 255, 0.8);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    border: 1px solid rgba(0, 0, 0, 0.05);
  }
  
  .option-chip {
    background-color: #f3f4f6;
  }
  
  .empty-state {
    border-color: #d1d5db;
    color: #6b7280;
  }
}

@media (max-width: 600px) {
  .header-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .actions-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-input {
    width: 100%;
  }
}
</style>