
// ABOUTME: Main entry point with corrected query client imports and initialization
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { initializeBackgroundOptimization } from '@/lib/queryClient'
import App from './App'
import './index.css'

// Initialize background optimizations
initializeBackgroundOptimization();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster />
    </BrowserRouter>
  </React.StrictMode>,
)
