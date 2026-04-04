import "./VideoMetadata.css";
import { api } from "../../api/api";
import { formatLikeCount } from "../../utils/formatVideoMeta";
import { useNavigate } from "react-router-dom";
function VideoMetadata({
  video,
  likesCount,
  isLiked,
  onLikeChange,
  onExpandDescription,
  isSubscribed,
  onSubscribeChange,
}) {
  const navigate = useNavigate();
  const subscribers =
    video?.owner?.subscribers || video?.subscribers || "1M subscribers";
  const likeDisplay = formatLikeCount(likesCount == null ? 0 : likesCount);

  const handleSubscribe = async () => {
    if (!video?.owner?._id) return;
    try {
      await api.post(
        `/subscriptions/c/${video.owner._id}`,
        {},
        { withCredentials: true },
      );
      onSubscribeChange?.();
    } catch (error) {
      console.error(error);
    }
  };

  const handleLike = async () => {
    if (!video?._id) return;
    try {
      const res = await api.post(`/likes/toggle/v/${video._id}`, {});
      const payload = res?.data?.data ?? res?.data;
      const nextLiked =
        typeof payload?.liked === "boolean"
          ? payload.liked
          : typeof payload?.Liked === "boolean"
            ? payload.Liked
            : !isLiked;
      const prev = isLiked;
      const n = Number(likesCount);
      const base = Number.isFinite(n) ? n : 0;
      let nextCount = base;
      if (nextLiked && !prev) nextCount = base + 1;
      else if (!nextLiked && prev) nextCount = Math.max(0, base - 1);
      onLikeChange?.(nextLiked, nextCount);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="video-metadata">
      <h1 className="video-metadata-title">{video?.title}</h1>
      <div className="video-metadata-meta">
        <span className="video-metadata-meta-left">
          <span className="video-metadata-views">{video?.view} Views</span>
          <span className="video-metadata-sep"> · </span>
          <span className="video-metadata-date">{video?.uploadDate}</span>
        </span>
        <button
          type="button"
          className="video-metadata-more-link"
          onClick={() => onExpandDescription?.()}
        >
          <span className="video-metadata-sep"> ···</span>
          more
        </button>
      </div>
      <div className="video-metadata-channel-row">
        <div className="video-metadata-channel-info">
          <div
            className="video-metadata-channel-info"
            onClick={() => navigate(`/c/${video?.owner?._id}`)}
          >
            <img
              className="video-metadata-avatar"
              src={video?.owner?.avatar}
              alt={video?.owner?.fullName}
            />
            <div onClick={() => navigate(`/c/${video?.owner?._id}`)}>
              <div className="video-metadata-channel-name">
                {video?.owner?.fullName ?? "Channel"}
              </div>
              <span className="video-metadata-subscribers">{subscribers}</span>
            </div>
          </div>
          <div className="video-metadata-subscribe-group">
            <button
              type="button"
              className={`video-metadata-subscribe ${isSubscribed ? "video-metadata-subscribe-subscribed" : ""}`}
              onClick={() => handleSubscribe()}
            >
              {isSubscribed ? (
                <div className="video-metadata-subscribe-group">
                  <div className="video-metadata-subscribe-group-icon">
                    <svg
                      className="video-metadata-bell-icon"
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
                      />{" "}
                      <path
                        d="M13.73 21a2 2 0 0 1-3.46 0"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="video-metadata-subscribe-group-text">
                    <span className="video-metadata-subscribe-text">
                      Subscribed
                    </span>
                  </div>
                </div>
              ) : (
                "Subscribe"
              )}
            </button>
          </div>
        </div>
        <div className="video-metadata-actions">
          <div className="video-metadata-like-group video-metadata-like-group--single">
            <button
              type="button"
              className={`video-metadata-action-btn video-metadata-like-btn ${isLiked ? "video-metadata-like-btn--active" : "video-metadata-like-btn--outline"}`}
              onClick={handleLike}
              aria-pressed={isLiked}
              aria-label={isLiked ? "Unlike" : "Like"}
            >
              {isLiked ? (
                <svg
                  className="video-metadata-like-icon"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fill="currentColor"
                    d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"
                  />
                </svg>
              ) : (
                <svg
                  className="video-metadata-like-icon video-metadata-like-icon--outline"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.35"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    d="M1 20.5V9.5h4v11H1zm4-11V9c0-.55.22-1.05.59-1.42l6.59-6.58a.996.996 0 011.41 0l1.06 1.06c.27.27.44.65.44 1.06l-.03.32-.95 4.57H19c1.1 0 2 .9 2 2v2c0 .26-.05.5-.14.73l-3.02 7.05A2 2 0 0116.09 21H8.5c-.55 0-1-.45-1-1v-9.5"
                  />
                </svg>
              )}
              <span>{likeDisplay}</span>
            </button>
          </div>
          <button className="video-metadata-action-btn video-metadata-share">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
            </svg>
            <span>Share</span>
          </button>
          {/* <button className="video-metadata-action-btn video-metadata-save">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z" />
            </svg>
            <span>Save</span>
          </button>
          <div className="video-metadata-actions-desktop">
            <button className="video-metadata-action-btn">Download</button>
            <button
              className="video-metadata-action-btn video-metadata-more"
              aria-label="More"
            >
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
              </svg>
            </button> */}
          {/* </div> */}
        </div>
      </div>
    </div>
  );
}

export default VideoMetadata;
