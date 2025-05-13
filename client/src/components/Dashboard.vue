<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../store/auth';
import { io } from 'socket.io-client';

interface Poll {
  _id: string;
  question: string;
  options: string[];
  votes: number[];
  createdAt: string;
  isActive: boolean;
}

const polls = ref<Poll[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const router = useRouter();
const auth = useAuth();
const socket = io('http://localhost:3000');

onMounted(async () => {
  if (!auth.isAuthenticated.value) {
    router.push('/login');
    return;
  }

  await fetchUserPolls();
  
  socket.on('pollUpdated', (updatedPoll: Poll) => {
    const index = polls.value.findIndex(p => p._id === updatedPoll._id);
    if (index !== -1) {
      polls.value[index] = updatedPoll;
    }
  });
  
  socket.on('pollDeleted', (deletedPollId: string) => {
    polls.value = polls.value.filter(p => p._id !== deletedPollId);
  });
});

const fetchUserPolls = async () => {
  try {
    const token = auth.getToken();
    
    const response = await fetch(`http://localhost:3000/api/polls/user/polls`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    
    if (!response.ok) throw new Error('Failed to fetch your polls');
    polls.value = await response.json();
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Unknown error occurred';
  } finally {
    loading.value = false;
  }
};

const togglePollStatus = async (poll: Poll) => {
  try {
    const token = auth.getToken();
    
    const response = await fetch(`http://localhost:3000/api/polls/${poll._id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        isActive: !poll.isActive,
      }),
    });
    
    if (!response.ok) throw new Error('Failed to update poll status');
    const updatedPoll = await response.json();
    
    // Update the poll in the list
    const index = polls.value.findIndex(p => p._id === updatedPoll._id);
    if (index !== -1) {
      polls.value[index] = updatedPoll;
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to update poll';
  }
};

const deletePoll = async (pollId: string) => {
  if (!confirm('Are you sure you want to delete this poll?')) return;
  
  try {
    const token = auth.getToken();
    
    const response = await fetch(`http://localhost:3000/api/polls/${pollId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) throw new Error('Failed to delete poll');
    
    // Remove the poll from the list
    polls.value = polls.value.filter(p => p._id !== pollId);
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to delete poll';
  }
};
</script>

<template>
  <div class="dashboard">
    <h2>My Polls</h2>
    
    <div v-if="loading" class="loading">Loading your polls...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="polls.length === 0" class="empty">
      <p>You haven't created any polls yet.</p>
      <router-link to="/create" class="create-btn">Create Your First Poll</router-link>
    </div>
    
    <div v-else class="polls">
      <div v-for="poll in polls" :key="poll._id" class="poll-card">
        <div class="poll-header">
          <h3>{{ poll.question }}</h3>
          <span :class="['status', poll.isActive ? 'active' : 'inactive']">
            {{ poll.isActive ? 'Active' : 'Inactive' }}
          </span>
        </div>
        
        <p class="date">Created on: {{ new Date(poll.createdAt).toLocaleDateString() }}</p>
        
        <div class="total-votes">
          Total votes: {{ poll.votes.reduce((a, b) => a + b, 0) }}
        </div>
        
        <div class="actions">
          <router-link :to="`/poll/${poll._id}`" class="view-btn">View Results</router-link>
          <button 
            @click="togglePollStatus(poll)" 
            :class="['toggle-btn', poll.isActive ? 'deactivate' : 'activate']"
          >
            {{ poll.isActive ? 'Deactivate' : 'Activate' }}
          </button>
          <button @click="deletePoll(poll._id)" class="delete-btn">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.polls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.poll-card {
  background-color: #2d3748;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.poll-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.status {
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 500;
}

.status.active {
  background-color: #059669;
  color: white;
}

.status.inactive {
  background-color: #6b7280;
  color: white;
}

.date, .total-votes {
  font-size: 0.9rem;
  color: #9ca3af;
  margin-bottom: 0.5rem;
}

.actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.view-btn, .toggle-btn, .delete-btn {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  text-align: center;
  transition: background-color 0.2s;
}

.view-btn {
  background-color: #3b82f6;
  color: white;
  text-decoration: none;
}

.toggle-btn.activate {
  background-color: #059669;
  color: white;
  border: none;
}

.toggle-btn.deactivate {
  background-color: #6b7280;
  color: white;
  border: none;
}

.delete-btn {
  background-color: #ef4444;
  color: white;
  border: none;
}

.view-btn:hover {
  background-color: #2563eb;
}

.toggle-btn.activate:hover {
  background-color: #047857;
}

.toggle-btn.deactivate:hover {
  background-color: #4b5563;
}

.delete-btn:hover {
  background-color: #dc2626;
}

.empty {
  text-align: center;
  padding: 2rem;
}

.create-btn {
  display: inline-block;
  margin-top: 1rem;
  background-color: #3b82f6;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  text-decoration: none;
}

.loading, .error {
  text-align: center;
  padding: 2rem;
}

.error {
  color: #ef4444;
}

@media (prefers-color-scheme: light) {
  .poll-card {
    background-color: #fff;
    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  }
  
  .date, .total-votes {
    color: #6b7280;
  }
}
</style>