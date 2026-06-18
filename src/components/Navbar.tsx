"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useTheme } from "./ThemeProvider";
import { tools } from "@/lib/data";

function NavIcon({ d, size = 14 }: { d: string | string[]; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
    </svg>
  );
}

const sidebarCats = [
  { id: "all", label: "All Tools" },
  { id: "Merge & Split", label: "Merge & Split" },
  { id: "Convert", label: "Convert" },
  { id: "Edit & Sign", label: "Edit & Sign" },
  { id: "Compress", label: "Compress" },
  { id: "Protect", label: "Protect" },
  { id: "OCR", label: "OCR" },
  { id: "Organize", label: "Organize" },
  { id: "AI", label: "AI Tools" },
  { id: "Utilities", label: "Utilities" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showMoreTools, setShowMoreTools] = useState(false);
  const toolsMenuRef = useRef<HTMLDivElement>(null);
  const { theme, toggle } = useTheme();
  const visibleTools = showMoreTools ? tools : tools.slice(0, 18);

  const closeMenu = () => {
    setMenuOpen(false);
    setShowMoreTools(false);
  };

  const closeMobile = () => setMobileOpen(false);

  // Close desktop mega menu on outside click
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

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <nav className="nav">
      <div className="container">
        <div className="nav-inner">
          <Link href="/" className="logo" onClick={closeMobile}>
            <div className="logo-mark">PK</div>
            <span className="logo-name">PDFKIT</span>
          </Link>

          {/* Desktop nav links */}
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
            <Link href="/about" className="nav-link">Resources</Link>
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
              <span>{theme === "dark" ? "Light" : "Dark"}</span>
            </button>

            {/* Mobile hamburger */}
            <button
              suppressHydrationWarning
              className="nav-mobile-toggle"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              {mobileOpen ? (
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              ) : (
                <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop mega menu overlay */}
      {menuOpen && (
        <div onClick={closeMenu} style={{ position: "fixed", inset: 0, zIndex: 300 }} />
      )}

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="nav-mobile-drawer">
          {/* Main links */}
          <div className="nav-mobile-section-label" style={{ borderTop: "none", marginTop: 0, paddingTop: 0 }}>Navigation</div>
          <Link href="/" className="nav-mobile-link" onClick={closeMobile}>
            <NavIcon d={["M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z", "M9 22V12h6v10"]} size={16} />
            Home
          </Link>
          <Link href="/about" className="nav-mobile-link" onClick={closeMobile}>
            <NavIcon d={["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"]} size={16} />
            Resources
          </Link>

          {/* All tools */}
          <div className="nav-mobile-section-label">PDF Tools</div>
          <div className="nav-mobile-tools-grid">
            {tools.map((t) => (
              <Link key={t.id} href={`/tools/${t.id}`} className="nav-mobile-tool-item" onClick={closeMobile}>
                <div className="nav-mobile-tool-icon" style={{ background: t.color + "18" }}>
                  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke={t.color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                    {Array.isArray(t.icon) ? t.icon.map((p, j) => <path key={j} d={p} />) : <path d={t.icon} />}
                  </svg>
                </div>
                <span style={{ fontSize: 12.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{t.label}</span>
              </Link>
            ))}
          </div>

          {/* Account links */}
          <div className="nav-mobile-section-label">Account</div>
          <Link href="/signin" className="nav-mobile-link" onClick={closeMobile}>
            <NavIcon d={["M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2", "M12 3a4 4 0 100 8 4 4 0 000-8z"]} size={16} />
            Sign In
          </Link>
          <Link href="/signup" className="nav-mobile-link" onClick={closeMobile}>
            <NavIcon d={["M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2", "M9 7a4 4 0 100 8 4 4 0 000-8z", "M22 21v-2a4 4 0 00-3-3.87", "M16 3.13a4 4 0 010 7.75"]} size={16} />
            Sign Up
          </Link>
        </div>
      )}
    </nav>
  );
}
