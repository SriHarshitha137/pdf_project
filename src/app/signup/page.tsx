"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function SignUpPage() {
  const router = useRouter();
  const { register, login } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; agree?: string }>({});
  const [shake, setShake] = useState(false);
  const [serverError, setServerError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function clearError(field: string) {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setServerError("");
    const newErrors: { name?: string; email?: string; password?: string; agree?: string } = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!isValidEmail(email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!agree) {
      newErrors.agree = "You must agree to the terms";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    try {
      await register(email, password);
      // Auto-login after successful registration
      await login(email, password);
      router.push("/");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail || "Registration failed. Please try again.";
      setServerError(msg);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="signin-page">
      {/* Left — decorative panel */}
      <div className="signin-panel">
        <div className="signin-panel-content">
          <div className="signin-panel-badge">
            <span className="signin-panel-badge-dot" />
            FREE TO GET STARTED
          </div>
          <h2 className="signin-panel-heading">
            Start editing<br />
            <span className="serif">in seconds</span><span className="signin-period">.</span>
          </h2>
          <p className="signin-panel-sub">
            Create your free account and unlock 22+ professional PDF tools — no credit card required.
          </p>

          {/* Feature checklist */}
          <div className="signup-features">
            {[
              { icon: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z", label: "22+ PDF tools included" },
              { icon: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10", label: "256-bit SSL encryption" },
              { icon: "M13 2L3 14h9l-1 8 10-12h-9l1-8z", label: "Instant cloud processing" },
              { icon: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 3a4 4 0 100 8 4 4 0 000-8z", label: "No credit card needed" },
            ].map((f) => (
              <div key={f.label} className="signup-feature-row">
                <div className="signup-feature-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    {f.icon.split("M").filter(Boolean).map((seg, i) => (
                      <path key={i} d={`M${seg}`} />
                    ))}
                  </svg>
                </div>
                <span>{f.label}</span>
              </div>
            ))}
          </div>

          {/* Testimonial strip */}
          <div className="signin-testimonial">
            <div className="signin-testimonial-avatars">
              {["S", "K", "P"].map((letter, i) => (
                <div key={i} className="signin-avatar" style={{ zIndex: 3 - i, marginLeft: i === 0 ? 0 : -8 }}>
                  {letter}
                </div>
              ))}
            </div>
            <div className="signin-testimonial-text">
              <span className="signin-stars">★★★★★</span>
              <span>Join 50M+ happy users</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right — sign-up form */}
      <div className="signin-form-side">
        <div className="signin-form-wrapper">
          <div className="signin-form-header">
            <h1 className="signin-title">Create your account</h1>
            <p className="signin-subtitle">Get started with PDFKit Pro for free</p>
          </div>

          {/* Social sign-up */}
          <div className="signin-socials">
            <button suppressHydrationWarning className="signin-social-btn" id="signup-google">
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign up with Google
            </button>
            <button suppressHydrationWarning className="signin-social-btn" id="signup-apple">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              Sign up with Apple
            </button>
          </div>

          <div className="signin-divider">
            <span>or sign up with email</span>
          </div>

          {/* Form */}
          <form className={`signin-form${shake ? " form-shake" : ""}`} onSubmit={handleSubmit} noValidate>
            <div className={`signin-field${errors.name ? " has-error" : ""}`}>
              <label htmlFor="signup-name" className="signin-label">Full name</label>
              <div className="signin-input-wrap">
                <svg className="signin-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <input suppressHydrationWarning
                  id="signup-name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => { setName(e.target.value); if (errors.name) clearError("name"); }}
                  autoComplete="name"
                />
              </div>
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>

            <div className={`signin-field${errors.email ? " has-error" : ""}`}>
              <label htmlFor="signup-email" className="signin-label">Email address</label>
              <div className="signin-input-wrap">
                <svg className="signin-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <path d="M22 6l-10 7L2 6" />
                </svg>
                <input suppressHydrationWarning
                  id="signup-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (errors.email) clearError("email"); }}
                  autoComplete="email"
                />
              </div>
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <div className={`signin-field${errors.password ? " has-error" : ""}`}>
              <label htmlFor="signup-password" className="signin-label">Password</label>
              <div className="signin-input-wrap">
                <svg className="signin-input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                <input suppressHydrationWarning
                  id="signup-password"
                  type={showPw ? "text" : "password"}
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (errors.password) clearError("password"); }}
                  autoComplete="new-password"
                />
                <button suppressHydrationWarning
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
              <div className="password-strength">
                <div className={`password-bar${password.length >= 8 ? " strong" : password.length >= 4 ? " medium" : ""}`} />
                <span className="password-hint">
                  {password.length === 0 ? "" : password.length < 4 ? "Too short" : password.length < 8 ? "Almost there" : "Strong password"}
                </span>
              </div>
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>

            {/* Terms agreement */}
            <div className={`signin-remember${errors.agree ? " has-error-inline" : ""}`} onClick={() => { setAgree((v) => !v); if (errors.agree) clearError("agree"); }}>
              <div className={`checkbox-box${agree ? " checked" : ""}${errors.agree ? " checkbox-error" : ""}`}>
                {agree && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--bg)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
              </div>
              <span className="signin-remember-label">
                I agree to the{" "}
                <Link href="/about" className="signin-link-muted" onClick={(e) => e.stopPropagation()}>Terms</Link> &{" "}
                <Link href="/about" className="signin-link-muted" onClick={(e) => e.stopPropagation()}>Privacy Policy</Link>
              </span>
            </div>
            {errors.agree && <span className="field-error" style={{ marginTop: -10 }}>{errors.agree}</span>}

            {serverError && (
              <div style={{ color: "var(--danger, #e53e3e)", fontSize: 13, marginBottom: 10, textAlign: "center" }}>
                {serverError}
              </div>
            )}
            <button suppressHydrationWarning type="submit" className="btn btn-dark btn-block signin-submit" id="signup-submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating account…" : "Create account"}
              {!isSubmitting && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              )}
            </button>
          </form>

          <p className="signin-footer-text">
            Already have an account?{" "}
            <Link href="/signin" className="signin-link">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
