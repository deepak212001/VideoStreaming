import { Link } from 'react-router-dom'
import { VIDEOS_DATA } from '../../data/videos'
import './HistoryVideoList.css'

function HistoryVideoList({ search }) {
  const historyVideos = [
    { ...VIDEOS_DATA[0], watchedAt: 'Today' },
    { ...VIDEOS_DATA[1], watchedAt: 'Today' },
    { ...VIDEOS_DATA[2], watchedAt: 'Today' },
    { ...VIDEOS_DATA[3], watchedAt: 'Yesterday' },
    { ...VIDEOS_DATA[4], watchedAt: 'Yesterday' },
    { ...VIDEOS_DATA[5], watchedAt: '2 days ago' },
  ]

  const filtered = search
    ? historyVideos.filter(
        (v) =>
          v.title.toLowerCase().includes(search.toLowerCase()) ||
          v.channelName.toLowerCase().includes(search.toLowerCase())
      )
    : historyVideos

  const grouped = {}
  filtered.forEach((video) => {
    if (!grouped[video.watchedAt]) grouped[video.watchedAt] = []
    grouped[video.watchedAt].push(video)
  })

  return (
    <div className="history-video-list">
      {Object.entries(grouped).map(([date, videos]) => (
        <div key={date} className="history-date-section">
          <h2 className="history-date-title">{date}</h2>
          {videos.map((video) => (
            <Link
              key={video.id}
              to={`/watch?v=${video._id || video.id}`}
              className="history-video-item"
            >
              <div className="history-video-thumbnail">
                <img src={video.thumbnail} alt={video.title} />
                <span className="history-video-duration">{video.duration}</span>
              </div>
              <div className="history-video-info">
                <h3 className="history-video-title">{video.title}</h3>
                <p className="history-video-meta">
                  {video.channelName}
                  {video.verified && (
                    <svg className="verified-badge" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                  )}
                  {video.views}
                </p>
              </div>
              <button
                className="history-video-menu"
                aria-label="More"
                onClick={(e) => e.preventDefault()}
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                </svg>
              </button>
            </Link>
          ))}
        </div>
      ))}
    </div>
  )
}

export default HistoryVideoList
