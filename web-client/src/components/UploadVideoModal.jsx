import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { api } from "../api/api";
import "./UploadVideoModal.css";

function UploadVideoModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [videoDragActive, setVideoDragActive] = useState(false);
  const [thumbDragActive, setThumbDragActive] = useState(false);
  const closeBtnRef = useRef(null);
  const videoInputRef = useRef(null);
  const thumbInputRef = useRef(null);

  const thumbPreviewUrl = useMemo(() => {
    if (!thumbnailFile) return null;
    return URL.createObjectURL(thumbnailFile);
  }, [thumbnailFile]);

  useEffect(() => {
    return () => {
      if (thumbPreviewUrl) URL.revokeObjectURL(thumbPreviewUrl);
    };
  }, [thumbPreviewUrl]);

  const reset = () => {
    setTitle("");
    setDescription("");
    setVideoFile(null);
    setThumbnailFile(null);
    setError(null);
    setSubmitting(false);
    setVideoDragActive(false);
    setThumbDragActive(false);
    if (videoInputRef.current) videoInputRef.current.value = "";
    if (thumbInputRef.current) thumbInputRef.current.value = "";
  };

  const handleClose = () => {
    if (submitting) return;
    reset();
    onClose();
  };

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeBtnRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key !== "Escape" || submitting) return;
      reset();
      onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose, submitting]);

  const pickVideo = useCallback(() => {
    videoInputRef.current?.click();
  }, []);

  const pickThumb = useCallback(() => {
    thumbInputRef.current?.click();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const t = title.trim();
    const d = description.trim();
    if (!t || !d) {
      setError("Title and description are required.");
      return;
    }
    if (!videoFile) {
      setError("Add a video file.");
      return;
    }
    if (!thumbnailFile) {
      setError("Add a thumbnail image.");
      return;
    }

    const formData = new FormData();
    formData.append("title", t);
    formData.append("description", d);
    formData.append("videoFile", videoFile);
    formData.append("thumbnail", thumbnailFile);

    setSubmitting(true);
    try {
      const res = await api.post("/videos/upload", formData, {
        withCredentials: true,
        timeout: 600_000,
      });
      const payload = res?.data?.data ?? res?.data;
      const vid = payload?._id ?? payload?.id;
      reset();
      onClose();
      if (vid) navigate(`/watch?v=${vid}`);
      else navigate("/");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Upload failed. Try again.";
      setError(typeof msg === "string" ? msg : "Upload failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const onVideoDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setVideoDragActive(false);
    const f = e.dataTransfer?.files?.[0];
    if (f && f.type.startsWith("video/")) setVideoFile(f);
  }, []);

  const onThumbDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setThumbDragActive(false);
    const f = e.dataTransfer?.files?.[0];
    if (f && f.type.startsWith("image/")) setThumbnailFile(f);
  }, []);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="upload-modal-overlay"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className="upload-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="upload-modal-accent" aria-hidden />

        <header className="upload-modal-header">
          <div className="upload-modal-header-main">
            <div className="upload-modal-badge" aria-hidden>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 5v14M12 5l-5.5 5.5M12 5l5.5 5.5" />
              </svg>
            </div>
            <div>
              <h2 id="upload-modal-title" className="upload-modal-title">
                Upload video
              </h2>
              <p className="upload-modal-subtitle">
                Add a title, description, and files — then publish to your channel.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="upload-modal-close"
            ref={closeBtnRef}
            onClick={handleClose}
            disabled={submitting}
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </header>

        <form className="upload-modal-form" onSubmit={handleSubmit}>
          <section className="upload-modal-section">
            <h3 className="upload-modal-section-title">Details</h3>
            <div className="upload-modal-field">
              <label htmlFor="upload-title">Title</label>
              <input
                id="upload-title"
                type="text"
                className="upload-modal-input"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Catchy title for your video"
                maxLength={200}
                disabled={submitting}
                autoComplete="off"
              />
            </div>
            <div className="upload-modal-field">
              <label htmlFor="upload-desc">Description</label>
              <textarea
                id="upload-desc"
                className="upload-modal-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell viewers what your video is about"
                disabled={submitting}
                rows={4}
              />
            </div>
          </section>

          <section className="upload-modal-section">
            <h3 className="upload-modal-section-title">Files</h3>
            <div className="upload-modal-drop-row">
              <input
                ref={videoInputRef}
                id="upload-video"
                type="file"
                className="upload-modal-file-input"
                accept="video/*"
                disabled={submitting}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  setVideoFile(f || null);
                }}
              />
              <div
                role="button"
                tabIndex={0}
                className={`upload-drop-zone${videoDragActive ? " upload-drop-zone--active" : ""}${videoFile ? " upload-drop-zone--filled" : ""}`}
                onClick={pickVideo}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    pickVideo();
                  }
                }}
                onDragEnter={(e) => {
                  e.preventDefault();
                  setVideoDragActive(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  if (!e.currentTarget.contains(e.relatedTarget))
                    setVideoDragActive(false);
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={onVideoDrop}
              >
                <div className="upload-drop-zone-icon" aria-hidden>
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 4v9M12 4L8 8M12 4l4 4" />
                    <rect x="3" y="14" width="18" height="7" rx="1.5" />
                  </svg>
                </div>
                <p className="upload-drop-zone-title">Video</p>
                <p className="upload-drop-zone-hint">
                  Drop a file or <span>browse</span>
                </p>
                <p className="upload-drop-zone-meta">MP4, WebM, MOV</p>
                {videoFile && (
                  <p className="upload-drop-zone-name">{videoFile.name}</p>
                )}
              </div>

              <input
                ref={thumbInputRef}
                id="upload-thumb"
                type="file"
                className="upload-modal-file-input"
                accept="image/*"
                disabled={submitting}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  setThumbnailFile(f || null);
                }}
              />
              <div
                role="button"
                tabIndex={0}
                className={`upload-drop-zone upload-drop-zone--thumb${thumbDragActive ? " upload-drop-zone--active" : ""}${thumbnailFile ? " upload-drop-zone--filled" : ""}`}
                onClick={pickThumb}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    pickThumb();
                  }
                }}
                onDragEnter={(e) => {
                  e.preventDefault();
                  setThumbDragActive(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  if (!e.currentTarget.contains(e.relatedTarget))
                    setThumbDragActive(false);
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={onThumbDrop}
              >
                {thumbPreviewUrl ? (
                  <img
                    src={thumbPreviewUrl}
                    alt=""
                    className="upload-drop-thumb-preview"
                  />
                ) : (
                  <div className="upload-drop-zone-icon" aria-hidden>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                  </div>
                )}
                <p className="upload-drop-zone-title">Thumbnail</p>
                <p className="upload-drop-zone-hint">
                  Drop an image or <span>browse</span>
                </p>
                <p className="upload-drop-zone-meta">JPG, PNG, WebP</p>
                {thumbnailFile && !thumbPreviewUrl && (
                  <p className="upload-drop-zone-name">{thumbnailFile.name}</p>
                )}
              </div>
            </div>
          </section>

          {error && (
            <div className="upload-modal-error-banner" role="alert">
              {error}
            </div>
          )}
          {submitting && (
            <div className="upload-modal-progress-banner">
              <span className="upload-modal-progress-dot" />
              Uploading and processing — this can take a few minutes…
            </div>
          )}

          <footer className="upload-modal-footer">
            <button
              type="button"
              className="upload-modal-btn upload-modal-btn--ghost"
              onClick={handleClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="upload-modal-btn upload-modal-btn--primary"
              disabled={submitting}
            >
              {submitting ? "Publishing…" : "Publish"}
            </button>
          </footer>
        </form>
      </div>
    </div>,
    document.body,
  );
}

export default UploadVideoModal;
