import { VIDEOS_DATA } from '../../data/videos'
import CompactVideoCard from './CompactVideoCard'
import ShortsShelf from './ShortsShelf'
import './RecommendationSidebar.css'

function RecommendationSidebar({ currentVideoId }) {
  const recommendations = VIDEOS_DATA
    .filter((v) => v.id !== currentVideoId)
    .slice(0, 8)

  return (
    <div className="recommendation-sidebar">
      <h2 className="recommendation-title">Up next</h2>
      <div className="recommendation-list">
        {recommendations.map((video) => (
          <CompactVideoCard key={video.id} video={video} />
        ))}
      </div>
      <ShortsShelf />
    </div>
  )
}

export default RecommendationSidebar
