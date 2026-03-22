import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import HistoryVideoList from '../components/history/HistoryVideoList'
import HistoryControls from '../components/history/HistoryControls'
import { useMediaQuery } from '../hooks/useMediaQuery'
import './HistoryPage.css'

const HISTORY_FILTERS = ['All', 'Videos', 'Shorts', 'Podcasts', 'Music']

function HistoryPage({ sidebarCollapsed, sidebarOpen, onCloseSidebar, isMobile }) {
  const [activeFilter, setActiveFilter] = useState('All')
  const [historySearch, setHistorySearch] = useState('')

  return (
    <>
      <Sidebar
        collapsed={!isMobile && sidebarCollapsed}
        isOpen={isMobile && sidebarOpen}
        onClose={onCloseSidebar}
        activeItem="history"
      />
      <main className="main-content history-main">
        <div className="history-header">
          <h1 className="history-title">Watch history</h1>
          <div className="history-header-row">
            <div className="history-filters">
              {HISTORY_FILTERS.map((filter) => (
                <button
                  key={filter}
                  className={`history-filter-chip ${activeFilter === filter ? 'history-filter-chip-active' : ''}`}
                  onClick={() => setActiveFilter(filter)}
                >
                  {filter}
                </button>
              ))}
            </div>
            <div className="history-search-wrap">
              <div className="history-search-input">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search watch history"
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="history-content">
          <section className="history-video-section">
            <HistoryVideoList search={historySearch} />
          </section>
          <aside className="history-controls-sidebar">
            <HistoryControls />
          </aside>
        </div>
      </main>
    </>
  )
}

export default HistoryPage
