import { useState } from 'react'
import './VideoDescription.css'

function VideoDescription({ video }) {
  const [expanded, setExpanded] = useState(false)
  const fullDescription = video?.description || 'No description available.'
  const hashtags = ['#TMKOCMemes', '#TaarakMehta', '#LIVComedy', '#Jethalal']
  const shouldTruncate = fullDescription.length > 150
  const displayText = expanded || !shouldTruncate
    ? fullDescription
    : fullDescription.slice(0, 150) + '...'

  return (
    <div className="video-description">
      <div className="video-description-meta">
        <span className="video-description-views">{video?.views}</span>
        <span className="video-description-sep"> • </span>
        <span className="video-description-date">{video?.uploadDate}</span>
        {hashtags.map((tag) => (
          <a key={tag} href="#" className="video-description-tag">
            {tag}
          </a>
        ))}
      </div>
      <p className="video-description-text">
        {displayText}
        {shouldTruncate && !expanded && (
          <button className="video-description-more" onClick={() => setExpanded(true)}>
            ...more
          </button>
        )}
      </p>
    </div>
  )
}

export default VideoDescription
