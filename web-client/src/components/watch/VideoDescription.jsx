import { useState } from "react";
import "./VideoDescription.css";
import { formatRelativeUpload } from "../../utils/formatVideoMeta";

function VideoDescription({ video, expanded: expandedProp, onExpand }) {
  const [expandedLocal, setExpandedLocal] = useState(false);
  const expanded = expandedProp ?? expandedLocal;
  const uploadDate = video?.createdAt || video?.updatedAt;
  const setExpanded = onExpand ?? (() => setExpandedLocal(true));
  const fullDescription = video?.description || "No description available.";
  const hashtags = ["#TMKOCMemes", "#TaarakMehta", "#LIVComedy", "#Jethalal"];
  const shouldTruncate = fullDescription.length > 150;
  const displayText =
    expanded || !shouldTruncate
      ? fullDescription
      : fullDescription.slice(0, 150) + "...";

  return (
    <div id="video-description" className="video-description">
      <div className="video-description-meta video-description-meta-desktop">
        <span className="video-description-views">{video?.view}</span>
        <span className="video-description-sep"> · </span>
        <span className="video-description-date">{formatRelativeUpload(uploadDate)}</span>
        {hashtags.map((tag) => (
          <a key={tag} href="#" className="video-description-tag">
            {tag}
          </a>
        ))}
      </div>
      <p className="video-description-text">
        {displayText}
        {shouldTruncate && !expanded && (
          <button
            className="video-description-more"
            onClick={() => setExpanded()}
          >
            ...more
          </button>
        )}
      </p>
    </div>
  );
}

export default VideoDescription;
