"use client";
import Link from "next/link";
import { tools } from "@/lib/data";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo">
              <div className="footer-logo-icon">PK</div>
              <span className="footer-logo-text">PDFKit Pro</span>
            </div>
            <p>All-in-One PDF Tools. Fast, Secure and Easy.</p>
            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
              {["Twitter", "LinkedIn", "GitHub"].map((s) => (
                <a key={s} style={{ fontSize: 13, color: "#64748B", cursor: "pointer", textDecoration: "none" }}>
                  {s}
                </a>
              ))}
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
            <h4>Company</h4>
            <ul className="footer-links">
              {["About Us", "Privacy Policy", "Terms of Service", "Contact Us"].map((l) => (
                <li key={l}><a>{l}</a></li>
              ))}
            </ul>
          </div>

          <div className="footer-col">
            <h4>Support</h4>
            <ul className="footer-links">
              {["Help Center", "How it Works", "FAQs"].map((l) => (
                <li key={l}><a>{l}</a></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2024 PDFKit Pro. All rights reserved.</span>
          <span>Made with ♥ for document lovers</span>
        </div>
      </div>
    </footer>
  );
}
