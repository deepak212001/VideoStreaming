import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../store/authSlice'
import { api } from '../api/api'
import './Navbar.css'

function Navbar({ onMenuClick }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const user = useSelector((state) => state.auth.user)
  const dispatch = useDispatch()

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    if (dropdownOpen) {
      document.addEventListener('click', handleClickOutside)
    }
    return () => document.removeEventListener('click', handleClickOutside)
  }, [dropdownOpen])

  const handleLogout = async () => {
    try {
      await api.post('/users/logout')
    } catch {
      // ignore - clear state anyway
    }
    dispatch(logout())
    setDropdownOpen(false)
  }

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button
          className="navbar-menu-btn"
          onClick={onMenuClick}
          aria-label="Toggle menu"
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
          </svg>
        </button>
        <Link to="/" className="navbar-logo">
          <svg viewBox="0 0 159 36" className="logo-icon">
            <path fill="#FF0000" d="M154 6.2c-1.8-6.8-7.2-12.2-14-14C130.4-9.8 79.5-9.8 79.5-9.8s-50.9 0-60.5 1.6c-6.8 1.8-12.2 7.2-14 14C3.5 15.8 3.5 25 3.5 25s0 9.2 1.6 14.8c1.8 6.8 7.2 12.2 14 14 9.6 1.6 60.5 1.6 60.5 1.6s50.9 0 60.5-1.6c6.8-1.8 12.2-7.2 14-14 1.6-5.6 1.6-14.8 1.6-14.8s0-9.2-1.6-14.8z"/>
            <path fill="#FFF" d="M64.5 16.5v17l51-8.5v-17l-51 8.5z"/>
          </svg>
          <span className="logo-text">YouTube</span>
        </Link>
      </div>

      <div className="navbar-center">
        <div className="search-container">
          <input
            type="search"
            className="search-input"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="search-btn" aria-label="Search">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
          </button>
        </div>
        <button className="navbar-voice-btn" aria-label="Voice search">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z" />
          </svg>
        </button>
      </div>

      <div className="navbar-right">
        {!user ? (
          <Link to="/login" className="navbar-sign-in-btn" aria-label="Sign in">
            <svg viewBox="0 0 24 24" fill="currentColor" className="navbar-sign-in-icon">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
            <span>Sign in</span>
          </Link>
        ) : (
          <>
            <button className="navbar-icon-btn" aria-label="Create">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 13h-3v3H9v-3H6v-2h3V8h2v3h3v2zm3-7H3v12h18V6zm-2 10H5V8h10v8z" />
              </svg>
            </button>
            <button className="navbar-icon-btn" aria-label="Notifications">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
              </svg>
              <span className="notification-badge">9+</span>
            </button>
            <div className="navbar-avatar-wrap" ref={dropdownRef}>
              <button
                className="navbar-avatar"
                aria-label="Profile"
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
                onClick={() => setDropdownOpen((o) => !o)}
              >
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
                  alt={user.fullName || 'Profile'}
                />
              </button>
              {dropdownOpen && (
                <div className="navbar-dropdown">
                  <Link
                    to="/settings"
                    className="navbar-dropdown-item"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
                    </svg>
                    Settings
                  </Link>
                  <button
                    type="button"
                    className="navbar-dropdown-item"
                    onClick={handleLogout}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  )
}

export default Navbar
