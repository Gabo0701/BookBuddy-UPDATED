// Vite configuration for BookBuddy frontend
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite build tool configuration
export default defineConfig({
  // Enable React plugin for JSX support and fast refresh
  plugins: [react()],
  
  // Development server configuration
  server: {
    port: 5173, // Frontend development server port
    
    // Proxy configuration to forward API requests to backend
    proxy: {
      // Forward all /api/* requests to backend server
      '/api': {
        target: 'http://localhost:5000', // Backend server URL
        changeOrigin: true, // Change origin header to target URL
        secure: false, // Allow self-signed certificates
      }
    }
  }
})