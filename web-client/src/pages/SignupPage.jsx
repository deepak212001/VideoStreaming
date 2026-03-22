import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser } from "../store/authSlice";
import { api } from "../api/api";
import "./AuthPage.css";

function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState(null); // null | 'available' | 'taken' | 'checking'
  const usernameRef = useRef(username);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  usernameRef.current = username;

  useEffect(() => {
    const val = username.trim().toLowerCase();
    if (!val) {
      setUsernameStatus(null);
      return;
    }
    setUsernameStatus("checking");
    const timer = setTimeout(async () => {
      try {
        const res = await api.get(
          `/users/check-username?username=${encodeURIComponent(val)}`,
        );
        if (usernameRef.current.trim().toLowerCase() !== val) return;
        const available = res?.data?.data ?? res?.data;
        setUsernameStatus(available ? "available" : "taken");
      } catch {
        if (usernameRef.current.trim().toLowerCase() === val)
          setUsernameStatus(null);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [username]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!fullName.trim() || !email.trim() || !username.trim() || !password) {
      setError("Please fill in all fields");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (!avatar) {
      setError("Profile photo (avatar) is required");
      return;
    }
    if (usernameStatus === "taken") {
      setError("Username is already taken");
      return;
    }
    setLoading(true);
    try {
      const formData = {
        fullName: fullName.trim(),
        email: email.trim(),
        username: username.trim(),
        password,
        avatar,
      };

      console.log("formData", formData);
      const res = await api.post("/users/register", formData, {
        headers: {
          "Content-Type": "multipart/form-data", // This header is important for file upload
        },
      });
      console.log("res", res);
      const userData = res?.data?.data?.user ?? res?.data?.user ?? res?.data?.data;
      dispatch(setUser(userData));
      navigate("/");
    } catch (err) {
      setError(err.message || "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Create account</h1>
        <p className="auth-subtitle">Sign up to get started</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          {error && <div className="auth-error">{error}</div>}
          <div className="auth-field auth-field-file">
            <label className="auth-file-label">
              <span>Profile photo (required)</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  console.log("e", e.target);
                  console.log("e.target.files", e.target.files);
                  setAvatar(e.target.files?.[0] || null);
                }}
                className="auth-file-input"
              />
            </label>
          </div>
          <div className="auth-field">
            <input
              type="text"
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
              className="auth-input"
            />
          </div>
          <div className="auth-field">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="auth-input"
            />
          </div>
          <div className="auth-field">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              className={`auth-input ${usernameStatus === "taken" ? "auth-input-error" : ""} ${usernameStatus === "available" ? "auth-input-success" : ""}`}
            />
            {usernameStatus === "available" && (
              <span className="auth-username-msg auth-username-available">
                Username is available
              </span>
            )}
            {usernameStatus === "taken" && (
              <span className="auth-username-msg auth-username-taken">
                Username already taken
              </span>
            )}
            {usernameStatus === "checking" &&
              // <span className="auth-username-msg auth-username-checking">Checking...</span>
              null}
          </div>
          <div className="auth-field">
            <input
              type="password"
              placeholder="Password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              className="auth-input"
            />
          </div>
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

export default SignupPage;
