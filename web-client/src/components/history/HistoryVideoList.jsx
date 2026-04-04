import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/api";
import { formatDuration, formatViewCount } from "../../utils/formatVideoMeta";
import "./HistoryVideoList.css";

function getDateSectionLabel(iso) {
  if (!iso) return "Earlier";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Earlier";
  const now = new Date();
  const startOfDay = (x) =>
    new Date(x.getFullYear(), x.getMonth(), x.getDate());
  const diffMs = startOfDay(now) - startOfDay(d);
  const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return d.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/** Preserves watch order (newest first) and builds ordered [label, videos[]] sections */
function buildHistorySections(videos) {
  const sorted = [...videos].sort(
    (a, b) =>
      new Date(b.updatedAt || b.createdAt || 0) -
      new Date(a.updatedAt || a.createdAt || 0),
  );
  const sections = [];
  const labelToIndex = new Map();
  for (const v of sorted) {
    const label = getDateSectionLabel(v.updatedAt || v.createdAt);
    let idx = labelToIndex.get(label);
    if (idx === undefined) {
      idx = sections.length;
      labelToIndex.set(label, idx);
      sections.push([label, []]);
    }
    sections[idx][1].push(v);
  }
  return sections;
}

function HistoryVideoList({ search }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/users/watch-history");
        const raw = res?.data?.data ?? res?.data;
        const list = Array.isArray(raw) ? raw : [];
        if (!cancelled) setVideos(list);
      } catch (err) {
        if (cancelled) return;
        if (err.response?.status === 401) {
          setError("auth");
        } else {
          setError("load");
        }
        setVideos([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const sections = useMemo(() => {
    const q = (search || "").trim().toLowerCase();
    const filtered = videos.filter((v) => {
      if (!q) return true;
      const title = (v.title || "").toLowerCase();
      const channel = (v.owner?.fullName || "").toLowerCase();
      return title.includes(q) || channel.includes(q);
    });
    return buildHistorySections(filtered);
  }, [videos, search]);

  if (loading) {
    return (
      <div className="history-video-list history-video-list-loading" aria-busy="true">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="history-skeleton-row">
            <div className="history-skeleton-thumb" />
            <div className="history-skeleton-info">
              <div className="history-skeleton-line" />
              <div className="history-skeleton-line short" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error === "auth") {
    return (
      <div className="history-video-list-empty">
        <p>Sign in to see your watch history.</p>
        <Link to="/login" className="history-video-list-login-link">
          Sign in
        </Link>
      </div>
    );
  }

  if (error === "load") {
    return (
      <div className="history-video-list-empty">
        <p>Could not load watch history. Try again later.</p>
      </div>
    );
  }

  if (sections.length === 0 || sections.every(([, list]) => list.length === 0)) {
    const hasAny = videos.length > 0;
    const filteredEmpty =
      hasAny && (search || "").trim() !== "";
    return (
      <div className="history-video-list-empty">
        <p>
          {filteredEmpty
            ? "No videos match your search."
            : "No watch history yet. Videos you watch will show up here."}
        </p>
      </div>
    );
  }

  return (
    <div className="history-video-list">
      {sections.map(([date, list]) => (
        <div key={date} className="history-date-section">
          <h2 className="history-date-title">{date}</h2>
          {list.map((video) => {
            const id = video._id || video.id;
            const channelName = video.owner?.fullName || video.channelName || "Channel";
            const views =
              typeof video.view === "number"
                ? formatViewCount(video.view)
                : video.views ?? "";
            return (
              <Link
                key={id}
                to={`/watch?v=${id}`}
                className="history-video-item"
              >
                <div className="history-video-thumbnail">
                  <img src={video.thumbnail} alt="" loading="lazy" />
                  <span className="history-video-duration">
                    {formatDuration(video.duration)}
                  </span>
                </div>
                <div className="history-video-info">
                  <h3 className="history-video-title">{video.title}</h3>
                  <p className="history-video-meta">
                    {channelName}
                    {video.verified && (
                      <svg className="verified-badge" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                        />
                      </svg>
                    )}
                    {views ? ` • ${views}` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  className="history-video-menu"
                  aria-label="More"
                  onClick={(e) => e.preventDefault()}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                  </svg>
                </button>
              </Link>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default HistoryVideoList;
