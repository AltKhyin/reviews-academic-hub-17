
// ABOUTME: Main entry point with advanced performance optimization integration
import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { getQueryClient, initializeBackgroundOptimization } from '@/lib/queryClient'
import { AuthProvider } from '@/contexts/AuthContext'
import { AdvancedPerformanceProvider } from '@/providers/AdvancedPerformanceProvider'
import App from './App'
import './index.css'

// Get the optimized query client instance
const queryClient = getQueryClient();

// Initialize background optimizations
initializeBackgroundOptimization();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AdvancedPerformanceProvider
          enableDashboard={process.env.NODE_ENV === 'development'}
          enableAdvancedMonitoring={true}
          enableMemoryLeakDetection={true}
          enableBudgetEnforcement={true}
        >
          <AuthProvider>
            <App />
            <Toaster />
          </AuthProvider>
        </AdvancedPerformanceProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)
