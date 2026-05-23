import type { Metadata } from "next";
import Icon from "@/components/Icon";
import { icons, plans } from "@/lib/data";

export const metadata: Metadata = { title: "Pricing – PDFKit Pro" };

export default function PricingPage() {
  return (
    <section className="pricing-section">
      <div className="container">
        <div className="section-label">// Pricing</div>
        <div className="section-title">
          SIMPLE<br />
          <span style={{ color: "var(--accent)" }}>PRICING.</span>
        </div>
        <p style={{ color: "var(--muted)", fontSize: 15, marginTop: 16 }}>
          No hidden fees. Cancel anytime.
        </p>

        <div className="pricing-grid">
          {plans.map((plan) => (
            <div key={plan.name} className={`pricing-card${plan.featured ? " featured" : ""}`}>
              {plan.featured && (
                <div className="pricing-badge">
                  <Icon d={icons.star} size={10} fill="currentColor" stroke="none" />
                  Most Popular
                </div>
              )}
              <div className="plan-name">{plan.name}</div>
              <div className="plan-price">
                <span className="currency">₹</span>
                {plan.price.replace("₹", "")}
              </div>
              <div className="plan-period">per month</div>
              <div className="plan-desc">{plan.desc}</div>
              <ul className="plan-features">
                {plan.features.map((f) => (
                  <li key={f}>
                    <span className="feat-dot" />
                    {f}
                  </li>
                ))}
              </ul>
              <button className={`btn btn-block ${plan.featured ? "btn-primary" : "btn-ghost"}`}>
                {plan.name === "Free" ? "Get Started Free" : `Get ${plan.name}`}
              </button>
            </div>
          ))}
        </div>

        <p style={{ textAlign: "center", fontSize: 12, color: "var(--muted-2)", marginTop: 32, fontFamily: "var(--font-mono)" }}>
          // All plans include 256-bit SSL encryption and secure processing
        </p>
      </div>
    </section>
  );
}
