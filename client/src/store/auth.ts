import { ref, computed } from 'vue';

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  votedPolls: Set<string>; // Track polls user has voted on
}

// Create a reactive state object to track authentication
const state = ref<AuthState>({
  token: null,
  user: null,
  votedPolls: new Set()
});

// API URL configuration
const API_URL = import.meta.env.VITE_API_URL || 'https://quickpoll-api-qilq.onrender.com';

// Initialize from localStorage
const initializeAuth = () => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const votedPollsStr = localStorage.getItem('votedPolls');
  
  if (token && userStr) {
    try {
      state.value.token = token;
      state.value.user = JSON.parse(userStr);
      
      if (votedPollsStr) {
        state.value.votedPolls = new Set(JSON.parse(votedPollsStr));
      }
    } catch (error) {
      console.error('Error parsing stored auth data:', error);
      localStorage.clear();
    }
  }
};

// Initialize on module load
initializeAuth();

export const useAuth = () => {
  // Computed property to check if user is authenticated
  const isAuthenticated = computed(() => !!state.value.token);
  
  // Check if user has voted on a specific poll
  const hasVotedOnPoll = (pollId: string) => {
    return state.value.votedPolls.has(pollId);
  };
  
  // Mark poll as voted
  const markPollAsVoted = (pollId: string) => {
    state.value.votedPolls.add(pollId);
    localStorage.setItem('votedPolls', JSON.stringify([...state.value.votedPolls]));
  };
  
  // Login function - for API authentication
  const login = async (email: string, password: string) => {
    console.log('Auth store login called with:', { email, password: password ? 'provided' : 'missing' });
    
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    
    console.log('Auth store response status:', response.status);
    
    if (!response.ok) {
      const data = await response.json();
      console.error('Auth store login failed:', data);
      throw new Error(data.message || 'Login failed');
    }
    
    const data = await response.json();
    console.log('Auth store login successful:', { user: data.user, hasToken: !!data.token });
    
    // Store the authentication data
    setAuthData(data.token, data.user);
    
    return data;
  };

  // Helper function to set auth data (used by both login and register)
  const setAuthData = (token: string, user: User) => {
    state.value.token = token;
    state.value.user = user;
    
    // Store in localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  };
  
  // Register function
  const register = async (username: string, email: string, password: string) => {
    console.log('Attempting registration with API:', API_URL);
    
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, email, password }),
    });
    
    console.log('Registration response status:', response.status);
    
    if (!response.ok) {
      const data = await response.json();
      console.error('Registration failed:', data);
      throw new Error(data.message || 'Registration failed');
    }
    
    const data = await response.json();
    console.log('Registration successful:', { user: data.user, hasToken: !!data.token });
    
    // Store the authentication data
    setAuthData(data.token, data.user);
    
    return data;
  };
  
  // Logout function to clear token and user
  const logout = () => {
    // Clear state
    state.value.token = null;
    state.value.user = null;
    state.value.votedPolls.clear();
    
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('votedPolls');
    
    // Optional: Force a page refresh after a short delay
    setTimeout(() => {
      window.location.reload();
    }, 300);
  };
  
  // Function to get current token
  const getToken = (): string | null => {
    return state.value.token;
  };
  
  // Function to get current user
  const getUser = (): User | null => {
    return state.value.user;
  };
  
  // Get API URL for components
  const getApiUrl = (): string => {
    return API_URL;
  };
  
  return {
    isAuthenticated,
    hasVotedOnPoll,
    markPollAsVoted,
    login,
    register,
    logout,
    getToken,
    getUser,
    getApiUrl
  };
};