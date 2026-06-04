import type { Metadata } from "next";
import { plans } from "@/lib/data";

export const metadata: Metadata = { title: "Pricing – PDFKit Pro" };

function Check() {
  return (
    <svg className="check-icon" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function FeatIcon({ d }: { d: string | string[] }) {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="pricing-lf-icon">
      {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
    </svg>
  );
}

export default function PricingPage() {
  const leftFeatures = [
    { icon: ["M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"], label: "Unlimited access to all tools" },
    { icon: ["M8 6h13","M8 12h13","M8 18h13","M3 6h.01","M3 12h.01","M3 18h.01"], label: "Batch processing" },
    { icon: ["M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z","M14 2v6h6"], label: "No file size limits" },
    { icon: ["M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2","M12 3a4 4 0 100 8 4 4 0 000-8z"], label: "Priority support" },
    { icon: ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"], label: "Advanced security" },
  ];

  return (
    <div className="pricing-page">
      <div className="container">
        <div className="pricing-body">
          {/* Left column */}
          <div className="pricing-lhs">
            <h2>Do more<br />with PDFKit Pro</h2>
            <p>Unlock advanced features and boost your productivity.</p>
            <div className="pricing-lhs-features">
              {leftFeatures.map((f) => (
                <div key={f.label} className="pricing-lf-row">
                  <FeatIcon d={f.icon} />
                  {f.label}
                </div>
              ))}
            </div>
            {/* Decorative element */}
            <div style={{ marginTop: 36, width: 120, height: 80, position: "relative", opacity: 0.35 }}>
              <div style={{ position: "absolute", width: 60, height: 60, borderRadius: "50%", background: "var(--accent-2)", bottom: 0, left: 0 }} />
              <svg style={{ position: "absolute", right: 0, bottom: 10 }} width={60} height={50} viewBox="0 0 60 50" fill="none">
                <path d="M5 45 Q30 5 55 45" stroke="var(--border-2)" strokeWidth="1.5" fill="none" />
                <path d="M15 45 Q30 15 45 45" stroke="var(--border-2)" strokeWidth="1.5" fill="none" />
              </svg>
            </div>
          </div>

          {/* Plans */}
          <div className="pricing-plans">
            {plans.map((plan) => (
              <div key={plan.name} className={`plan-card${plan.featured ? " featured" : ""}`}>
                {plan.featured && <div className="plan-badge">Most Popular</div>}
                <div className="plan-name">{plan.name}</div>
                <div className="plan-price">
                  <span className="cur">₹</span>
                  {plan.price.replace("₹", "")}
                </div>
                <div className="plan-tagline">
                  <span style={{ color: "var(--muted)", fontSize: 12 }}>/month</span>
                  <br />
                  {plan.desc}
                </div>
                <ul className="plan-features">
                  {plan.features.map((f) => (
                    <li key={f}>
                      <Check />
                      {f}
                    </li>
                  ))}
                </ul>
                <button className={`btn btn-block ${plan.featured ? "btn-dark" : "btn-outline"}`}>
                  {plan.name === "Free" ? "Get Started" : plan.name === "Team" ? "Contact Sales" : `Get ${plan.name}`}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
