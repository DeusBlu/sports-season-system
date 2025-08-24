import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import './styles/pages.css'
import { dataService } from './services/dataService'
import Layout from './components/Layout'
import Hockey from './pages/Hockey'
import Schedule from './pages/Schedule'
import ManageSeasons from './pages/ManageSeasons'

function App() {
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'error'>('connecting')

  useEffect(() => {
    const initApi = async () => {
      try {
        const isConnected = await dataService.testConnection()
        setConnectionStatus(isConnected ? 'connected' : 'error')
      } catch (error) {
        setConnectionStatus('error')
        console.error('Data service connection failed:', error)
      }
    }

    initApi()
  }, [])

  return (
    <Router>
      <Layout>
        {/* Connection Status Banner */}
        {connectionStatus !== 'connected' && (
          <div className={`connection-banner ${connectionStatus}`}>
            {connectionStatus === 'connecting' && '🔄 Connecting to API...'}
            {connectionStatus === 'error' && '❌ API connection failed. Backend server may not be running.'}
          </div>
        )}

        <Routes>
          <Route path="/" element={<Navigate to="/hockey" replace />} />
          <Route path="/hockey" element={<Hockey />} />
          <Route path="/hockey/schedule" element={<Schedule />} />
          <Route path="/hockey/manage-seasons" element={<ManageSeasons />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
