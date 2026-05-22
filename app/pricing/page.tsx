import type { Metadata } from "next";
import Icon from "@/components/Icon";
import { icons, plans } from "@/lib/data";

export const metadata: Metadata = {
  title: "Pricing – PDFKit Pro",
};

export default function PricingPage() {
  return (
    <section className="pricing-section">
      <div className="container">
        <div className="pricing-header">
          <h2>Simple, transparent pricing</h2>
          <p>Choose the plan that works best for you.</p>
        </div>
        <div className="pricing-grid">
          {plans.map((plan) => (
            <div key={plan.name} className={`pricing-card${plan.featured ? " featured" : ""}`}>
              {plan.featured && <div className="pricing-badge">Most Popular</div>}
              <div className="plan-name">{plan.name}</div>
              <div className="plan-price">
                <span style={{ fontSize: 22, verticalAlign: "super", fontFamily: "var(--font-body)" }}>₹</span>
                {plan.price.replace("₹", "")}
                <span style={{ fontSize: 16, color: "var(--muted)", fontWeight: 400 }}> /mo</span>
              </div>
              <div className="plan-period" />
              <div className="plan-desc">{plan.desc}</div>
              <ul className="plan-features">
                {plan.features.map((f) => (
                  <li key={f}>
                    <Icon d={icons.check} size={16} strokeWidth={2.5} style={{ color: "var(--success)" }} />
                    {f}
                  </li>
                ))}
              </ul>
              <button className={`btn btn-block ${plan.featured ? "btn-primary" : "btn-outline"}`}>
                {plan.name === "Free" ? "Get Started" : `Get ${plan.name}`}
              </button>
            </div>
          ))}
        </div>
        <p style={{ textAlign: "center", fontSize: 13, color: "var(--muted)", marginTop: 24 }}>
          All plans include 256-bit SSL encryption and secure processing.
        </p>
      </div>
    </section>
  );
}
