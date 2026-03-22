import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import "./Comments.css";

function Comments({ comments = [] }) {
  const [sortBy, setSortBy] = useState("Top");
  const commentCount = comments?.length ?? 0;
  const user = useSelector((state) => state.auth.user);
  return (
    <div className="comments">
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
          src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=default"}
          alt={user?.fullName || "User"}
        />
        <input
          type="text"
          className="comments-add-input"
          placeholder="Add a comment..."
        />
      </div>
      <div className="comments-list">
        {comments?.map((comment) => (
          <div key={comment._id} className="comment">
            <img
              className="comment-avatar"
              src={
                comment.owner?.avatar ||
                "https://api.dicebear.com/7.x/avataaars/svg?seed=default"
              }
              alt={comment.owner?.fullName || "User"}
            />
            <div className="comment-body">
              <div className="comment-header">
                <span className="comment-author">
                  {comment.owner?.fullName || "Unknown"}
                </span>
                {/* <span className="comment-time">{comment.time}</span> */}
                {/* {comment.edited && (
                  <span className="comment-edited"> (edited)</span>
                )} */}
              </div>
              <p className="comment-text">{comment.content}</p>
              <div className="comment-actions">
                <button className="comment-action">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" />
                  </svg>
                  {/* {comment.likes > 0 && <span>{comment.likes}</span>} */}
                </button>
                <button className="comment-action">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v2c0 1.1.9 2 2 2h4.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z" />
                  </svg>
                </button>
                <button className="comment-reply">Reply</button>
              </div>
              {/* {comment.replies > 0 && (
                <button className="comment-replies-toggle">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 10l5 5 5-5z" />
                  </svg>
                  {comment.replies} replies
                </button>
              )} */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Comments;
