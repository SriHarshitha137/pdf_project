"use client";
import { useState } from "react";
import Link from "next/link";
import { useTheme } from "./ThemeProvider";
import Icon from "./Icon";
import { icons, tools } from "@/lib/data";

const SunIcon = () => (
  <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const MoonIcon = () => (
  <svg width={9} height={9} viewBox="0 0 24 24" fill="currentColor" stroke="none">
    <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
  </svg>
);

export default function Navbar() {
  const [toolsOpen, setToolsOpen] = useState(false);
  const { theme, toggle } = useTheme();

  return (
    <nav className="nav">
      <div className="container">
        <div className="nav-inner">
          <Link href="/" className="logo">
            <div className="logo-icon">PK</div>
            <span className="logo-text">PDF<span>KIT</span></span>
          </Link>

          <div className="nav-links" style={{ position: "relative" }}>
            <div style={{ position: "relative" }}>
              <button
                className={`nav-link${toolsOpen ? " active" : ""}`}
                onClick={() => setToolsOpen((o) => !o)}
              >
                Tools <Icon d={icons.chevronDown} size={13} />
              </button>

              {toolsOpen && (
                <div className="mega-dropdown">
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--accent)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 14, paddingBottom: 12, borderBottom: "1px solid var(--border)" }}>
                    // All PDF Tools ({tools.length})
                  </div>
                  <div className="mega-dropdown-grid">
                    {tools.map((t) => (
                      <Link key={t.id} href={`/tools/${t.id}`} className="mega-item" onClick={() => setToolsOpen(false)}>
                        <div style={{ width: 32, height: 32, borderRadius: 4, background: t.color + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke={t.color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                            {Array.isArray(t.icon) ? t.icon.map((p, j) => <path key={j} d={p} />) : <path d={t.icon} />}
                          </svg>
                        </div>
                        <div>
                          <div className="mega-item-label">{t.label}</div>
                          <div className="mega-item-desc">{t.desc}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <Link href="/pricing" className="nav-link">Pricing</Link>
            <Link href="/about" className="nav-link">About</Link>
          </div>

          <div className="nav-actions">
            {/* Theme toggle */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="theme-label">{theme === "dark" ? "Dark" : "Light"}</span>
              <button
                className="theme-toggle"
                onClick={toggle}
                aria-label="Toggle theme"
                title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              >
                <div className="theme-toggle-knob">
                  <span className="theme-toggle-icon">
                    {theme === "dark" ? <MoonIcon /> : <SunIcon />}
                  </span>
                </div>
              </button>
            </div>

            <button className="btn btn-ghost btn-sm">Sign in</button>
            <button className="btn btn-primary btn-sm">Get Started</button>
          </div>
        </div>
      </div>

      {toolsOpen && (
        <div onClick={() => setToolsOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 100 }} />
      )}
    </nav>
  );
}
