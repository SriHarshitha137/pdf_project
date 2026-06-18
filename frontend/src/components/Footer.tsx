"use client";
import Link from "next/link";
import { publicTools } from "@/lib/data";

function FooterIcon({ d, size = 14 }: { d: string | string[]; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div>
            <div className="footer-logo-row">
              <div className="footer-logo-mark">PK</div>
              <span className="footer-logo-name">PDFKIT</span>
            </div>
            <p className="footer-brand-desc">
              Everything you need to edit, convert, protect and manage PDFs in one clean workspace.
            </p>
          </div>
          <div className="footer-col">
            <h4>Tools</h4>
            <ul>
              {publicTools.slice(0, 6).map((t) => (
                <li key={t.id}><Link href={`/tools/${t.id}`}>{t.label}</Link></li>
              ))}
            </ul>
          </div>
          <div className="footer-col">
            <h4>More Tools</h4>
            <ul>
              {publicTools.slice(6).map((t) => (
                <li key={t.id}><Link href={`/tools/${t.id}`}>{t.label}</Link></li>
              ))}
            </ul>
          </div>
          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              {["About", "Privacy Policy", "Terms of Service", "Contact"].map((l) => (
                <li key={l}><a href="#">{l}</a></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-trust">
            {[
              { icon: ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"], label: "256-bit SSL encryption" },
              { icon: ["M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"], label: "GDPR compliant" },
              { icon: ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10", "M9 12l2 2 4-4"], label: "Your data is 100% safe" },
            ].map((item) => (
              <div key={item.label} className="footer-trust-item">
                <FooterIcon d={item.icon} size={14} />
                {item.label}
              </div>
            ))}
          </div>
          <span className="footer-copy">© 2026 PDFKit Pro</span>
        </div>
      </div>
    </footer>
  );
}
