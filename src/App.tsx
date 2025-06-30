import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

console.log('🔍 App.tsx is loading...')

function App() {
  console.log('🔍 App component is rendering...')
  const [count, setCount] = useState(0)

  return (
    <div>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React + SSR - DEBUGGING</h1>
      <div className="card">
        <button onClick={() => {
          setCount((count) => count + 1)
          console.log('🔍 Button clicked, count:', count + 1)
        }}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#1a1a1a', borderRadius: '8px' }}>
        <h3>🔧 Debug: Basic App Working</h3>
        <p>If you see this, the basic React app is functioning correctly.</p>
        <p style={{ color: '#4caf50' }}>✅ React is rendering successfully!</p>
      </div>
    </div>
  )
}

console.log('🔍 App component defined, exporting...')

export default App
