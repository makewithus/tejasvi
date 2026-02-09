import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

import { isConfigured } from './firebase/config'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isConfigured ? (
      <App />
    ) : (
      <div style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#111827',
        color: 'white',
        textAlign: 'center',
        padding: '2rem'
      }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#EF4444' }}>Configuration Required</h1>
        <p style={{ maxWidth: '600px', marginBottom: '2rem', color: '#D1D5DB' }}>
          The application cannot start because Firebase environment variables are missing.
        </p>
        <div style={{ backgroundColor: '#1F2937', padding: '1.5rem', borderRadius: '0.5rem', textAlign: 'left', width: '100%', maxWidth: '600px', overflowX: 'auto' }}>
          <p style={{ marginBottom: '1rem', color: '#9CA3AF' }}>Please create a <code style={{ color: '#60A5FA' }}>.env</code> file in the project root with your Firebase keys:</p>
          <pre style={{ color: '#34D399', fontSize: '0.9rem' }}>
            VITE_FIREBASE_API_KEY=your_key{'\n'}
            VITE_FIREBASE_AUTH_DOMAIN=...
          </pre>
        </div>
      </div>
    )}
  </StrictMode>,
)
