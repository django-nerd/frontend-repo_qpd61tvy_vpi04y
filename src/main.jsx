import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import Test from './Test'
import TopPostDetail from './components/TopPostDetail'
import ErrorBoundary from './components/ErrorBoundary'
import './index.css'

function FallbackUI() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-blue-300/80">Please refresh. If the issue persists, try the diagnostics page.</p>
        <a href="/test" className="inline-block mt-4 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700">Open diagnostics</a>
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary fallback={<FallbackUI />}> 
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/test" element={<Test />} />
          <Route path="/top/:id" element={<TopPostDetail />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
)
