import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  formatDuration,
  formatViewCount,
  formatRelativeUpload,
} from '../utils/formatVideoMeta'
import './VideoCard.css'

function VideoCard({ video, priority = false, hideChannelAvatar = false }) {
  const [isHovered, setIsHovered] = useState(false)

  const channelAvatar = video?.owner?.avatar || video?.channelAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'
  const channelName = video?.owner?.fullName || video?.channelName || 'Channel'
  const watchTo = `/watch?v=${video._id || video.id}`

  const uploaded = formatRelativeUpload(video?.createdAt)
  const statsLine = uploaded
    ? `${formatViewCount(video?.view)} • ${uploaded}`
    : formatViewCount(video?.view)

  return (
    <article
      className="video-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={watchTo} className="video-card-thumb-link">
        <div className="video-card-thumbnail">
          <img
            src={video?.thumbnail}
            alt={video?.title}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
          />
          <span className="video-card-duration">{formatDuration(video?.duration)}</span>
        </div>
      </Link>
      <div className="video-card-bottom">
        <Link to={watchTo} className="video-card-details-link">
          <div
            className={`video-card-info${hideChannelAvatar ? " video-card-info--no-avatar" : ""}`}
          >
            {!hideChannelAvatar && (
              <img
                className="video-card-channel-avatar"
                src={channelAvatar}
                alt={channelName}
              />
            )}
            <div className="video-card-meta">
              <h3 className="video-card-title">{video?.title}</h3>
              {!hideChannelAvatar && (
                <p className="video-card-channel">{channelName}</p>
              )}
              <p className="video-card-stats">{statsLine}</p>
            </div>
          </div>
        </Link>
        <button type="button" className="video-card-menu" aria-label="More options">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
          </svg>
        </button>
      </div>
      {isHovered && video?.description && (
        <div className="video-card-hover-tooltip" role="tooltip">
          <p className="video-card-hover-title">{video?.title}</p>
          <p className="video-card-hover-stats">{statsLine}</p>
          <p className="video-card-hover-desc">{video?.description}</p>
        </div>
      )}
    </article>
  )
}

export default VideoCard
