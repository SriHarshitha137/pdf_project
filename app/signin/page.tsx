"use client";
import { useState } from "react";
import Link from "next/link";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [shake, setShake] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!isValidEmail(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setErrors({});
    // TODO: handle actual sign-in
  }

  return (
    <div className="signin-page">
      {/* Left — decorative panel */}
      <div className="signin-panel">
        <div className="signin-panel-content">
          <div className="signin-panel-badge">
            <span className="signin-panel-badge-dot" />
            TRUSTED BY 50M+ USERS
          </div>
          <h2 className="signin-panel-heading">
            Your PDFs,<br />
            <span className="serif">your workspace</span><span className="signin-period">.</span>
          </h2>
          <p className="signin-panel-sub">
            Sign in to access your files, saved presets, and premium tools — all in one place.
          </p>

          {/* Decorative shapes */}
          <div className="signin-panel-art">
            <svg width="280" height="220" viewBox="0 0 280 220" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="90" cy="110" r="70" fill="var(--accent-2)" opacity="0.25" />
              <rect x="140" y="40" width="100" height="130" rx="4" fill="var(--signin-card)" stroke="var(--signin-card-border)" strokeWidth="1.2" />
              <path d="M140 40h100l-20 20H140z" fill="var(--signin-card-shadow)" />
              <line x1="154" y1="80" x2="226" y2="80" stroke="var(--signin-line)" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="154" y1="96" x2="210" y2="96" stroke="var(--signin-line)" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="154" y1="112" x2="220" y2="112" stroke="var(--signin-line)" strokeWidth="1.5" strokeLinecap="round" />
              <line x1="154" y1="128" x2="196" y2="128" stroke="var(--signin-line)" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="210" cy="145" r="14" fill="var(--accent-2)" opacity="0.9" />
              <path d="M204 145l4 4 8-8" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="60" cy="40" r="4" fill="var(--accent-2)" opacity="0.4" />
              <circle cx="260" cy="190" r="3" fill="var(--accent-2)" opacity="0.3" />
              <circle cx="30" cy="180" r="5" fill="var(--accent-2)" opacity="0.2" />
            </svg>
          </div>

          {/* Testimonial strip */}
          <div className="signin-testimonial">
            <div className="signin-testimonial-avatars">
              {["A", "M", "R"].map((letter, i) => (
                <div key={i} className="signin-avatar" style={{ zIndex: 3 - i, marginLeft: i === 0 ? 0 : -8 }}>
                  {letter}
                </div>
              ))}
            </div>
            <div className="signin-testimonial-text">
              <span className="signin-stars">★★★★★</span>
              <span>&ldquo;Best PDF toolkit I&rsquo;ve used.&rdquo;</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right — sign-in form */}
      <div className="signin-form-side">
        <div className="signin-form-wrapper">
          <div className="signin-form-header">
            <h1 className="signin-title">Welcome back</h1>
            <p className="signin-subtitle">Sign in to your PDFKit Pro account</p>
          </div>

          {/* Social sign-in */}
          <div className="signin-socials">
            <button className="signin-social-btn" id="signin-google">
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </button>
            <button className="signin-social-btn" id="signin-apple">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              Continue with Apple
            </button>
          </div>

          <div className="signin-divider">
            <span>or sign in with email</span>
          </div>

          {/* Email / password form */}
          <form className={`signin-form${shake ? " form-shake" : ""}`} onSubmit={handleSubmit} noValidate>
            <div className={`signin-field${errors.email ? " has-error" : ""}`}>
              <label htmlFor="signin-email" className="signin-label">Email address</label>
              <div className="signin-input-wrap">
                <svg className="signin-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <path d="M22 6l-10 7L2 6" />
                </svg>
                <input
                  id="signin-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors((prev) => ({ ...prev, email: undefined })); }}
                  autoComplete="email"
                />
              </div>
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <div className={`signin-field${errors.password ? " has-error" : ""}`}>
              <div className="signin-label-row">
                <label htmlFor="signin-password" className="signin-label">Password</label>
                <Link href="/signin" className="signin-forgot">Forgot password?</Link>
              </div>
              <div className="signin-input-wrap">
                <svg className="signin-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                <input
                  id="signin-password"
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors((prev) => ({ ...prev, password: undefined })); }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="signin-pw-toggle"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>

            {/* Remember me */}
            <div className="signin-remember" onClick={() => setRemember((v) => !v)}>
              <div className={`checkbox-box${remember ? " checked" : ""}`}>
                {remember && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--bg)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
              </div>
              <span className="signin-remember-label">Remember me for 30 days</span>
            </div>

            <button type="submit" className="btn btn-dark btn-block signin-submit" id="signin-submit">
              Sign in
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </form>

          <p className="signin-footer-text">
            Don&rsquo;t have an account?{" "}
            <Link href="/signup" className="signin-link">Create one for free</Link>
          </p>

          <p className="signin-legal">
            By signing in, you agree to our{" "}
            <Link href="/about" className="signin-link-muted">Terms of Service</Link> and{" "}
            <Link href="/about" className="signin-link-muted">Privacy Policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
