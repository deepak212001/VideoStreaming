import { Link } from 'react-router-dom'
import './CompactVideoCard.css'

function CompactVideoCard({ video }) {
  return (
    <Link to={`/watch?v=${video._id || video.id}`} className="compact-video-card">
      <div className="compact-video-card-thumbnail">
        <img src={video.thumbnail} alt={video.title} loading="lazy" />
        <span className="compact-video-card-duration">{video.duration}</span>
      </div>
      <div className="compact-video-card-info">
        <h3 className="compact-video-card-title">{video.title}</h3>
        <p className="compact-video-card-channel">
          {video.channelName}
          {video.verified && (
            <svg className="verified-badge" viewBox="0 0 24 24">
              <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          )}
        </p>
        <p className="compact-video-card-stats">{video.views} • {video.uploadDate}</p>
      </div>
      <button className="compact-video-card-menu" aria-label="More" onClick={(e) => e.preventDefault()}>
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
        </svg>
      </button>
    </Link>
  )
}

export default CompactVideoCard
