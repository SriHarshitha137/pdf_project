"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon from "./Icon";
import { icons, tools } from "@/lib/data";

export default function Navbar() {
  const [toolsOpen, setToolsOpen] = useState(false);
  const router = useRouter();

  return (
    <nav className="nav">
      <div className="container">
        <div className="nav-inner">
          <Link href="/" className="logo">
            <div className="logo-icon">PK</div>
            <span className="logo-text">PDFKit<span> Pro</span></span>
          </Link>

          <div className="nav-links">
            <div style={{ position: "relative" }}>
              <button
                className={`nav-link${toolsOpen ? " active" : ""}`}
                onClick={() => setToolsOpen((o) => !o)}
              >
                Tools <Icon d={icons.chevronDown} size={14} />
              </button>
              {toolsOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    left: 0,
                    width: 560,
                    background: "white",
                    border: "1.5px solid var(--border)",
                    borderRadius: 12,
                    padding: 20,
                    boxShadow: "var(--shadow-lg)",
                    zIndex: 200,
                  }}
                >
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    {tools.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => { router.push(`/tools/${t.id}`); setToolsOpen(false); }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "10px 12px",
                          borderRadius: 8,
                          cursor: "pointer",
                          transition: "background .15s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 7,
                            background: t.color + "18",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <svg
                            width={16}
                            height={16}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke={t.color}
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            {Array.isArray(t.icon)
                              ? t.icon.map((p, i) => <path key={i} d={p} />)
                              : <path d={t.icon} />}
                          </svg>
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>{t.label}</div>
                          <div style={{ fontSize: 11, color: "var(--muted)" }}>{t.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <Link href="/pricing" className="nav-link">Pricing</Link>
            <Link href="/about" className="nav-link">About</Link>
          </div>

          <div className="nav-actions">
            <button className="btn btn-ghost btn-sm">
              <Icon d={icons.search} size={16} />
            </button>
            <button className="btn btn-secondary btn-sm">Sign in</button>
            <button className="btn btn-primary btn-sm">Get Started</button>
          </div>
        </div>
      </div>
      {toolsOpen && (
        <div
          onClick={() => setToolsOpen(false)}
          style={{ position: "fixed", inset: 0, zIndex: 100 }}
        />
      )}
    </nav>
  );
}
