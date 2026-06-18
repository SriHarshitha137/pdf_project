"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTheme } from "./ThemeProvider";
import { useAuth } from "@/lib/AuthContext";
import { tools } from "@/lib/data";

function NavIcon({ d, size = 14 }: { d: string | string[]; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
    </svg>
  );
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showMoreTools, setShowMoreTools] = useState(false);
  const toolsMenuRef = useRef<HTMLDivElement>(null);
  const { theme, toggle } = useTheme();
  const { isAuthenticated, logout, user } = useAuth();
  const visibleTools = showMoreTools ? tools : tools.slice(0, 18);

  const closeMenu = () => {
    setMenuOpen(false);
    setShowMoreTools(false);
  };

  useEffect(() => {
    if (!menuOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!toolsMenuRef.current?.contains(event.target as Node)) {
        closeMenu();
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [menuOpen]);

  return (
    <nav className="nav">
      <div className="container">
        <div className="nav-inner">
          <Link href="/" className="logo">
            <div className="logo-mark">PK</div>
            <span className="logo-name">PDFKIT</span>
          </Link>

          <div className="nav-links" style={{ position: "relative" }}>
            <div ref={toolsMenuRef} style={{ position: "relative" }}>
              <button suppressHydrationWarning
                className={`nav-link${menuOpen ? " active" : ""}`}
                onClick={() => {
                  setMenuOpen((open) => {
                    if (open) setShowMoreTools(false);
                    return !open;
                  });
                }}
              >
                Tools
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {menuOpen && (
                <div className="mega-menu">
                  <div style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
                    All Tools
                  </div>
                  <div className="mega-menu-grid">
                    {visibleTools.map((t) => (
                      <Link key={t.id} href={`/tools/${t.id}`} className="mega-item" onClick={closeMenu}>
                        <div className="mega-icon" style={{ background: t.color + "15" }}>
                          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={t.color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                            {Array.isArray(t.icon) ? t.icon.map((p, j) => <path key={j} d={p} />) : <path d={t.icon} />}
                          </svg>
                        </div>
                        <div>
                          <div className="mega-name">{t.label}</div>
                          <div className="mega-desc">{t.desc}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  {!showMoreTools && tools.length > visibleTools.length && (
                    <button suppressHydrationWarning className="mega-view-more" onClick={() => setShowMoreTools(true)}>
                      View More Tools
                      <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </button>
                  )}
                </div>
              )}
            </div>
            <Link href="/" className="nav-link">Solutions</Link>
            <Link href="/pricing" className="nav-link">Pricing</Link>
            <Link href="/about" className="nav-link">Resources</Link>
            <Link href="/about" className="nav-link">API</Link>
          </div>

          <div className="nav-actions">
            {/* Theme toggle */}
            <button suppressHydrationWarning className="theme-toggle" onClick={toggle} aria-label="Toggle theme">
              <span className="theme-toggle-icon">
                {theme === "dark" ? (
                  <svg width={13} height={13} viewBox="0 0 24 24" fill="currentColor" stroke="none">
                    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                  </svg>
                ) : (
                  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                  </svg>
                )}
              </span>
              {theme === "dark" ? "Light" : "Dark"}
            </button>

            {isAuthenticated ? (
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 500 }}>
                  {user?.email}
                </span>
                <button suppressHydrationWarning onClick={logout} className="btn btn-ghost btn-sm">
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link href="/signin" className="btn btn-ghost btn-sm">Sign in</Link>
                <Link href="/signup" className="btn btn-dark btn-sm">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </div>

      {menuOpen && (
        <div onClick={closeMenu} style={{ position: "fixed", inset: 0, zIndex: 300 }} />
      )}
    </nav>
  );
}
