"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";
import ToolCard from "@/components/ToolCard";
import { icons, tools, categories } from "@/lib/data";

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
      <section className="hero">
        <div className="container">
          <div className="hero-badge">
            <Icon d={icons.zap} size={12} fill="currentColor" stroke="none" /> 100% Free to use
          </div>
          <h1>Every <em>PDF Tool</em><br />You&apos;ll Ever Need</h1>
          <p className="hero-sub">
            Merge, split, compress, convert, protect, OCR and edit PDFs in a fast, secure and easy way. No sign-up required.
          </p>
          <div className="search-bar">
            <span className="search-icon"><Icon d={icons.search} size={18} /></span>
            <input placeholder="Search PDF tools..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="hero-note">
            <span><Icon d={icons.shield} size={14} /> Secure &amp; Private</span>
            <span><Icon d={icons.zap} size={14} /> Lightning Fast</span>
            <span><Icon d={icons.globe} size={14} /> No Sign-up Required</span>
          </div>
        </div>
      </section>

      <div className="container">
        <div className="stats-row">
          {[["50M+","Files Processed"],["4.9★","User Rating"],["12","PDF Tools"],["256-bit","SSL Security"]].map(([n,l]) => (
            <div key={l} className="stat-item">
              <div className="stat-num">{n}</div>
              <div className="stat-label">{l}</div>
            </div>
          ))}
        </div>
      </div>

      <section className="section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">All PDF Tools</h2>
            <span style={{ fontSize: 14, color: "var(--muted)" }}>{filtered.length} tools</span>
          </div>
          <div className="cat-tabs">
            {categories.map((c) => (
              <button key={c} className={`cat-tab${activeCat === c ? " active" : ""}`} onClick={() => setActiveCat(c)}>{c}</button>
            ))}
          </div>
          <div className="tools-grid">
            {filtered.map((t) => <ToolCard key={t.id} tool={t} />)}
          </div>
          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 0", color: "var(--muted)" }}>
              <Icon d={icons.search} size={40} />
              <p style={{ marginTop: 12 }}>No tools found for &quot;{search}&quot;</p>
            </div>
          )}
        </div>
      </section>

      <section className="features-section" style={{ background: "var(--surface)" }}>
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 34, fontWeight: 800, letterSpacing: "-1px", color: "var(--ink)", marginBottom: 12 }}>Why Choose PDFKit Pro?</h2>
            <p style={{ color: "var(--muted)", fontSize: 16 }}>Professional PDF tools built for real document work</p>
          </div>
          <div className="features-grid">
            {[
              { icon: icons.shield, title: "Bank-Level Security", desc: "All files are encrypted with 256-bit SSL. We delete your files permanently after processing." },
              { icon: icons.zap, title: "Lightning Fast", desc: "Our cloud infrastructure processes your files in seconds, not minutes. No waiting around." },
              { icon: icons.globe, title: "Works Everywhere", desc: "Use PDFKit Pro in any browser on any device. No software to install or update." },
            ].map((f) => (
              <div key={f.title} className="feature-item">
                <div className="feature-icon-wrap">
                  <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                    {Array.isArray(f.icon) ? f.icon.map((p,i) => <path key={i} d={p} />) : <path d={f.icon} />}
                  </svg>
                </div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: "80px 0", textAlign: "center" }}>
        <div className="container">
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 800, letterSpacing: "-1.5px", color: "var(--ink)", marginBottom: 12 }}>Ready to get started?</h2>
          <p style={{ color: "var(--muted)", marginBottom: 28, fontSize: 16 }}>Join millions of users who trust PDFKit Pro for their PDF needs.</p>
          <button className="btn btn-primary btn-xl" onClick={() => router.push("/tools/merge")}>Start for Free</button>
        </div>
      </section>
    </main>
  );
}
