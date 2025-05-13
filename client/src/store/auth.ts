import { ref, computed } from 'vue';

interface User {
  id: string;
  username: string;
  email: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
}

// Create a reactive state object to track authentication
const state = ref<AuthState>({
  token: localStorage.getItem('token'),
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!) : null
});

export const useAuth = () => {
  // Computed property to check if user is authenticated
  const isAuthenticated = computed(() => !!state.value.token);
  
  // Login function to set token and user
  const login = (token: string, user: User) => {
    state.value.token = token;
    state.value.user = user;
    
    // Store in localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  };
  
  // Logout function to clear token and user
  const logout = () => {
    // Clear state
    state.value.token = null;
    state.value.user = null;
    
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
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
  
  return {
    isAuthenticated,
    login,
    logout,
    getToken,
    getUser
  };
};