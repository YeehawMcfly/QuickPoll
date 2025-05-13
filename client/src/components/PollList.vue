<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { io } from 'socket.io-client';

interface Poll {
  _id: string;
  question: string;
  options: string[];
  votes: number[];
  createdAt: string;
}

const polls = ref<Poll[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const API_URL = 'http://localhost:3000/api';
const socket = io('http://localhost:3000');

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
    <h2>Available Polls</h2>
    
    <div v-if="loading" class="loading">Loading polls...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="polls.length === 0" class="empty">No polls available. Create one!</div>
    
    <div v-else class="polls">
      <div v-for="poll in polls" :key="poll._id" class="poll-card">
        <h3>{{ poll.question }}</h3>
        <p class="date">Created on: {{ new Date(poll.createdAt).toLocaleDateString() }}</p>
        <router-link :to="`/poll/${poll._id}`" class="view-poll">View Poll</router-link>
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

.poll-card {
  background-color: #2d3748;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.poll-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

.date {
  font-size: 0.8rem;
  color: #9ca3af;
}

.view-poll {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: white;
  border-radius: 4px;
  text-decoration: none;
  transition: background-color 0.2s;
}

.view-poll:hover {
  background-color: #2563eb;
}

.loading, .error, .empty {
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
  
  .date {
    color: #6b7280;
  }
}
</style>