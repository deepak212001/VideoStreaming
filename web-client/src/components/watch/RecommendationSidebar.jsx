import { useState, useEffect } from "react";
import { api } from "../../api/api";
import CompactVideoCard from "./CompactVideoCard";
import "./RecommendationSidebar.css";

function RecommendationSidebar({ currentVideoId }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get("/videos/videos", {
          params: { limit: 24 },
        });
        const list =
          res?.data?.videos ??
          res?.data?.data?.videos ??
          (Array.isArray(res?.data?.data) ? res.data.data : []);
        if (!cancelled) setRecommendations(Array.isArray(list) ? list : []);
      } catch {
        if (!cancelled) setRecommendations([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const list = recommendations
    .filter((v) => {
      const id = v._id ?? v.id;
      if (currentVideoId == null || currentVideoId === "") return true;
      return String(id) !== String(currentVideoId);
    })
    .slice(0, 8);

  return (
    <div className="recommendation-sidebar">
      <h2 className="recommendation-title">Up next</h2>
      <div className="recommendation-list">
        {loading ? (
          <div className="recommendation-loading" aria-busy="true">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="recommendation-skeleton-row">
                <div className="recommendation-skeleton-thumb" />
                <div className="recommendation-skeleton-text">
                  <div className="recommendation-skeleton-line" />
                  <div className="recommendation-skeleton-line short" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          list.map((video) => (
            <CompactVideoCard key={video._id || video.id} video={video} />
          ))
        )}
      </div>
    </div>
  );
}

export default RecommendationSidebar;
