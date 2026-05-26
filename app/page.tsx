"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ToolCard from "@/components/ToolCard";
import { tools, categories } from "@/lib/data";

function SIcon({ d, size = 16 }: { d: string | string[]; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
    </svg>
  );
}

const sidebarCats = [
  { id: "all", label: "All Tools", icon: ["M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"] },
  { id: "Merge & Split", label: "Merge & Split", icon: ["M8 3H5a2 2 0 00-2 2v3", "M21 8V5a2 2 0 00-2-2h-3", "M3 16v3a2 2 0 002 2h3", "M16 21h3a2 2 0 002-2v-3", "M12 8v8", "M8 12h8"] },
  { id: "Convert", label: "Convert", icon: ["M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z", "M14 2v6h6"] },
  { id: "Edit & Sign", label: "Edit & Sign", icon: ["M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7", "M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"] },
  { id: "Compress", label: "Compress", icon: ["M4 14h6v6", "M20 10h-6V4", "M14 10l7-7", "M3 21l7-7"] },
  { id: "Protect", label: "Protect", icon: ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"] },
  { id: "OCR", label: "OCR", icon: ["M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4", "M10 17l5-5-5-5", "M13.8 12H3"] },
  { id: "Organize", label: "Organize", icon: ["M8 6h13", "M8 12h13", "M8 18h13", "M3 6h.01", "M3 12h.01", "M3 18h.01"] },
  { id: "AI", label: "AI Tools", icon: ["M12 2a10 10 0 110 20A10 10 0 0112 2z", "M12 8v4l3 3"] },
];

export default function HomePage() {
  const [activeCat, setActiveCat] = useState("all");
  const [search, setSearch] = useState("");
  const router = useRouter();

  const filtered = tools.filter((t) => {
    const catOk = activeCat === "all" || t.category === activeCat;
    const q = search.toLowerCase();
    const searchOk = !q || t.label.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q);
    return catOk && searchOk;
  });

  return (
    <main>
      {/* Hero */}
      <div className="container">
        <div className="hero">
          <div>
            <div className="hero-eyebrow">
              <span className="hero-eyebrow-dot" />
              Simple. Powerful. Private.
            </div>
            <h1>
              PDF tools<br />
              <span className="serif">that just work</span><span className="period">.</span>
            </h1>
            <p className="hero-sub">
              Everything you need to edit, convert, protect and manage PDFs — in one clean workspace.
            </p>
            <div className="hero-btns">
              <Link href="/tools/merge" className="btn btn-dark btn-xl btn-arrow">
                Explore All Tools
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </Link>
              <Link href="/pricing" className="btn btn-outline btn-xl">
                View Pricing
              </Link>
            </div>
          </div>

          {/* Illustration */}
          <div className="hero-illustration">
            <div className="illus-page" />
            <div className="illus-circle" />
            <div className="illus-square" />
            <div className="illus-star">✳</div>
            <div className="illus-line" />
            <div className="illus-curve" />
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="stats-bar">
        {[
          { icon: ["M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z","M14 2v6h6"], num: "50M+", label: "Files processed" },
          { icon: ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"], num: "256-BIT", label: "SSL security" },
          { icon: ["M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2","M23 21v-2a4 4 0 00-3-3.87","M16 3.13a4 4 0 010 7.75","M9 7a4 4 0 100 8 4 4 0 000-8z"], num: "4.9★", label: "User rating" },
          { icon: ["M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"], num: "12+", label: "PDF tools" },
        ].map(({ icon, num, label }) => (
          <div key={label} className="stat-cell">
            <div className="stat-icon"><SIcon d={icon} size={20} /></div>
            <div className="stat-info">
              <div className="stat-num">{num}</div>
              <div className="stat-label">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tools section — sidebar + grid */}
      <div className="container">
        <div className="home-tools-section">
          <div className="home-tools-inner">
            {/* Left sidebar */}
            <div className="home-tools-sidebar">
              {sidebarCats.map((c) => (
                <button
                  key={c.id}
                  className={`home-sidebar-link${activeCat === c.id ? " active" : ""}`}
                  onClick={() => setActiveCat(c.id)}
                >
                  <SIcon d={c.icon} size={15} />
                  {c.label}
                </button>
              ))}

              <div className="sidebar-download" style={{ marginTop: 24 }}>
                <div className="sidebar-download-title">Work faster.</div>
                <div className="sidebar-download-desc">Install our desktop app for offline productivity.</div>
                <button className="btn btn-dark btn-sm" style={{ width: "100%", justifyContent: "center" }}>
                  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><path d="M7 10l5 5 5-5" /><path d="M12 15V3" /></svg>
                  Download App
                </button>
              </div>
            </div>

            {/* Tools grid */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div>
                  <div className="tools-section-num">01</div>
                  <h2 className="tools-section-title">All PDF Tools</h2>
                </div>
                <div className="tools-search">
                  <span className="tools-search-icon">
                    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
                  </span>
                  <input
                    placeholder="Search tools..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="home-tools-grid">
                {filtered.map((t, i) => (
                  <ToolCard key={t.id} tool={t} index={i} />
                ))}
                {filtered.length === 0 && (
                  <div style={{ gridColumn: "1/-1", padding: "60px 0", textAlign: "center", color: "var(--muted)", fontSize: 14 }}>
                    No tools found for "{search}"
                  </div>
                )}
              </div>

              {filtered.length > 0 && (
                <div style={{ marginTop: 20, textAlign: "center" }}>
                  <button className="btn btn-outline btn-arrow" onClick={() => router.push("/tools/merge")}>
                    View All Tools
                    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features strip */}
      <div className="container" style={{ paddingTop: 60 }}>
        <div className="features-strip">
          <div className="features-strip-inner">
            {[
              { icon: ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"], title: "Private & Secure", desc: "Your files are never stored after processing." },
              { icon: ["M13 2L3 14h9l-1 8 10-12h-9l1-8z"], title: "Blazing Fast", desc: "Powerful servers for instant results." },
              { icon: ["M12 2a10 10 0 110 20A10 10 0 0112 2z","M2 12h20","M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"], title: "Works Anywhere", desc: "Any device, any browser, anytime." },
              { icon: ["M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2","M12 3a4 4 0 100 8 4 4 0 000-8z"], title: "No Sign-up", desc: "Use all tools instantly without creating account." },
            ].map((f) => (
              <div key={f.title} className="feat-cell">
                <div className="feat-cell-icon"><SIcon d={f.icon} size={22} /></div>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
