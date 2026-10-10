
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Authentication.css";

const API_BASE = "http://localhost:5000";

export default function Authentication({ initialMode = "login" }) {
  const navigate = useNavigate();
  const location = useLocation();

  const queryToken = new URLSearchParams(location.search).get("token");

  const [mode, setMode] = useState(
    initialMode === "reset" && !queryToken ? "forgot" : initialMode
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [token, setToken] = useState(queryToken || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [resetUrl, setResetUrl] = useState("");

  useEffect(() => {
    const nextMode =
      initialMode === "reset" && !queryToken
        ? "forgot"
        : initialMode;

    setMode(nextMode);
    setToken(queryToken || "");
    setError("");
    setMessage("");
  }, [initialMode, queryToken]);

  function changeMode(nextMode) {
    setMode(nextMode);
    setError("");
    setMessage("");
    setResetUrl("");
    setPassword("");
    setConfirmPassword("");

    if (nextMode === "login") {
      navigate("/login", { replace: true });
    } else if (nextMode === "register") {
      navigate("/register", { replace: true });
    } else if (nextMode === "forgot") {
      navigate("/forgot-password", { replace: true });
    }
  }

  async function submitLogin(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not log in.");
      }

      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function submitRegister(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!name.trim() || !email.trim() || !password) {
      setError("Please complete all fields.");
      return;
    }

    if (password.length < 8) {
      setError("Your password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE}/api/register`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not create your account.");
      }

      navigate("/preferences", {
        replace: true,
        state: { newUser: true },
      });
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function submitForgotPassword(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setResetUrl("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE}/api/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not start password reset.");
      }

      setMessage(data.message || "If the account exists, reset instructions are ready.");
      if (data.reset_url) {
        setResetUrl(data.reset_url);
      }
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function submitResetPassword(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (!token.trim()) {
      setError("The reset token is missing. Please request a new reset link.");
      return;
    }

    if (password.length < 8) {
      setError("Your new password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_BASE}/api/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Could not reset your password.");
      }

      setMessage(data.message || "Your password has been reset. You can now log in.");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const isLogin = mode === "login";
  const isRegister = mode === "register";
  const isForgot = mode === "forgot";
  const isReset = mode === "reset";

  const heading = isLogin
    ? "Welcome back"
    : isRegister
      ? "Create your account"
      : isForgot
        ? "Forgot your password?"
        : "Choose a new password";

  const description = isLogin
    ? "Log in to continue your wellbeing journey."
    : isRegister
      ? "Create an account for your personal wellness space."
      : isForgot
        ? "Enter the email address associated with your account."
        : "Set a new password for your PsyTech account.";

  return (
    <div className="auth-page">
      <div className="auth-decoration auth-decoration-pink" />
      <div className="auth-decoration auth-decoration-green" />
      <div className="auth-decoration auth-decoration-blue" />

      <header className="auth-topbar">
        <Link to="/" className="auth-brand">
          <span className="auth-brand-mark">P</span>
          <span>PsyTech</span>
        </Link>

        <button
          type="button"
          className="auth-back-button"
          onClick={() => navigate("/")}
        >
          ← Back to home
        </button>
      </header>

      <main className="auth-content">
        <section className="auth-intro">
          <h1>Your space to pause, reflect, and grow.</h1>
          <p>
            A calm place for mood tracking, journaling, guided wellness
            activities, and everyday self-reflection.
          </p>
        </section>

        <section className="auth-card">
          {(isLogin || isRegister) && (
            <div className="auth-tabs">
              <button
                type="button"
                className={isLogin ? "active" : ""}
                onClick={() => changeMode("login")}
              >
                Log in
              </button>
              <button
                type="button"
                className={isRegister ? "active" : ""}
                onClick={() => changeMode("register")}
              >
                Create account
              </button>
            </div>
          )}

          <div className="auth-card-heading">
            <h2>{heading}</h2>
            <p>{description}</p>
          </div>

          {error && (
            <div className="auth-message auth-error" role="alert">
              {error}
            </div>
          )}

          {message && (
            <div className="auth-message auth-success" role="status">
              {message}
              {resetUrl && (
                <>
                  <br />
                  <a href={resetUrl}>Open demo password reset link</a>
                </>
              )}
            </div>
          )}

          {isLogin && (
            <form className="auth-form" onSubmit={submitLogin}>
              <label>
                <span>Email address</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </label>

              <label>
                <span>Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
              </label>

              <div className="auth-forgot-wrapper">
                <button
                  type="button"
                  className="auth-forgot-link"
                  onClick={() => changeMode("forgot")}
                >
                  Forgot password?
                </button>
              </div>

              <button className="auth-submit" type="submit" disabled={loading}>
                {loading ? "Logging in..." : "Log in"}
              </button>
            </form>
          )}

          {isRegister && (
            <form className="auth-form" onSubmit={submitRegister}>
              <label>
                <span>Full name</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  autoComplete="name"
                  required
                />
              </label>

              <label>
                <span>Email address</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </label>

              <label>
                <span>Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </label>

              <label>
                <span>Confirm password</span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Enter your password again"
                  autoComplete="new-password"
                  required
                />
              </label>

              <button className="auth-submit" type="submit" disabled={loading}>
                {loading ? "Creating account..." : "Create account"}
              </button>
            </form>
          )}

          {isForgot && (
            <form className="auth-form" onSubmit={submitForgotPassword}>
              <label>
                <span>Email address</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </label>

              <button className="auth-submit" type="submit" disabled={loading}>
                {loading ? "Preparing link..." : "Get reset link"}
              </button>
            </form>
          )}

          {isReset && (
            <form className="auth-form" onSubmit={submitResetPassword}>
              <label>
                <span>New password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </label>

              <label>
                <span>Confirm new password</span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Enter your new password again"
                  autoComplete="new-password"
                  required
                />
              </label>

              <button className="auth-submit" type="submit" disabled={loading}>
                {loading ? "Resetting password..." : "Reset password"}
              </button>
            </form>
          )}

          <p className="auth-note">
            {isLogin ? (
              <>
                New to PsyTech?{" "}
                <button
                  type="button"
                  className="auth-forgot-link"
                  onClick={() => changeMode("register")}
                >
                  Create an account
                </button>
              </>
            ) : isRegister ? (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  className="auth-forgot-link"
                  onClick={() => changeMode("login")}
                >
                  Log in
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className="auth-forgot-link"
                  onClick={() => changeMode("login")}
                >
                  Back to log in
                </button>
                {isReset && (
                  <>
                    {" · "}
                    <button
                      type="button"
                      className="auth-forgot-link"
                      onClick={() => changeMode("forgot")}
                    >
                      Request another link
                    </button>
                  </>
                )}
              </>
            )}
          </p>
        </section>
      </main>
    </div>
  );
}