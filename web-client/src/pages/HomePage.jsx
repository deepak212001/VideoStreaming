import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import FilterBar from "../components/FilterBar";
import VideoCard from "../components/VideoCard";
import { api } from "../api/api";
import { VIDEOS_DATA } from "../data/videos";
import { useMediaQuery } from "../hooks/useMediaQuery";

function HomePage({ sidebarCollapsed, sidebarOpen, onCloseSidebar, isMobile }) {
  const [videos, setVideos] = useState(VIDEOS_DATA);
  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await api.get("/videos/videos");
        console.log(res.data.videos);
        setVideos(res.data.videos);
      } catch (error) {
        console.log(error);
      }
    };
    fetchVideos();
  }, []);
  return (
    <>
      <Sidebar
        collapsed={!isMobile && sidebarCollapsed}
        isOpen={isMobile && sidebarOpen}
        onClose={onCloseSidebar}
      />
      <main className="main-content">
        <FilterBar />
        <section className="video-grid">
          {videos.map((video) => (
            <VideoCard key={video._id || video.id} video={video} />
          ))}
        </section>
      </main>
    </>
  );
}

export default HomePage;
