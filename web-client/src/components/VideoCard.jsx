import { useState } from 'react'
import { Link } from 'react-router-dom'
import './VideoCard.css'

function VideoCard({ video }) {
  const [isHovered, setIsHovered] = useState(false)

  const channelAvatar = video?.owner?.avatar || video?.channelAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'
  const channelName = video?.owner?.fullName || video?.channelName || 'Channel'

  const formatDuration = (duration) => {
    if (duration == null) return ''
    if (typeof duration === 'number') {
      const h = Math.floor(duration / 3600)
      const m = Math.floor((duration % 3600) / 60)
      const s = Math.floor(duration % 60)
      if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
      return `${m}:${String(s).padStart(2, '0')}`
    }
    if (typeof duration !== 'string') return ''
    const parts = duration.split(':')
    if (parts.length === 1) return duration
    if (parts.length === 2) return `${parts[0]}:${parts[1]}`
    return duration
  }

  return (
    <article
      className="video-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/watch?v=${video._id || video.id}`} className="video-card-link">
        <div className="video-card-thumbnail">
          <img src={video?.thumbnail} alt={video?.title} loading="lazy" />
          <span className="video-card-duration">{formatDuration(video?.duration)}</span>
        </div>
        <div className="video-card-info">
          <img
            className="video-card-channel-avatar"
            src={channelAvatar}
            alt={channelName}
          />
          <div className="video-card-meta">
            <h3 className="video-card-title">{video?.title}</h3>
            <p className="video-card-channel">
              {channelName}
              {/* {video?.verified && (
                <svg className="verified-badge" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              )} */}
            </p>
            <p className="video-card-stats">
              {video?.view} Views
              {/* • {video.uploadDate} */}
            </p>
          </div>
          <button className="video-card-menu" aria-label="More options">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
          </button>
        </div>
      </Link>
      {isHovered && video?.description && (
        <div className="video-card-hover-tooltip" role="tooltip">
          <p className="video-card-hover-title">{video?.title}</p>
          <p className="video-card-hover-stats">
            {video?.view} 
            {/* • {video.uploadDate} */}
          </p>
          <p className="video-card-hover-desc">{video?.description}</p>
        </div>
      )}
    </article>
  )
}

export default VideoCard
