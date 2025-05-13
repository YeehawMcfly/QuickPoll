<script setup lang="ts">
</script>

<template>
  <div class="app-container">
    <header>
      <h1>QuickPoll</h1>
      <nav>
        <router-link to="/">Home</router-link>
        <router-link to="/create">Create Poll</router-link>
      </nav>
    </header>
    
    <main>
      <router-view></router-view>
    </main>
    
    <footer>
      <p>QuickPoll - Real-time polling application</p>
    </footer>
  </div>
</template>

<style>
body {
  margin: 0;
  min-height: 100vh;
  display: flex;
  font-family: system-ui, -apple-system, sans-serif;
}

#app {
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding: 0;
  text-align: left;
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

header {
  background-color: #111827;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 5px rgba(0,0,0,0.2);
}

nav {
  display: flex;
  gap: 1rem;
}

nav a {
  color: #e5e7eb;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

nav a:hover {
  background-color: #374151;
}

nav a.router-link-active {
  background-color: #3b82f6;
  color: white;
}

main {
  flex: 1;
  padding: 2rem;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
}

footer {
  background-color: #111827;
  padding: 1rem;
  text-align: center;
  font-size: 0.8rem;
  color: #9ca3af;
}

@media (prefers-color-scheme: light) {
  header {
    background-color: #3b82f6;
    color: white;
  }
  
  nav a {
    color: white;
  }
  
  nav a:hover {
    background-color: rgba(255,255,255,0.2);
  }
  
  nav a.router-link-active {
    background-color: white;
    color: #3b82f6;
  }
  
  footer {
    background-color: #e5e7eb;
    color: #4b5563;
  }
}
</style>
