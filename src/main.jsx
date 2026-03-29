import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
  })
}

class ErrorBoundary extends Component {
  state = { error: null }
  static getDerivedStateFromError(error) { return { error } }
  render() {
    if (this.state.error) {
      return (
        <div style={{ color: 'white', padding: 24, background: '#0f172a', minHeight: '100vh' }}>
          <h2>出错了</h2>
          <pre style={{ fontSize: 12, color: '#f87171', whiteSpace: 'pre-wrap' }}>{this.state.error.message}</pre>
          <button onClick={() => { localStorage.clear(); location.reload() }} style={{ marginTop: 16, padding: '8px 16px', background: '#7c3aed', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}>
            清除数据并刷新
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
