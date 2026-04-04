import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import Sidebar from "../components/Sidebar";
import { api } from "../api/api";
import "./SubscriptionsPage.css";

function SubscriptionsPage({
  sidebarCollapsed,
  sidebarOpen,
  onCloseSidebar,
  isMobile,
}) {
  const user = useSelector((state) => state.auth.user);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(!!user);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    if (!user) {
      setChannels([]);
      setLoading(false);
      setError(null);
      return;
    }
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/subscriptions/my-channels");
        const data = res?.data?.data ?? res?.data;
        const list = data?.channels ?? (Array.isArray(data) ? data : []);
        if (!cancelled) setChannels(Array.isArray(list) ? list : []);
      } catch (e) {
        if (!cancelled) {
          setError("Could not load subscriptions.");
          setChannels([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleSubscribedClick = async (channelId) => {
    if (!channelId || busyId) return;
    setBusyId(channelId);
    try {
      await api.post(`/subscriptions/c/${channelId}`, {}, { withCredentials: true });
      setChannels((prev) => prev.filter((c) => c._id !== channelId));
    } catch (e) {
      console.error(e);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <Sidebar
        collapsed={!isMobile && sidebarCollapsed}
        isOpen={isMobile && sidebarOpen}
        onClose={onCloseSidebar}
        activeItem="subscriptions"
      />
      <main className="main-content subscriptions-main">
        <h1 className="subscriptions-title">Subscriptions</h1>
        <p className="subscriptions-sub">
          Channels you follow — newest first
        </p>

        {!user && (
          <div className="subscriptions-login-hint">
            <p>Sign in to see your subscribed channels.</p>
            <p>
              <Link to="/login">Go to login</Link>
            </p>
          </div>
        )}

        {user && loading && (
          <p className="subscriptions-loading">Loading…</p>
        )}

        {user && !loading && error && (
          <p className="subscriptions-error">{error}</p>
        )}

        {user && !loading && !error && channels.length === 0 && (
          <div className="subscriptions-empty">
            You have not subscribed to any channel yet. Subscribe from a video
            page.
          </div>
        )}

        {user && !loading && channels.length > 0 && (
          <ul className="subscriptions-grid" aria-label="Subscribed channels">
            {channels.map((ch) => (
              <li key={ch._id} className="subscriptions-card">
                <Link to={`/c/${ch._id}`} className="subscriptions-card-link">
                  <img
                    className="subscriptions-card-avatar"
                    src={
                      ch.avatar ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${ch.username || ch._id}`
                    }
                    alt=""
                  />
                  <div className="subscriptions-card-info">
                    <p className="subscriptions-card-name">
                      {ch.fullName || ch.username || "Channel"}
                    </p>
                    {ch.username && (
                      <p className="subscriptions-card-username">
                        @{ch.username}
                      </p>
                    )}
                  </div>
                </Link>
                <button
                  type="button"
                  className="subscriptions-card-btn"
                  disabled={busyId === ch._id}
                  onClick={() => handleSubscribedClick(ch._id)}
                  aria-label="Subscribed — click to unsubscribe"
                >
                  {busyId === ch._id ? (
                    <span className="subscriptions-card-btn-loading">…</span>
                  ) : (
                    <>
                      <svg
                        className="subscriptions-card-btn-bell"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
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
                      <span className="subscriptions-card-btn-label">
                        Subscribed
                      </span>
                    </>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  );
}

export default SubscriptionsPage;
