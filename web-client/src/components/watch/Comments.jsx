import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import "./Comments.css";
import { api } from "../../api/api";
import { formatLikeCount } from "../../utils/formatVideoMeta";

function Comments({ video, comments = [], onCommentAdded }) {
  const [sortBy, setSortBy] = useState("Top");
  const [expanded, setExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const commentCount = comments?.length ?? 0;
  const user = useSelector((state) => state.auth.user);
  const firstComment = comments?.[0];
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [commentLikeUi, setCommentLikeUi] = useState({});

  useEffect(() => {
    setCommentLikeUi({});
  }, [video?._id]);

  const getCommentLikeState = useCallback(
    (c) => {
      const id = c._id;
      if (id && commentLikeUi[id]) return commentLikeUi[id];
      return {
        likes: Number(c.likes) || 0,
        isLiked: !!c.isLiked,
      };
    },
    [commentLikeUi],
  );

  const handleCommentLike = async (c) => {
    const id = c._id;
    if (!id) return;
    const cur = getCommentLikeState(c);
    try {
      const res = await api.post(`/likes/toggle/c/${id}`, {});
      const payload = res?.data?.data ?? res?.data;
      const nextLiked =
        typeof payload?.liked === "boolean"
          ? payload.liked
          : typeof payload?.Liked === "boolean"
            ? payload.Liked
            : !cur.isLiked;
      let nextLikes = cur.likes;
      if (nextLiked && !cur.isLiked) nextLikes = cur.likes + 1;
      else if (!nextLiked && cur.isLiked) nextLikes = Math.max(0, cur.likes - 1);
      setCommentLikeUi((prev) => ({
        ...prev,
        [id]: { likes: nextLikes, isLiked: nextLiked },
      }));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    setIsMobile(mq.matches);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (isMobile && expanded) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isMobile, expanded]);

  const handleAddComment = async () => {
    const trimmed = comment?.trim();
    if (!trimmed || !video?._id) return;
    try {
      setIsLoading(true);
      await api.post(
        `/comments/${video._id}`,
        { content: trimmed },
        { withCredentials: true },
      );
      setComment("");
      onCommentAdded?.();
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const showPreview = isMobile && !expanded;
  const showSheet = isMobile && expanded;

  const commentsContent = (
    <>
      <div className="comments-header">
        <h2 className="comments-count">{commentCount} Comments</h2>
        <button className="comments-sort">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 18h6v-2H3v2zM3 6v2h18V6H3zm0 7h12v-2H3v2z" />
          </svg>
          Sort by
        </button>
      </div>
      <div className="comments-add">
        <img
          className="comments-add-avatar"
          src={
            user?.avatar ||
            "https://api.dicebear.com/7.x/avataaars/svg?seed=default"
          }
          alt={user?.fullName || "User"}
        />
        <input
          type="text"
          className="comments-add-input"
          placeholder="Add a comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (comment || "").trim() && handleAddComment()}
        />
        {(comment || "").trim() && (
          <button
            className="comments-add-button"
            onClick={handleAddComment}
            disabled={isLoading}
          >
            {isLoading ? "Adding..." : "Comment"}
          </button>
        )}
      </div>
      <div className="comments-list">
        {comments?.map((item) => {
          const { likes, isLiked } = getCommentLikeState(item);
          return (
            <div key={item._id} className="comment">
              <img
                className="comment-avatar"
                src={
                  item.owner?.avatar ||
                  "https://api.dicebear.com/7.x/avataaars/svg?seed=default"
                }
                alt={item.owner?.fullName || "User"}
              />
              <div className="comment-body">
                <div className="comment-content-row">
                  <div className="comment-text-block">
                    <div className="comment-header">
                      <span className="comment-author">
                        {item.owner?.fullName || "Unknown"}
                      </span>
                    </div>
                    <p className="comment-text">{item.content}</p>
                    {/* <button type="button" className="comment-reply">
                      Reply
                    </button> */}
                  </div>
                  <div className="comment-like-aside">
                    <button
                      type="button"
                      className={`comment-like-btn ${isLiked ? "comment-like-btn--active" : "comment-like-btn--outline"}`}
                      onClick={() => handleCommentLike(item)}
                      aria-pressed={isLiked}
                      aria-label={isLiked ? "Unlike" : "Like"}
                    >
                      {isLiked ? (
                        <svg
                          className="comment-like-icon"
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
                          className="comment-like-icon comment-like-icon--outline"
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
                      <span className="comment-like-count">{formatLikeCount(likes)}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );

  return (
    <div className={`comments ${showPreview ? "comments-preview-mode" : ""}`}>
      {showPreview ? (
        <div
          className="comments-preview-box"
          onClick={() => setExpanded(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && setExpanded(true)}
          aria-label="View all comments"
        >
          <div className="comments-preview-header">
            <h2 className="comments-count">{commentCount} Comments</h2>
          </div>
          {firstComment ? (
            <div className="comments-preview-item">
              <img
                className="comment-avatar"
                src={
                  firstComment.owner?.avatar ||
                  "https://api.dicebear.com/7.x/avataaars/svg?seed=default"
                }
                alt=""
              />
              <p className="comments-preview-text">{firstComment.content}</p>
            </div>
          ) : (
            <div className="comments-preview-item comments-preview-empty">
              <p className="comments-preview-text">No comments yet</p>
            </div>
          )}
        </div>
      ) : showSheet ? (
        <div className="comments-sheet-overlay">
          <div
            className="comments-sheet-backdrop"
            onClick={() => setExpanded(false)}
            aria-hidden="true"
          />
          <div className="comments-sheet">
            <div className="comments-sheet-header">
              <div className="comments-sheet-drag" />
              <div className="comments-sheet-title-row">
                <h2 className="comments-sheet-count">
                  Comments{" "}
                  <span className="comments-sheet-number">{commentCount}</span>
                </h2>
                <button
                  className="comments-sheet-close"
                  onClick={() => setExpanded(false)}
                  aria-label="Close comments"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="comments-sheet-body">{commentsContent}</div>
          </div>
        </div>
      ) : (
        commentsContent
      )}
    </div>
  );
}

export default Comments;
