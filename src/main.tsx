
// ABOUTME: Main entry point with corrected query client imports and initialization
import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { queryClient, initializeBackgroundOptimization } from '@/lib/queryClient'
import { AuthProvider } from '@/contexts/AuthContext'
import App from './App'
import './index.css'

// Initialize background optimizations
initializeBackgroundOptimization();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <App />
          <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)
