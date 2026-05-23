"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";
import ToolCard from "@/components/ToolCard";
import { icons, tools, categories } from "@/lib/data";

const marqueeItems = [
  "Merge PDF","Split PDF","Compress PDF","PDF to JPG","JPG to PDF",
  "Rotate PDF","Watermark","Unlock PDF","Protect PDF","OCR","AI Summarize","Organize Pages",
];

export default function HomePage() {
  const [activeCat, setActiveCat] = useState("All Tools");
  const [search, setSearch] = useState("");
  const router = useRouter();

  const filtered = tools.filter((t) => {
    const catOk = activeCat === "All Tools" || t.category === activeCat;
    const searchOk =
      !search ||
      t.label.toLowerCase().includes(search.toLowerCase()) ||
      t.desc.toLowerCase().includes(search.toLowerCase());
    return catOk && searchOk;
  });

  return (
    <main>
      {/* Hero */}
      <section className="hero">
        <div className="hero-grid-bg" />
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div className="hero-eyebrow">
            <span className="hero-eyebrow-dot">
              <Icon d={icons.zap} size={10} fill="currentColor" stroke="none" />
            </span>
            100% Free · No Sign-up
          </div>
          <h1>
            EVERY PDF
            <em>TOOL.</em>
          </h1>
          <p className="hero-sub">
            Merge, split, compress, convert, OCR, watermark, and protect your PDFs.
            Fast, secure, and browser-based.
          </p>
          <div className="hero-cta-row">
            <button className="btn btn-primary btn-xl" onClick={() => router.push("/tools/merge")}>
              Start for Free
            </button>
            <button className="btn btn-ghost btn-xl" onClick={() => router.push("/pricing")}>
              View Pricing
            </button>
          </div>
          <div className="hero-meta">
            <span>256-bit SSL encryption</span>
            <span>Files deleted after processing</span>
            <span>12+ PDF tools</span>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <div className="marquee-wrap">
        <div className="marquee-track">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <div key={i} className="marquee-item">
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <path d="M14 2v6h6" />
              </svg>
              {item}
              {i < marqueeItems.length * 2 - 1 && <span className="marquee-sep" />}
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="container" style={{ paddingTop: 80 }}>
        <div className="stats-strip">
          {[
            ["50M+", "Files processed"],
            ["4.9★", "User rating"],
            ["12", "PDF tools"],
            ["256-bit", "SSL security"],
          ].map(([n, l]) => (
            <div key={l} className="stat-item">
              <div className="stat-num">{n}</div>
              <div className="stat-label">{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tools */}
      <section className="section">
        <div className="container">
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 40, flexWrap: "wrap", gap: 20 }}>
            <div>
              <div className="section-label">// All Tools</div>
              <div className="section-title">THE TOOLKIT</div>
            </div>
            <div className="search-wrap" style={{ margin: 0, maxWidth: 320 }}>
              <span className="search-icon"><Icon d={icons.search} size={16} /></span>
              <input
                placeholder="Search tools..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="cat-tabs">
            {categories.map((c) => (
              <button
                key={c}
                className={`cat-tab${activeCat === c ? " active" : ""}`}
                onClick={() => setActiveCat(c)}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="tools-grid">
            {filtered.map((t, i) => (
              <ToolCard key={t.id} tool={t} index={i} />
            ))}
          </div>

          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "80px 0", color: "var(--muted-2)", fontFamily: "var(--font-mono)", fontSize: 13 }}>
              // No tools found for &quot;{search}&quot;
            </div>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="section" style={{ background: "var(--bg-2)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div className="container">
          <div className="section-label">// Why PDFKit Pro</div>
          <div className="section-title">BUILT DIFFERENT</div>
          <div className="features-grid">
            {[
              { num: "01", title: "BANK-LEVEL SECURITY", desc: "256-bit SSL on every transfer. Files permanently deleted after processing. We never store or share your data." },
              { num: "02", title: "LIGHTNING FAST", desc: "Cloud-powered processing completes in seconds. No queues, no waiting. Just results." },
              { num: "03", title: "WORKS EVERYWHERE", desc: "Any browser, any device. No installs, no extensions, no plugins required." },
            ].map((f) => (
              <div key={f.num} className="feature-item">
                <div className="feature-num">{f.num}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section" style={{ textAlign: "center" }}>
        <div className="container">
          <div className="section-label" style={{ justifyContent: "center", display: "flex" }}>// Get started</div>
          <div className="section-title" style={{ marginBottom: 20 }}>
            READY TO<br />
            <span style={{ color: "var(--accent)" }}>START?</span>
          </div>
          <p style={{ color: "var(--muted)", marginBottom: 36, fontSize: 15 }}>
            Join millions of users who trust PDFKit Pro for their document work.
          </p>
          <button className="btn btn-primary btn-xl" onClick={() => router.push("/tools/merge")}>
            Try for Free
          </button>
        </div>
      </section>
    </main>
  );
}
