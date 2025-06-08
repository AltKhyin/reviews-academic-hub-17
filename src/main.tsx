
// ABOUTME: Updated main entry point with optimized query client and auth context
import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { queryClient, backgroundSync } from '@/lib/queryClient'
import { OptimizedAuthProvider } from '@/contexts/OptimizedAuthContext'
import App from './App'
import './index.css'

// Initialize background optimizations
backgroundSync.optimizeCache();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <OptimizedAuthProvider>
          <App />
          <Toaster />
        </OptimizedAuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)

