import type { Metadata } from "next";
export const metadata: Metadata = { title: "About – PDFKit Pro" };

export default function AboutPage() {
  return (
    <div className="about-page">
      <div className="container">
        <div style={{ maxWidth: 560, marginBottom: 8 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "var(--accent-2)", letterSpacing: 1, textTransform: "uppercase", marginBottom: 12 }}>About Us</p>
          <h1 style={{ fontSize: "clamp(36px,5vw,54px)", fontWeight: 700, color: "var(--text)", letterSpacing: -1.5, lineHeight: 1.1, marginBottom: 16 }}>
            PDF tools that just work.
          </h1>
          <p style={{ fontSize: 16, color: "var(--muted)", lineHeight: 1.7 }}>
            We built PDFKit Pro because working with PDFs should be simple, fast, and private. No bloat, no sign-up walls, no tracking.
          </p>
        </div>

        <div className="about-grid">
          {[
            { label: "01 / Mission", title: "Why We Built This", body: "Working with PDFs should be simple, fast, and secure. PDFKit Pro gives everyone access to professional-grade tools — without complexity or cost." },
            { label: "02 / Privacy", title: "Your Files, Your Data", body: "All files are processed with 256-bit SSL encryption and deleted permanently after use. We never store, share, or sell your data. Period." },
            { label: "03 / Product", title: "Built for Everyone", body: "Student, lawyer, or developer — PDFKit Pro has you covered with 12+ tools and counting. No account required." },
          ].map((s) => (
            <div key={s.label} className="about-card">
              <div className="about-card-label">{s.label}</div>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 56, display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 0, border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden", background: "var(--border)" }}>
          {[["50M+","Files processed"],["4.9/5","User rating"],["12+","PDF tools"],["0","Data retained"]].map(([n, l]) => (
            <div key={l} style={{ background: "var(--bg-2)", padding: "28px 24px" }}>
              <div style={{ fontSize: 36, fontWeight: 700, color: "var(--text)", letterSpacing: -1, lineHeight: 1, marginBottom: 6 }}>{n}</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
