import "./VideoMetadata.css";

function VideoMetadata({ video, likes: likesProp, onExpandDescription }) {
  const subscribers =
    video?.owner?.subscribers || video?.subscribers || "1M subscribers";
  const likes = likesProp ?? video?.like ?? video?.likes ?? "1K";

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
          <img
            className="video-metadata-avatar"
            src={video?.owner?.avatar}
            alt={video?.owner?.fullName}
          />
          <div>
            <div className="video-metadata-channel-name">
              {video?.owner.fullName}
              {/* {video?.verified && (
                <svg className="verified-badge" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              )} */}
            </div>
            <span className="video-metadata-subscribers">{subscribers}</span>
          </div>
          <button className="video-metadata-subscribe">Subscribe</button>
        </div>
        <div className="video-metadata-actions">
          <div className="video-metadata-like-group">
            <button className="video-metadata-action-btn">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
              </svg>
              <span>{likes}</span>
            </button>
            <button className="video-metadata-action-btn">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h4.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z" />
              </svg>
            </button>
          </div>
          <button className="video-metadata-action-btn video-metadata-share">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
            </svg>
            <span>Share</span>
          </button>
          <button className="video-metadata-action-btn video-metadata-save">
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
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoMetadata;
