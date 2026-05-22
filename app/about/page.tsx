import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About – PDFKit Pro",
};

export default function AboutPage() {
  return (
    <section style={{ padding: "80px 0" }}>
      <div className="container" style={{ maxWidth: 720 }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 40,
              fontWeight: 800,
              letterSpacing: "-1.5px",
              color: "var(--ink)",
              marginBottom: 12,
            }}
          >
            About PDFKit Pro
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 17, lineHeight: 1.7 }}>
            PDFKit Pro is a modern web-based PDF utility platform built for everyone — from students
            to enterprise teams.
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {[
            {
              title: "Our Mission",
              text: "We believe working with PDFs should be simple, fast, and secure. That's why we built PDFKit Pro — to give everyone access to professional-grade PDF tools without the complexity or cost.",
            },
            {
              title: "Privacy First",
              text: "Your files are yours. We process everything securely with 256-bit SSL encryption and delete all files permanently after processing. We never store, share, or sell your data.",
            },
            {
              title: "Built for Everyone",
              text: "Whether you're merging a few documents, running OCR on scanned files, or using AI to summarize lengthy reports — PDFKit Pro has you covered with 12+ tools and counting.",
            },
          ].map((s) => (
            <div
              key={s.title}
              style={{
                padding: "28px 32px",
                background: "var(--surface)",
                borderRadius: 12,
                border: "1.5px solid var(--border)",
              }}
            >
              <h3
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 18,
                  fontWeight: 700,
                  color: "var(--ink)",
                  marginBottom: 10,
                }}
              >
                {s.title}
              </h3>
              <p style={{ color: "var(--muted)", lineHeight: 1.7 }}>{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
