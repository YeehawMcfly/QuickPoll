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
const checkingVoteStatus = ref(true);

const auth = useAuth();
const API_URL = auth.getApiUrl();
const socket = io(API_URL);

// Check if user has voted (from local storage + server response)
const hasVoted = computed(() => {
  return auth.hasVotedOnPoll(pollId.value);
});

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

const checkVoteStatus = async () => {
  if (!auth.isAuthenticated.value) {
    checkingVoteStatus.value = false;
    return;
  }
  
  try {
    await auth.checkVotedStatus(pollId.value);
  } catch (err) {
    console.log('Could not check vote status:', err);
  } finally {
    checkingVoteStatus.value = false;
  }
};

const submitVote = async () => {
  if (selectedOption.value === null) return;
  
  if (!auth.isAuthenticated.value) {
    error.value = "Please log in to vote on this poll";
    return;
  }
  
  if (hasVoted.value) {
    error.value = "You have already voted on this poll";
    return;
  }
  
  votingInProgress.value = true;
  error.value = null;
  
  try {
    const token = auth.getToken();
    const response = await fetch(`${API_URL}/api/polls/${pollId.value}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        optionIndex: selectedOption.value,
      }),
    });
    
    if (!response.ok) {
      const data = await response.json();
      if (response.status === 403) {
        // Mark as voted even if server says already voted
        auth.markPollAsVoted(pollId.value);
        return;
      }
      throw new Error(data.message || 'Failed to submit vote');
    }
    
    const updatedPollData = await response.json();
    poll.value = updatedPollData;
    
    // Mark this poll as voted in local storage
    auth.markPollAsVoted(pollId.value);
    selectedOption.value = null;
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error occurred';
  } finally {
    votingInProgress.value = false;
  }
};

onMounted(async () => {
  await fetchPoll();
  await checkVoteStatus();
  
  socket.on('pollUpdated', (updatedPoll: Poll) => {
    if (updatedPoll._id === pollId.value) {
      poll.value = updatedPoll;
    }
  });
});
</script>

<template>
  <div class="poll-detail">
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <p>Loading poll...</p>
    </div>
    
    <div v-else-if="error" class="error-container">
      <div class="error-icon">⚠️</div>
      <h3>Something went wrong</h3>
      <p>{{ error }}</p>
      <button @click="fetchPoll" class="retry-btn">Try Again</button>
    </div>
    
    <div v-else-if="!poll" class="not-found">
      <div class="not-found-icon">🔍</div>
      <h3>Poll Not Found</h3>
      <p>The poll you're looking for doesn't exist or has been removed.</p>
      <router-link to="/" class="back-home-btn">Back to Home</router-link>
    </div>
    
    <div v-else class="poll-container">
      <div class="poll-header">
        <h1 class="poll-question">{{ poll.question }}</h1>
        <div class="poll-meta">
          <span class="date">{{ new Date(poll.createdAt).toLocaleDateString() }}</span>
          <span class="total-votes">{{ totalVotes }} total votes</span>
        </div>
      </div>

      <!-- Vote status checking -->
      <div v-if="checkingVoteStatus && auth.isAuthenticated.value" class="status-checking">
        <div class="checking-spinner"></div>
        <p>Checking your vote status...</p>
      </div>

      <!-- Already voted message -->
      <div v-else-if="hasVoted && !error" class="success-message">
        <div class="success-icon">✅</div>
        <div class="success-content">
          <h4>You've already voted!</h4>
          <p>Thanks for participating! You can see the live results below.</p>
        </div>
      </div>

      <!-- Login prompt for unauthenticated users -->
      <div v-else-if="!auth.isAuthenticated.value && !hasVoted && !checkingVoteStatus" class="login-prompt">
        <div class="login-icon">🔐</div>
        <div class="login-content">
          <h4>Login Required</h4>
          <p>Please <router-link to="/login" class="login-link">log in</router-link> to vote on this poll.</p>
        </div>
      </div>

      <div class="voting-section">
        <form @submit.prevent="submitVote" class="vote-form">
          <div class="options">
            <div 
              v-for="(option, index) in poll.options" 
              :key="index" 
              class="option"
              :class="{ 
                'selected': selectedOption === index, 
                'disabled': hasVoted || !auth.isAuthenticated.value || checkingVoteStatus,
                'voted': hasVoted 
              }"
            >
              <div class="option-content">
                <div class="option-input">
                  <input 
                    type="radio" 
                    :id="`option-${index}`" 
                    :value="index" 
                    v-model="selectedOption" 
                    name="poll-option"
                    :disabled="hasVoted || !auth.isAuthenticated.value || checkingVoteStatus"
                  />
                  <label :for="`option-${index}`" class="option-label">{{ option }}</label>
                  <div v-if="hasVoted" class="voted-indicator">✓ Voted</div>
                </div>
                
                <div class="progress-container">
                  <div 
                    class="progress-bar" 
                    :style="{ width: `${getPercentage(poll.votes[index])}%` }"
                  ></div>
                  <div class="vote-stats">
                    <span class="vote-count">{{ poll.votes[index] }} votes</span>
                    <span class="percentage">{{ getPercentage(poll.votes[index]) }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="vote-actions" v-if="!hasVoted && !checkingVoteStatus">
            <button 
              type="submit" 
              class="vote-btn" 
              :disabled="selectedOption === null || votingInProgress || !auth.isAuthenticated.value"
            >
              <span v-if="votingInProgress" class="loading-spinner small"></span>
              <span v-else-if="!auth.isAuthenticated.value" class="vote-icon">🔒</span>
              <span v-else class="vote-icon">📊</span>
              
              {{ votingInProgress ? 'Submitting...' : 
                  !auth.isAuthenticated.value ? 'Login to Vote' : 'Submit Vote' }}
            </button>
          </div>
        </form>
      </div>
      
      <div class="poll-footer">
        <router-link to="/" class="back-link">
          <span class="back-icon">←</span> Back to All Polls
        </router-link>
      </div>
    </div>
  </div>
</template>

<style scoped>
.poll-detail {
  min-height: 50vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.loading, .status-checking {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: #9ca3af;
}

.loading-spinner, .checking-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(99, 102, 241, 0.2);
  border-top: 3px solid #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-spinner.small {
  width: 16px;
  height: 16px;
  border-width: 2px;
  margin-right: 0.5rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.status-checking {
  background: rgba(99, 102, 241, 0.08);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.error-container, .not-found {
  text-align: center;
  padding: 2rem;
  background: rgba(239, 68, 68, 0.05);
  border: 2px solid rgba(239, 68, 68, 0.1);
  border-radius: 12px;
  max-width: 400px;
}

.error-icon, .not-found-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  display: block;
}

.retry-btn, .back-home-btn {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  text-decoration: none;
  display: inline-block;
  margin-top: 1rem;
  transition: all 0.3s ease;
}

.retry-btn:hover, .back-home-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.3);
}

.poll-container {
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 2rem;
  max-width: 700px;
  width: 100%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.poll-header {
  text-align: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.poll-question {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  background: linear-gradient(135deg, #ffffff 0%, #e5e7eb 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.3;
}

.poll-meta {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  font-size: 0.85rem;
  color: #9ca3af;
}

.success-message {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  animation: slideIn 0.4s ease-out;
}

.success-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.success-content h4 {
  color: #10b981;
  margin: 0 0 0.25rem 0;
  font-weight: 600;
  font-size: 1rem;
}

.success-content p {
  color: #6ee7b7;
  margin: 0;
  font-size: 0.9rem;
}

.login-prompt {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.login-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.login-content h4 {
  color: #60a5fa;
  margin: 0 0 0.25rem 0;
  font-weight: 600;
  font-size: 1rem;
}

.login-content p {
  color: #93c5fd;
  margin: 0;
  font-size: 0.9rem;
}

.login-link {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.login-link:hover {
  background: rgba(59, 130, 246, 0.1);
}

.voting-section {
  margin-bottom: 1.5rem;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.option {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.option:hover:not(.disabled) {
  border-color: rgba(99, 102, 241, 0.5);
  background: rgba(99, 102, 241, 0.05);
  transform: translateY(-1px);
}

.option.selected {
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.1);
  box-shadow: 0 0 15px rgba(99, 102, 241, 0.2);
}

.option.disabled {
  opacity: 0.8;
  cursor: not-allowed;
}

.option.voted {
  background: rgba(16, 185, 129, 0.05);
  border-color: rgba(16, 185, 129, 0.3);
}

.option-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.option-input {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  position: relative;
}

.voted-indicator {
  position: absolute;
  right: 0;
  color: #10b981;
  font-weight: 600;
  font-size: 0.9rem;
  background: rgba(16, 185, 129, 0.15);
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.option-input input[type="radio"] {
  width: 18px;
  height: 18px;
  border: 2px solid #6b7280;
  border-radius: 50%;
  appearance: none;
  background: transparent;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;
}

.option-input input[type="radio"]:checked {
  border-color: #6366f1;
  background: #6366f1;
}

.option-input input[type="radio"]:checked::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: white;
}

.option-label {
  font-size: 1rem;
  font-weight: 500;
  color: #f3f4f6;
  cursor: pointer;
  flex: 1;
}

.progress-container {
  position: relative;
  height: 2.5rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 8px;
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.progress-bar::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { left: -100%; }
  100% { left: 100%; }
}

.vote-stats {
  position: absolute;
  top: 50%;
  left: 1rem;
  right: 1rem;
  transform: translateY(-50%);
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  font-weight: 600;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  z-index: 1;
  font-size: 0.9rem;
}

.vote-actions {
  display: flex;
  justify-content: center;
}

.vote-btn {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border: none;
  border-radius: 12px;
  padding: 0.875rem 1.75rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 180px;
  justify-content: center;
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.3);
}

.vote-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
}

.vote-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.poll-footer {
  text-align: center;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #9ca3af;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
}

.back-link:hover {
  color: #6366f1;
  background: rgba(99, 102, 241, 0.1);
}

@keyframes slideIn {
  0% {
    opacity: 0;
    transform: translateY(-10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-color-scheme: light) {
  .poll-container {
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(0, 0, 0, 0.1);
  }
  
  .poll-question {
    background: linear-gradient(135deg, #1f2937 0%, #4b5563 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  .option {
    background: rgba(0, 0, 0, 0.02);
    border-color: rgba(0, 0, 0, 0.1);
  }
  
  .option-label {
    color: #374151;
  }
  
  .progress-container {
    background: rgba(0, 0, 0, 0.05);
  }
}

@media (max-width: 768px) {
  .poll-detail {
    padding: 1rem;
  }
  
  .poll-container {
    padding: 1.5rem;
  }
  
  .poll-question {
    font-size: 1.3rem;
  }
  
  .poll-meta {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .option {
    padding: 0.875rem;
  }
  
  .vote-btn {
    min-width: auto;
    width: 100%;
  }
  
  .voted-indicator {
    position: static;
    margin-top: 0.5rem;
    align-self: flex-start;
  }
  
  .option-input {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>