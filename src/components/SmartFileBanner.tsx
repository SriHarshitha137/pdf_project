"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DetectedFile, ConvertOption } from "@/lib/fileDetect";

// ── colour palette per file kind ─────────────────────────────────────────
const KIND_COLORS: Record<string, { bg: string; text: string; badge: string; badgeText: string }> = {
  pdf:     { bg: "#D1EDD9", text: "#1A5C35", badge: "#4A7C59",  badgeText: "#fff" },
  jpg:     { bg: "#FEF9C3", text: "#B45309", badge: "#D97706",  badgeText: "#fff" },
  jpeg:    { bg: "#FEF9C3", text: "#B45309", badge: "#D97706",  badgeText: "#fff" },
  png:     { bg: "#DBEAFE", text: "#1D4ED8", badge: "#2563EB",  badgeText: "#fff" },
  webp:    { bg: "#F0FDF4", text: "#15803D", badge: "#16A34A",  badgeText: "#fff" },
  gif:     { bg: "#FDF4FF", text: "#7E22CE", badge: "#9333EA",  badgeText: "#fff" },
  bmp:     { bg: "#FFF7ED", text: "#C2410C", badge: "#EA580C",  badgeText: "#fff" },
  tiff:    { bg: "#F0F9FF", text: "#0369A1", badge: "#0284C7",  badgeText: "#fff" },
  svg:     { bg: "#FFF1F2", text: "#BE123C", badge: "#E11D48",  badgeText: "#fff" },
  docx:    { bg: "#EFF6FF", text: "#1E40AF", badge: "#3B82F6",  badgeText: "#fff" },
  doc:     { bg: "#EFF6FF", text: "#1E40AF", badge: "#3B82F6",  badgeText: "#fff" },
  xlsx:    { bg: "#F0FDF4", text: "#166534", badge: "#22C55E",  badgeText: "#fff" },
  pptx:    { bg: "#FFF7ED", text: "#9A3412", badge: "#F97316",  badgeText: "#fff" },
  txt:     { bg: "#F8FAFC", text: "#475569", badge: "#64748B",  badgeText: "#fff" },
  unknown: { bg: "#F1F5F9", text: "#475569", badge: "#94A3B8",  badgeText: "#fff" },
};

function getColors(ext: string) {
  return KIND_COLORS[ext.toLowerCase()] ?? KIND_COLORS.unknown;
}

// ── tiny inline SVG helper ────────────────────────────────────────────────
function Ico({ d, size = 14 }: { d: string | string[]; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
    </svg>
  );
}

// ── icon map for "other actions" chips ────────────────────────────────────
const CHIP_ICONS: Record<string, string | string[]> = {
  compress:  ["M4 14h6v6", "M20 10h-6V4", "M14 10l7-7", "M3 21l7-7"],
  merge:     ["M8 3H5a2 2 0 00-2 2v3","M21 8V5a2 2 0 00-2-2h-3","M3 16v3a2 2 0 002 2h3","M16 21h3a2 2 0 002-2v-3","M12 8v8","M8 12h8"],
  split:     ["M16 3h5v5","M8 3H3v5","M12 22v-8.3a4 4 0 00-1.172-2.872L3 3","M12 22v-8.3a4 4 0 011.172-2.872L21 3"],
  rotate:    "M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15",
  watermark: ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"],
  lock:      ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10","M9 12l2 2 4-4"],
  unlock:    ["M8 11V7a4 4 0 018 0","M5 11h14a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7a2 2 0 012-2z","M12 16v2"],
  ocr:       ["M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4","M10 17l5-5-5-5","M13.8 12H3"],
  organize:  ["M8 6h13","M8 12h13","M8 18h13","M3 6h.01","M3 12h.01","M3 18h.01"],
  ai:        ["M12 2a10 10 0 110 20A10 10 0 0112 2z","M12 8v4l3 3"],
  pdf:       ["M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z","M14 2v6h6"],
  image:     "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
};

// ── props ─────────────────────────────────────────────────────────────────
interface Props {
  detected: DetectedFile;
  fileName: string;
  onDismiss: () => void;
}

export default function SmartFileBanner({ detected, fileName, onDismiss }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<ConvertOption | null>(null);

  const colors = getColors(detected.ext);
  const hasConvert = detected.convertOptions.length > 0;

  const handleApply = () => {
    if (!selected) return;
    router.push(`/tools/${selected.toolId}?from=${detected.kind}&to=${selected.to.toLowerCase()}`);
  };

  const handleChip = (toolId: string) => {
    router.push(`/tools/${toolId}`);
  };

  return (
    <div className="detect-banner">
      {/* ── Header: file info ── */}
      <div className="detect-header">
        {/* File type badge */}
        <div className="detect-file-icon" style={{ background: colors.bg, color: colors.text }}>
          {detected.ext.slice(0, 4)}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="detect-file-name">{fileName}</div>
          <div className="detect-file-kind">{detected.label} detected</div>
        </div>

        {/* Kind badge */}
        <div className="detect-badge" style={{ background: colors.badge, color: colors.badgeText }}>
          {detected.ext}
        </div>

        {/* Dismiss */}
        <button suppressHydrationWarning
          onClick={onDismiss}
          style={{ marginLeft: 10, background: "none", border: "none", cursor: "pointer",
            color: "var(--muted)", display: "flex", alignItems: "center", padding: 4,
            borderRadius: 4, transition: "color 0.15s" }}
          title="Dismiss"
        >
          <Ico d="M18 6L6 18M6 6l12 12" size={15} />
        </button>
      </div>

      {/* ── Body ── */}
      <div className="detect-body">

        {/* Convert to dropdown */}
        {hasConvert && (
          <>
            <div className="detect-section-label">Convert to</div>

            {/* Trigger */}
            <div>
              <button suppressHydrationWarning
                className={`convert-trigger${open ? " open" : ""}`}
                onClick={() => setOpen((o) => !o)}
              >
                <span className="convert-trigger-left">
                  <Ico
                    d={selected
                      ? (typeof selected.icon === "string" ? selected.icon : selected.icon)
                      : "M8 3H5a2 2 0 00-2 2v3M21 8V5a2 2 0 00-2-2h-3"}
                    size={15}
                  />
                  {selected
                    ? <span className="convert-selected-label">{selected.label}</span>
                    : <span className="convert-trigger-placeholder">
                        Select conversion — e.g. {detected.convertOptions[0]?.label}
                      </span>
                  }
                </span>
                <span className={`convert-chevron${open ? " open" : ""}`}>
                  <Ico d="M6 9l6 6 6-6" size={14} />
                </span>
              </button>

              {/* Dropdown */}
              {open && (
                <div className="convert-dropdown">
                  {detected.convertOptions.map((opt) => (
                    <div
                      key={opt.to}
                      className={`convert-option${selected?.to === opt.to ? " selected" : ""}`}
                      onClick={() => { setSelected(opt); setOpen(false); }}
                    >
                      <div className="convert-opt-icon">
                        <Ico d={typeof opt.icon === "string" ? opt.icon : opt.icon} size={15} />
                      </div>
                      <div>
                        <div className="convert-opt-label">{opt.label}</div>
                        <div className="convert-opt-desc">{opt.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Apply button */}
            {selected && (
              <div className="detect-apply-row">
                <button suppressHydrationWarning className="btn btn-dark" onClick={handleApply} style={{ flex: 1, justifyContent: "center" }}>
                  <Ico d="M5 12h14M12 5l7 7-7 7" size={14} />
                  Go to {selected.label} tool
                </button>
                <button suppressHydrationWarning
                  className="btn btn-ghost btn-sm"
                  onClick={() => setSelected(null)}
                  title="Clear selection"
                >
                  <Ico d="M18 6L6 18M6 6l12 12" size={13} />
                </button>
              </div>
            )}
          </>
        )}

        {/* Other actions */}
        {detected.otherActions.length > 0 && (
          <div style={{ marginTop: hasConvert ? 16 : 0 }}>
            <div className="detect-section-label">
              {hasConvert ? "Or do more with this file" : "What would you like to do?"}
            </div>
            <div className="other-actions-row">
              {detected.otherActions.map((a) => (
                <button suppressHydrationWarning
                  key={a.toolId + a.label}
                  className="other-action-chip"
                  onClick={() => handleChip(a.toolId)}
                >
                  <Ico d={CHIP_ICONS[a.icon] ?? CHIP_ICONS.pdf} size={12} />
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Unknown / no options */}
        {!hasConvert && detected.otherActions.length === 0 && (
          <p style={{ fontSize: 13, color: "var(--muted)", padding: "4px 0" }}>
            No conversion options available for this file type.
          </p>
        )}
      </div>
    </div>
  );
}
