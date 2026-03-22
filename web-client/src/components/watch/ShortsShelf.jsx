import { Link } from 'react-router-dom'
import { SHORTS_DATA, VIDEOS_DATA } from '../../data/videos'
import './ShortsShelf.css'

function ShortsShelf() {
  return (
    <section className="shorts-shelf">
      <div className="shorts-shelf-header">
        <div className="shorts-logo">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 14.65v-5.3L15 12l-5 2.65zm7.77-4.33l-1.2-.5L18 9.06 14.47 7.2l-.96 2.06 3.54 1.48 1.48.62zM14.47 16.8l3.53 1.86 1.2-.5-4.72-2.52-.96 2.06zM3.5 5.5v13l11 5.5 11-5.5v-13L14.5 0 3.5 5.5zm17 11.27l-9.5 4.75v-9.54l9.5 4.79zM4.5 5.23l9.5 4.75v9.54l-9.5-4.79z"/></svg>
          <span>Shorts</span>
        </div>
        <button className="shorts-next" aria-label="Next">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
        </button>
      </div>
      <div className="shorts-shelf-scroll">
        {SHORTS_DATA.map((short, i) => (
          <Link key={short.id} to={`/watch?v=${VIDEOS_DATA[i % VIDEOS_DATA.length]?._id || VIDEOS_DATA[i % VIDEOS_DATA.length]?.id || 1}`} className="shorts-card">
            <div className="shorts-card-thumbnail">
              <img src={short.thumbnail} alt={short.title} />
            </div>
            <p className="shorts-card-title">{short.title}</p>
            <p className="shorts-card-views">{short.views} views</p>
          </Link>
        ))}
      </div>
    </section>
  )
}

export default ShortsShelf
