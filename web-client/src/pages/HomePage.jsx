import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import FilterBar from "../components/FilterBar";
import VideoCard from "../components/VideoCard";
import VideoCardSkeleton from "../components/VideoCardSkeleton";
import { api } from "../api/api";

const SKELETON_COUNT = 12;

function HomePage({ sidebarCollapsed, sidebarOpen, onCloseSidebar, isMobile }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchVideos = async () => {
      setLoading(true);
      try {
        const res = await api.get("/videos/videos", { params: { limit: 30 } });
        const list = res?.data?.videos ?? res?.data?.data?.videos ?? [];
        if (!cancelled) setVideos(Array.isArray(list) ? list : []);
      } catch {
        if (!cancelled) setVideos([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchVideos();
    return () => {
      cancelled = true;
    };
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
        <section className="video-grid" aria-busy={loading}>
          {loading
            ? Array.from({ length: SKELETON_COUNT }, (_, i) => (
                <VideoCardSkeleton key={i} />
              ))
            : videos.map((video, index) => (
                <VideoCard
                  key={video._id || video.id}
                  video={video}
                  priority={index < 6}
                />
              ))}
        </section>
      </main>
    </>
  );
}

export default HomePage;
