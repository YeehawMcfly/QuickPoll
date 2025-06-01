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
  
  // Check if user has voted on poll from server response
  const checkVotedStatus = async (pollId: string) => {
    if (!isAuthenticated.value) return false;
    
    try {
      const response = await fetch(`${API_URL}/api/polls/${pollId}/voted`, {
        headers: {
          'Authorization': `Bearer ${state.value.token}`,
        },
      });
      
      if (response.ok) {
        const { hasVoted } = await response.json();
        if (hasVoted) {
          markPollAsVoted(pollId);
        }
        return hasVoted;
      }
    } catch (error) {
      console.log('Could not check vote status:', error);
    }
    
    return hasVotedOnPoll(pollId);
  };
  
  // Login function
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
    
    setAuthData(data.token, data.user);
    return data;
  };

  const setAuthData = (token: string, user: User) => {
    state.value.token = token;
    state.value.user = user;
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  };
  
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
    
    setAuthData(data.token, data.user);
    return data;
  };
  
  const logout = () => {
    state.value.token = null;
    state.value.user = null;
    state.value.votedPolls.clear();
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('votedPolls');
    
    setTimeout(() => {
      window.location.reload();
    }, 300);
  };
  
  const getToken = (): string | null => {
    return state.value.token;
  };
  
  const getUser = (): User | null => {
    return state.value.user;
  };
  
  const getApiUrl = (): string => {
    return API_URL;
  };
  
  return {
    isAuthenticated,
    hasVotedOnPoll,
    markPollAsVoted,
    checkVotedStatus,
    login,
    register,
    logout,
    getToken,
    getUser,
    getApiUrl
  };
};