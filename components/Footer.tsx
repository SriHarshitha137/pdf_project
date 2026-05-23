"use client";
import Link from "next/link";
import { tools } from "@/lib/data";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 30,
                  height: 30,
                  background: "var(--accent)",
                  borderRadius: 4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--bg)",
                  fontFamily: "var(--font-display)",
                  fontSize: 14,
                }}
              >
                PK
              </div>
              <span
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: 20,
                  letterSpacing: 2,
                  color: "var(--white)",
                }}
              >
                PDFKIT
              </span>
            </div>
            <p>
              Every PDF tool you&apos;ll ever need. Fast, secure, and built for real document work.
            </p>
            <div
              style={{
                marginTop: 20,
                fontFamily: "var(--font-mono)",
                fontSize: 11,
                color: "var(--muted-2)",
                letterSpacing: 0.5,
              }}
            >
              // 256-bit SSL encryption
            </div>
          </div>

          <div className="footer-col">
            <h4>Tools</h4>
            <ul className="footer-links">
              {tools.slice(0, 6).map((t) => (
                <li key={t.id}>
                  <Link href={`/tools/${t.id}`}>{t.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h4>More Tools</h4>
            <ul className="footer-links">
              {tools.slice(6).map((t) => (
                <li key={t.id}>
                  <Link href={`/tools/${t.id}`}>{t.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h4>Company</h4>
            <ul className="footer-links">
              {["About", "Pricing", "Privacy Policy", "Terms of Service", "Contact"].map((l) => (
                <li key={l}>
                  <a>{l}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2024 PDFKit Pro. MIT License.</span>
          <span>Built with Next.js 15</span>
        </div>
      </div>
    </footer>
  );
}
