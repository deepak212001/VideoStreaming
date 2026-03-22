import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Sidebar from "../components/Sidebar";
import { setUser } from "../store/authSlice";
import { api } from "../api/api";
import "./SettingsPage.css";

function SettingsPage({
  sidebarCollapsed,
  sidebarOpen,
  onCloseSidebar,
  isMobile,
}) {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFullName, setEditFullName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [editUsernameStatus, setEditUsernameStatus] = useState(null);
  const editUsernameRef = useRef("");
  const fileInputRef = useRef(null);

  editUsernameRef.current = editUsername;

  const handleAvatarClick = () => setAvatarModalOpen(true);
  const handleModalClose = () => {
    setAvatarModalOpen(false);
    setAvatarError("");
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      setAvatarError("Please select an image file");
      return;
    }
    setAvatarError("");
    setAvatarUploading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await api.patch("/users/change-avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("res", res);
      const updatedUser = res?.data?.data ?? res?.data;
      dispatch(setUser(updatedUser));
      handleModalClose();
    } catch (err) {
      setAvatarError(err.response?.data?.message || "Upload failed");
    } finally {
      setAvatarUploading(false);
      e.target.value = "";
    }
  };

  useEffect(() => {
    if (!editModalOpen) return;
    const val = editUsername.trim().toLowerCase();
    const currentUserUsername = user?.username?.toLowerCase();
    if (!val) {
      setEditUsernameStatus(null);
      return;
    }
    if (val === currentUserUsername) {
      setEditUsernameStatus("available");
      return;
    }
    setEditUsernameStatus("checking");
    const timer = setTimeout(async () => {
      try {
        const res = await api.get(
          `/users/check-username?username=${encodeURIComponent(val)}`
        );
        if (editUsernameRef.current.trim().toLowerCase() !== val) return;
        const available = res?.data?.data ?? res?.data;
        setEditUsernameStatus(available ? "available" : "taken");
      } catch {
        if (editUsernameRef.current.trim().toLowerCase() === val)
          setEditUsernameStatus(null);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [editUsername, editModalOpen, user?.username]);

  const handleEditClick = () => {
    if (user) {
      setEditFullName(user.fullName || "");
      setEditEmail(user.email || "");
      setEditUsername(user.username || "");
      setEditError("");
      setEditUsernameStatus(null);
      setEditModalOpen(true);
    }
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    setEditError("");
    if (!editFullName.trim() || !editEmail.trim() || !editUsername.trim()) {
      setEditError("All fields are required");
      return;
    }
    if (editUsernameStatus === "taken") {
      setEditError("Username is already taken");
      return;
    }
    setEditSaving(true);
    try {
      const res = await api.patch("/users/change-details", {
        fullName: editFullName.trim(),
        email: editEmail.trim(),
        username: editUsername.trim(),
      });
      const apiUser = res?.data?.data ?? res?.data?.user ?? res?.data;
      const updatedUser = apiUser ? { ...user, ...apiUser } : null;
      if (updatedUser) {
        dispatch(setUser(updatedUser));
      }
      setEditModalOpen(false);
    } catch (err) {
      setEditError(err.response?.data?.message || "Update failed");
    } finally {
      setEditSaving(false);
    }
  };

  const handleEditModalClose = () => {
    setEditModalOpen(false);
    setEditError("");
    setEditUsernameStatus(null);
  };

  return (
    <>
      <Sidebar
        collapsed={!isMobile && sidebarCollapsed}
        isOpen={isMobile && sidebarOpen}
        onClose={onCloseSidebar}
        activeItem="settings"
      />
      <main className="settings-main main-content">
        <div className="settings-card">
          <h1 className="settings-title">Settings</h1>
          {user ? (
            <>
              <div className="settings-profile">
                <div
                  className="settings-avatar-wrap"
                  onClick={handleAvatarClick}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && handleAvatarClick()}
                >
                  <img
                    src={
                      user.avatar ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
                    }
                    alt={user.fullName}
                    className="settings-avatar"
                  />
                  <span className="settings-avatar-hover">Change photo</span>
                </div>
                <div>
                  <p className="settings-name">{user.fullName}</p>
                  <p className="settings-email">{user.email}</p>
                </div>
              </div>
              <div className="settings-details">
                <div className="settings-detail-row">
                  <span className="settings-detail-label">Username</span>
                  <span className="settings-detail-value">
                    @{user.username}
                  </span>
                </div>
                <div className="settings-detail-row">
                  <span className="settings-detail-label">Email</span>
                  <span className="settings-detail-value">{user.email}</span>
                </div>
                {user.createdAt && (
                  <div className="settings-detail-row">
                    <span className="settings-detail-label">Joined</span>
                    <span className="settings-detail-value">
                      {new Date(user.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                )}
                {Array.isArray(user.watchHistory) && (
                  <div className="settings-detail-row">
                    <span className="settings-detail-label">Watch history</span>
                    <span className="settings-detail-value">
                      {user.watchHistory.length} videos
                    </span>
                  </div>
                )}
              </div>
            </>
          ) : null}
          {user && (
            <button
              type="button"
              className="settings-edit-btn"
              onClick={handleEditClick}
            >
              Edit
            </button>
          )}
          <p className="settings-placeholder">More settings coming soon.</p>
        </div>

        {editModalOpen && (
          <div className="settings-modal-overlay" onClick={handleEditModalClose}>
            <div
              className="settings-modal settings-edit-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="settings-modal-title">Edit profile</h3>
              <form onSubmit={handleEditSave}>
                {editError && (
                  <p className="settings-modal-error">{editError}</p>
                )}
                <div className="settings-edit-field">
                  <label>Full name</label>
                  <input
                    type="text"
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    className="settings-edit-input"
                    required
                  />
                </div>
                <div className="settings-edit-field">
                  <label>Email</label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="settings-edit-input"
                    required
                  />
                </div>
                <div className="settings-edit-field">
                  <label>Username</label>
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className={`settings-edit-input ${editUsernameStatus === "taken" ? "auth-input-error" : ""} ${editUsernameStatus === "available" ? "auth-input-success" : ""}`}
                    required
                  />
                  {editUsernameStatus === "available" && (
                    <span className="settings-username-msg settings-username-available">
                      Username is available
                    </span>
                  )}
                  {editUsernameStatus === "taken" && (
                    <span className="settings-username-msg settings-username-taken">
                      Username already taken
                    </span>
                  )}
                </div>
                <div className="settings-modal-actions">
                  <button
                    type="submit"
                    className="settings-modal-btn"
                    disabled={editSaving}
                  >
                    {editSaving ? "Saving..." : "Save"}
                  </button>
                  <button
                    type="button"
                    className="settings-modal-close"
                    onClick={handleEditModalClose}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {avatarModalOpen && (
          <div className="settings-modal-overlay" onClick={handleModalClose}>
            <div
              className="settings-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="settings-modal-title">Upload profile photo</h3>
              {avatarError && (
                <p className="settings-modal-error">{avatarError}</p>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="settings-modal-input"
              />
              <button
                type="button"
                className="settings-modal-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarUploading}
              >
                {avatarUploading ? "Uploading..." : "Choose image"}
              </button>
              <button
                type="button"
                className="settings-modal-close"
                onClick={handleModalClose}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

export default SettingsPage;
