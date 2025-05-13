/// <reference types="vite/client" />

// Declare module for Vue components to fix TypeScript import errors
declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}