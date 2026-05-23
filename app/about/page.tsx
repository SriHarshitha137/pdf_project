import type { Metadata } from "next";

export const metadata: Metadata = { title: "About – PDFKit Pro" };

export default function AboutPage() {
  return (
    <section className="about-hero">
      <div className="container">
        <div className="section-label">// About us</div>
        <h1 className="about-hero" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(64px,8vw,110px)", letterSpacing: 2, color: "var(--white)", lineHeight: 0.92, marginBottom: 60 }}>
          WE MAKE<br />
          <span style={{ color: "var(--accent)" }}>PDF WORK</span><br />
          BETTER.
        </h1>

        <div className="about-grid">
          {[
            {
              label: "01 / Mission",
              title: "Why We Built This",
              body: "Working with PDFs should be simple, fast, and secure. We built PDFKit Pro to give everyone access to professional-grade tools — without the complexity, the bloat, or the cost.",
            },
            {
              label: "02 / Privacy",
              title: "Your Files, Your Data",
              body: "All files are processed with 256-bit SSL encryption and deleted permanently after use. We never store, share, or sell your data. Period.",
            },
            {
              label: "03 / Product",
              title: "Built for Everyone",
              body: "Whether you're a student merging lecture notes, a lawyer protecting contracts, or a developer running OCR at scale — PDFKit Pro has you covered with 12+ tools and counting.",
            },
          ].map((s) => (
            <div key={s.label} className="about-card">
              <div className="about-card-label">{s.label}</div>
              <h3>{s.title}</h3>
              <p>{s.body}</p>
            </div>
          ))}
        </div>

        <div
          style={{
            marginTop: 80,
            padding: "48px 40px",
            background: "var(--bg-2)",
            border: "1px solid var(--border)",
            borderLeft: "3px solid var(--accent)",
          }}
        >
          <div className="section-label">// Numbers</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 40, marginTop: 24 }}>
            {[["50M+","Files processed"],["4.9/5","User rating"],["12","PDF tools"],["0","Data retained"]].map(([n,l]) => (
              <div key={l}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 48, color: "var(--accent)", letterSpacing: 1, lineHeight: 1 }}>{n}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)", marginTop: 6, letterSpacing: 0.5 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
