import { useSearchParams } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import VideoPlayer from "../components/watch/VideoPlayer";
import VideoMetadata from "../components/watch/VideoMetadata";
import VideoDescription from "../components/watch/VideoDescription";
import Comments from "../components/watch/Comments";
import RecommendationSidebar from "../components/watch/RecommendationSidebar";
import { api } from "../api/api";
import { useState, useEffect, useCallback } from "react";
import "./WatchPage.css";

function WatchPage({ sidebarOpen, onCloseSidebar }) {
  const [searchParams] = useSearchParams();
  const videoId = searchParams.get("v");
  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState(null);
  const [likes, setLikes] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const handleExpandDescription = () => {
    setDescriptionExpanded(true);
    setTimeout(
      () =>
        document
          .getElementById("video-description")
          ?.scrollIntoView({ behavior: "smooth" }),
      50,
    );
  };

  const fetchVideo = useCallback(async () => {
    if (!videoId) return;
    try {
      const res = await api.get(`/videos/${videoId}`);
      const data = res?.data?.data ?? res?.data;
      const videoData = data?.video ?? data;
      setVideo(videoData);
      setLikes(data?.likes ?? 0);
      setIsLiked(!!data?.isLiked);
    } catch (error) {
      console.error(error);
      setVideo(null);
      setLikes(null);
      setIsLiked(false);
    }
  }, [videoId]);

  const fetchComments = useCallback(async () => {
    if (!videoId) return;
    try {
      const res = await api.get(`/comments/${videoId}?page=1&limit=30`);
      console.log("comments", res);
      const data = res?.data?.data ?? res?.data;
      const commentsData = data?.comments ?? data;
      setComments(commentsData);
    } catch (error) {
      console.error(error);
      setComments(null);
    }
  }, [videoId]);

  const refreshComments = useCallback(async () => {
    if (!videoId) return;
    try {
      const res = await api.get(`/comments/${videoId}`);
      const raw = res?.data?.data ?? res?.data;
      const list = Array.isArray(raw) ? raw : (raw?.comments ?? []);
      setComments(Array.isArray(list) ? list : []);
    } catch {
      /* keep existing comments on failure */
    }
  }, [videoId]);

  useEffect(() => {
    setDescriptionExpanded(false);
  }, [videoId]);

  useEffect(() => {
    const channelId = video?.owner?._id;
    if (!channelId) {
      setIsSubscribed(false);
      return;
    }
    let cancelled = false;
    const checkSubscribed = async () => {
      try {
        const response = await api.post(`/subscriptions/${channelId}`, {});
        const data = response?.data?.data ?? response?.data;
        const next =
          typeof data === "boolean" ? data : (data?.isSubscribed ?? false);
        if (!cancelled) setIsSubscribed(!!next);
      } catch {
        if (!cancelled) setIsSubscribed(false);
      }
    };
    checkSubscribed();
    return () => {
      cancelled = true;
    };
  }, [video?.owner?._id]);

  useEffect(() => {
    if (!videoId) {
      setVideo(null);
      setComments([]);
      setLikes(null);
      setIsLiked(false);
      return;
    }
    fetchVideo();
    fetchComments();
  }, [videoId, fetchVideo, fetchComments]);

  return (
    <>
      {sidebarOpen && (
        <Sidebar collapsed={false} isOpen={true} onClose={onCloseSidebar} />
      )}
      <main className="main-content watch-main watch-no-sidebar">
        {!videoId ? (
          <div className="watch-empty" role="status">
            <p>Pick a video to watch.</p>
            <p className="watch-empty-hint">
              Open a video from Home or use a link with ?v=videoId
            </p>
          </div>
        ) : (
          <div className="watch-layout">
            <section className="watch-video-section">
              <div className="watch-video-wrapper">
                <VideoPlayer video={video} />
              </div>
              <div className="watch-video-info">
                <VideoMetadata
                  video={video}
                  likesCount={likes}
                  isLiked={isLiked}
                  onLikeChange={(nextLiked, nextCount) => {
                    setIsLiked(nextLiked);
                    if (typeof nextCount === "number") setLikes(nextCount);
                  }}
                  isSubscribed={isSubscribed}
                  onExpandDescription={handleExpandDescription}
                  onSubscribeChange={() => setIsSubscribed((prev) => !prev)}
                />
                <VideoDescription
                  video={video}
                  expanded={descriptionExpanded}
                  onExpand={() => setDescriptionExpanded(true)}
                />
                <Comments
                  video={video}
                  comments={comments ?? []}
                  onCommentAdded={refreshComments}
                />
              </div>
            </section>
            <aside className="watch-sidebar">
              <RecommendationSidebar currentVideoId={video?._id || video?.id} />
            </aside>
          </div>
        )}
      </main>
    </>
  );
}

export default WatchPage;
