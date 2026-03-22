import { useSearchParams } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import VideoPlayer from '../components/watch/VideoPlayer'
import VideoMetadata from '../components/watch/VideoMetadata'
import VideoDescription from '../components/watch/VideoDescription'
import Comments from '../components/watch/Comments'
import RecommendationSidebar from '../components/watch/RecommendationSidebar'
import { api } from '../api/api'
import { useState, useEffect } from 'react'
import './WatchPage.css'

function WatchPage({ sidebarOpen, onCloseSidebar }) {
  const [searchParams] = useSearchParams()
  const videoId = searchParams.get('v')
  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState(null);
  const [likes, setLikes] = useState(null);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  const handleExpandDescription = () => {
    setDescriptionExpanded(true);
    setTimeout(() => document.getElementById('video-description')?.scrollIntoView({ behavior: 'smooth' }), 50);
  };

  useEffect(() => {
    if (!videoId) {
      setVideo(null)
      setComments([])
      setLikes(null)
      return
    }
    const fetchVideo = async () => {
      try {
        const res = await api.get(`/videos/${videoId}`)
        const data = res?.data?.data ?? res?.data
        const videoData = data?.video ?? data
        setVideo(videoData)
        setComments(data?.comments ?? [])
        setLikes(data?.likes ?? null)
      } catch (error) {
        console.error(error)
        setVideo(null)
        setComments([])
        setLikes(null)
      }
    }
    fetchVideo()
  }, [videoId])

  return (
    <>
      {sidebarOpen && (
        <Sidebar
          collapsed={false}
          isOpen={true}
          onClose={onCloseSidebar}
        />
      )}
    <main className="main-content watch-main watch-no-sidebar">
        <div className="watch-layout">
          <section className="watch-video-section">
            <div className="watch-video-wrapper">
              <VideoPlayer video={video} />
            </div>
            <div className="watch-video-info">
              <VideoMetadata video={video} likes={likes} onExpandDescription={handleExpandDescription} />
              <VideoDescription video={video} expanded={descriptionExpanded} onExpand={() => setDescriptionExpanded(true)} />
              <Comments comments={comments} />
            </div>
          </section>
          <aside className="watch-sidebar">
            <RecommendationSidebar currentVideoId={video?._id || video?.id} />
          </aside>
        </div>
    </main>
    </>
  )
}

export default WatchPage
