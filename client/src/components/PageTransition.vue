<script setup lang="ts">
import { useRoute } from 'vue-router';
import { computed, onMounted } from 'vue';

const route = useRoute();
const key = computed(() => route.path);

// This ensures animations work correctly
onMounted(() => {
  document.documentElement.style.scrollBehavior = 'smooth';
});
</script>

<template>
  <transition name="page" mode="out-in">
    <div :key="key">
      <slot></slot>
    </div>
  </transition>
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease-out;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>