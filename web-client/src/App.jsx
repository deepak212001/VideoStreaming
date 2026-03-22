import { useState } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import WatchPage from './pages/WatchPage'
import HistoryPage from './pages/HistoryPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import SettingsPage from './pages/SettingsPage'
import { useMediaQuery } from './hooks/useMediaQuery'
import './App.css'

function AppContent() {
  const location = useLocation()
  const isWatchPage = location.pathname.startsWith('/watch')
  const isMobile = useMediaQuery('(max-width: 1280px)')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleMenuClick = () => {
    if (isWatchPage) {
      setSidebarOpen((prev) => !prev)
    } else if (isMobile) {
      setSidebarOpen((prev) => !prev)
    } else {
      setSidebarCollapsed((prev) => !prev)
    }
  }

  const closeSidebar = () => {
    setSidebarOpen(false)
  }

  return (
    <div className={`app ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${isWatchPage ? 'watch-route' : ''}`}>
        <Navbar onMenuClick={handleMenuClick} />
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                sidebarCollapsed={sidebarCollapsed}
                sidebarOpen={sidebarOpen}
                onMenuClick={handleMenuClick}
                onCloseSidebar={closeSidebar}
                isMobile={isMobile}
              />
            }
          />
          <Route
            path="/history"
            element={
              <HistoryPage
                sidebarCollapsed={sidebarCollapsed}
                sidebarOpen={sidebarOpen}
                onCloseSidebar={closeSidebar}
                isMobile={isMobile}
              />
            }
          />
          <Route
            path="/watch"
            element={
              <WatchPage
                sidebarOpen={sidebarOpen}
                onCloseSidebar={closeSidebar}
              />
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/settings"
            element={
              <SettingsPage
                sidebarCollapsed={sidebarCollapsed}
                sidebarOpen={sidebarOpen}
                onCloseSidebar={closeSidebar}
                isMobile={isMobile}
              />
            }
          />
        </Routes>
      </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App
