import "./VideoCardSkeleton.css";

function VideoCardSkeleton() {
  return (
    <article className="video-card-skeleton" aria-hidden="true">
      <div className="video-card-skeleton-thumb" />
      <div className="video-card-skeleton-info">
        <div className="video-card-skeleton-avatar" />
        <div className="video-card-skeleton-meta">
          <div className="video-card-skeleton-line video-card-skeleton-line-title" />
          <div className="video-card-skeleton-line video-card-skeleton-line-short" />
          <div className="video-card-skeleton-line video-card-skeleton-line-stats" />
        </div>
      </div>
    </article>
  );
}

export default VideoCardSkeleton;
