import { Link, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import './Sidebar.css'

const SIDEBAR_ITEMS = [
  { id: 'home', icon: 'home', label: 'Home', path: '/' },
  { id: 'subscriptions', icon: 'subscriptions', label: 'Subscriptions', path: '/subscriptions' },
  { id: 'history', icon: 'history', label: 'History', path: '/history' },
  { id: 'playlist', icon: 'playlist', label: 'Playlists', path: '#' },
  { id: 'watchlater', icon: 'watch-later', label: 'Watch Later', path: '#' },
]

function Sidebar({ collapsed, isOpen, onClose, activeItem: activeItemProp }) {
  const location = useLocation()
  const user = useSelector((state) => state.auth.user)
  const activeItem =
    activeItemProp ??
    (location.pathname === '/'
      ? 'home'
      : location.pathname === '/history'
        ? 'history'
        : location.pathname === '/subscriptions'
          ? 'subscriptions'
          : '')

  const Icon = ({ name }) => {
    const icons = {
      home: (
        <svg viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" fill="currentColor"/></svg>
      ),
      explore: (
        <svg viewBox="0 0 24 24"><path d="M12 10.9c-.61 0-1.1.49-1.1 1.1s.49 1.1 1.1 1.1 1.1-.49 1.1-1.1-.49-1.1-1.1-1.1zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm2.19 12.19L6 18l3.81-8.19L18 6l-3.81 8.19z" fill="currentColor"/></svg>
      ),
      subscriptions: (
        <svg viewBox="0 0 24 24"><path d="M20 8H4V6h16v2zm-2-6H6v2h12V2zm4 8v12H2V10h20zm-7 7l5-5-5-5v10z" fill="currentColor"/></svg>
      ),
      library: (
        <svg viewBox="0 0 24 24"><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9H9V9h10v2zm-4 4H9v-2h6v2zm4-8H9V5h10v2z" fill="currentColor"/></svg>
      ),
      history: (
        <svg viewBox="0 0 24 24"><path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" fill="currentColor"/></svg>
      ),
      playlist: (
        <svg viewBox="0 0 24 24"><path d="M14 10H2v2h12v-2zm0-4H2v2h12V6zM2 16h8v-2H2v2zm19.5-4.5L23 13V6h-6v2h4v5l-1.5 1.5z" fill="currentColor"/></svg>
      ),
      'watch-later': (
        <svg viewBox="0 0 24 24"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.2 14.2L11 13V7h1.5v5.2l4.5 2.7-.8 1.3z" fill="currentColor"/></svg>
      ),
    }
    return icons[name] || null
  }

  return (
    <>
      <div
        className={`sidebar-overlay ${isOpen ? 'sidebar-overlay-visible' : ''}`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />
      <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''} ${isOpen ? 'sidebar-open' : ''}`}>
        {user && (
          <div className={`sidebar-user ${collapsed ? 'sidebar-user-collapsed' : ''}`}>
            <img
              src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`}
              alt={user.fullName || 'Avatar'}
              className="sidebar-avatar"
            />
            {!collapsed && <span className="sidebar-user-name">{user.fullName || user.username}</span>}
          </div>
        )}
        <nav className="sidebar-nav">
          {SIDEBAR_ITEMS.map((item) => {
            const isActive = activeItem === item.id || (item.path === '/' ? location.pathname === '/' : item.path !== '#' && location.pathname.startsWith(item.path))
            const content = (
              <>
                <span className="sidebar-icon">
                  <Icon name={item.icon} />
                </span>
                {!collapsed && <span className="sidebar-label">{item.label}</span>}
              </>
            )
            return item.path && item.path !== '#' ? (
              <Link
                key={item.id}
                to={item.path}
                className={`sidebar-item ${isActive ? 'sidebar-item-active' : ''}`}
                onClick={() => onClose?.()}
              >
                {content}
              </Link>
            ) : (
              <button
                key={item.id}
                className={`sidebar-item ${isActive ? 'sidebar-item-active' : ''}`}
              >
                {content}
              </button>
            )
          })}
        </nav>
      </aside>
    </>
  )
}

export default Sidebar
