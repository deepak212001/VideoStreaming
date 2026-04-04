import { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import Sidebar from "../components/Sidebar";
import VideoCard from "../components/VideoCard";
import { api } from "../api/api";
import "./ChannelPage.css";

const TABS = ["Home", "Videos", "Shorts", "Live", "Playlists", "Posts"];
const FILTERS = [
  { id: "latest", label: "Latest" },
  { id: "popular", label: "Popular" },
  { id: "oldest", label: "Oldest" },
];

function formatSubs(n) {
  const v = Number(n) || 0;
  if (v >= 1e7)
    return `${(v / 1e7).toFixed(2).replace(/\.?0+$/, "")} crore subscribers`;
  if (v >= 1e6)
    return `${(v / 1e6).toFixed(2).replace(/\.?0+$/, "")}M subscribers`;
  if (v >= 1e3)
    return `${(v / 1e3).toFixed(1).replace(/\.0$/, "")}K subscribers`;
  return `${v} subscriber${v === 1 ? "" : "s"}`;
}

function formatVideoCount(n) {
  const v = Number(n) || 0;
  if (v >= 1e6)
    return `${(v / 1e6).toFixed(1).replace(/\.0$/, "")}M videos`;
  if (v >= 1e3)
    return `${(v / 1e3).toFixed(1).replace(/\.0$/, "")}K videos`;
  return `${v} video${v === 1 ? "" : "s"}`;
}

function ChannelPage({
  sidebarCollapsed,
  sidebarOpen,
  onCloseSidebar,
  isMobile,
}) {
  const { channelId } = useParams();
  const authUser = useSelector((state) => state.auth.user);
  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [videosLoading, setVideosLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("Videos");
  const [sort, setSort] = useState("latest");
  const [subBusy, setSubBusy] = useState(false);

  const fetchChannel = useCallback(async () => {
    if (!channelId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/users/channel/${channelId}`);
      const data = res?.data?.data ?? res?.data;
      const ch = data?.channel ?? data;
      setChannel(ch || null);
      if (!ch) setError("Channel not found.");
    } catch {
      setChannel(null);
      setError("Channel not found.");
    } finally {
      setLoading(false);
    }
  }, [channelId]);

  const fetchVideos = useCallback(async () => {
    if (!channelId) return;
    setVideosLoading(true);
    try {
      const res = await api.get(`/videos/channel/${channelId}`, {
        params: { sort, limit: 40 },
      });
      const list = res?.data?.videos ?? res?.data?.data?.videos ?? [];
      setVideos(Array.isArray(list) ? list : []);
    } catch {
      setVideos([]);
    } finally {
      setVideosLoading(false);
    }
  }, [channelId, sort]);

  useEffect(() => {
    fetchChannel();
  }, [fetchChannel]);

  useEffect(() => {
    if (activeTab === "Videos") fetchVideos();
  }, [activeTab, fetchVideos]);

  const isOwnChannel =
    authUser &&
    channelId &&
    String(authUser._id) === String(channelId);

  const handleSubscribe = async () => {
    if (!channelId || subBusy || isOwnChannel) return;
    setSubBusy(true);
    try {
      await api.post(`/subscriptions/c/${channelId}`, {}, { withCredentials: true });
      setChannel((prev) =>
        prev ? { ...prev, isSubscribed: !prev.isSubscribed } : prev,
      );
    } catch (e) {
      console.error(e);
    } finally {
      setSubBusy(false);
    }
  };

  const metaLine = channel
    ? [
        channel.username ? `@${channel.username}` : null,
        formatSubs(channel.subscribersCount),
        formatVideoCount(channel.videoCount),
      ]
        .filter(Boolean)
        .join(" • ")
    : "";

  return (
    <>
      <Sidebar
        collapsed={!isMobile && sidebarCollapsed}
        isOpen={isMobile && sidebarOpen}
        onClose={onCloseSidebar}
      />
      <main className="main-content channel-page">
        {loading && <p className="channel-placeholder-tab">Loading…</p>}
        {!loading && error && (
          <div className="channel-page-error">
            <p>{error}</p>
            <p>
              <Link to="/">Back to Home</Link>
            </p>
          </div>
        )}
        {!loading && channel && (
          <>
            <header className="channel-header">
              <img
                className="channel-header-avatar"
                src={
                  channel.avatar ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${channel.username || channelId}`
                }
                alt=""
              />
              <div className="channel-header-body">
                <div className="channel-header-title-row">
                  <h1 className="channel-header-name">
                    {channel.fullName || channel.username || "Channel"}
                  </h1>
                  <svg
                    className="channel-header-verified"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fill="currentColor"
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                    />
                  </svg>
                </div>
                <p className="channel-header-meta">{metaLine}</p>
                <p className="channel-header-desc">
                  More about this channel
                  <button type="button" className="channel-header-desc-more">
                    ...more
                  </button>
                </p>
                <div className="channel-subscribe-wrap">
                  {isOwnChannel ? (
                    <span className="channel-header-meta">Your channel</span>
                  ) : authUser ? (
                    channel.isSubscribed ? (
                      <button
                        type="button"
                        className="channel-subscribe-btn channel-subscribe-btn--subscribed"
                        onClick={handleSubscribe}
                        disabled={subBusy}
                      >
                        <svg
                          className="channel-subscribe-btn-bell"
                          viewBox="0 0 24 24"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M13.73 21a2 2 0 0 1-3.46 0"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span>Subscribed</span>
                        <svg
                          className="channel-subscribe-chevron"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path d="M7 10l5 5 5-5z" />
                        </svg>
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="channel-subscribe-btn channel-subscribe-btn--outline"
                        onClick={handleSubscribe}
                        disabled={subBusy}
                      >
                        Subscribe
                      </button>
                    )
                  ) : (
                    <Link
                      className="channel-subscribe-btn channel-subscribe-btn--outline"
                      to="/login"
                      style={{ textDecoration: "none" }}
                    >
                      Subscribe
                    </Link>
                  )}
                </div>
              </div>
            </header>

            <div className="channel-tabs-row">
              <div className="channel-tabs" role="tablist">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === tab}
                    className={`channel-tab ${activeTab === tab ? "channel-tab--active" : ""}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="channel-tab-search"
                aria-label="Search channel"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                </svg>
              </button>
            </div>

            {activeTab === "Videos" && (
              <>
                <div className="channel-filters">
                  {FILTERS.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      className={`channel-filter-chip ${sort === f.id ? "channel-filter-chip--active" : ""}`}
                      onClick={() => setSort(f.id)}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
                {videosLoading ? (
                  <p className="channel-placeholder-tab">Loading videos…</p>
                ) : videos.length === 0 ? (
                  <p className="channel-placeholder-tab">No videos yet.</p>
                ) : (
                  <ul className="channel-video-grid">
                    {videos.map((v, i) => (
                      <li key={v._id || v.id}>
                        <VideoCard
                          video={v}
                          priority={i < 8}
                          hideChannelAvatar
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}

            {activeTab !== "Videos" && (
              <div className="channel-placeholder-tab">
                {activeTab} — coming soon.
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}

export default ChannelPage;
