"use client";
import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ToolCard from "@/components/ToolCard";
import { useAuth } from "@/lib/AuthContext";
import { tools } from "@/lib/data";
import { analyzeFile, DetectedFile } from "@/lib/fileDetect";
import { uploadFile } from "@/lib/pdfApi";

function SIcon({ d, size = 16 }: { d: string | string[]; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
    </svg>
  );
}

const sidebarCats = [
  { id: "all", label: "All Tools", icon: ["M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"] },
  { id: "Merge & Split", label: "Merge & Split", icon: ["M8 3H5a2 2 0 00-2 2v3", "M21 8V5a2 2 0 00-2-2h-3", "M3 16v3a2 2 0 002 2h3", "M16 21h3a2 2 0 002-2v-3", "M12 8v8", "M8 12h8"] },
  { id: "Convert", label: "Convert", icon: ["M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z", "M14 2v6h6"] },
  { id: "Edit & Sign", label: "Edit & Sign", icon: ["M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7", "M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"] },
  { id: "Compress", label: "Compress", icon: ["M4 14h6v6", "M20 10h-6V4", "M14 10l7-7", "M3 21l7-7"] },
  { id: "Protect", label: "Protect", icon: ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"] },
  { id: "OCR", label: "OCR", icon: ["M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4", "M10 17l5-5-5-5", "M13.8 12H3"] },
  { id: "Organize", label: "Organize", icon: ["M8 6h13", "M8 12h13", "M8 18h13", "M3 6h.01", "M3 12h.01", "M3 18h.01"] },
  { id: "AI", label: "AI Tools", icon: ["M12 2a10 10 0 110 20A10 10 0 0112 2z", "M12 8v4l3 3"] },
  { id: "Utilities", label: "Utilities", icon: ["M3 3h7v7H3z", "M14 3h7v7h-7z", "M3 14h7v7H3z", "M14 14h3v3h-3z", "M17 17h3v3h-3z"] },
];

// Tools shown on homepage before "View All" (first 12)
const HOME_LIMIT = 12;

// ── file kind → [convert toolId, label] ──────────────────────────────────────
const CONVERT_OPTIONS: Record<string, { toolId: string; label: string }[]> = {
  pdf:  [
    { toolId: "pdf2jpg",  label: "PDF → JPG" },
    { toolId: "pdf2word", label: "PDF → Word" },
    { toolId: "pdf2excel",label: "PDF → Excel" },
    { toolId: "pdf2jpg",  label: "PDF → PNG" },
  ],
  jpg:  [{ toolId: "jpg2pdf", label: "Image → PDF" }],
  jpeg: [{ toolId: "jpg2pdf", label: "Image → PDF" }],
  png:  [{ toolId: "jpg2pdf", label: "Image → PDF" }],
  doc:  [{ toolId: "word2pdf",  label: "Word → PDF" }],
  docx: [{ toolId: "word2pdf",  label: "Word → PDF" }],
  xls:  [{ toolId: "excel2pdf", label: "Excel → PDF" }],
  xlsx: [{ toolId: "excel2pdf", label: "Excel → PDF" }],
  ppt:  [{ toolId: "ppt2pdf",   label: "PPT → PDF" }],
  pptx: [{ toolId: "ppt2pdf",   label: "PPT → PDF" }],
};

// ── "other actions" pills per kind ────────────────────────────────────────────
const OTHER_ACTIONS: Record<string, { toolId: string; label: string; icon: string | string[] }[]> = {
  pdf: [
    { toolId: "compress",  label: "Compress",   icon: ["M4 14h6v6","M20 10h-6V4","M14 10l7-7","M3 21l7-7"] },
    { toolId: "merge",     label: "Merge",      icon: ["M8 3H5a2 2 0 00-2 2v3","M21 8V5a2 2 0 00-2-2h-3","M3 16v3a2 2 0 002 2h3","M16 21h3a2 2 0 002-2v-3","M12 8v8","M8 12h8"] },
    { toolId: "split",     label: "Split",      icon: ["M16 3h5v5","M8 3H3v5","M12 22v-8.3a4 4 0 00-1.172-2.872L3 3","M12 22v-8.3a4 4 0 011.172-2.872L21 3"] },
    { toolId: "rotate",    label: "Rotate",     icon: "M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15" },
    { toolId: "watermark", label: "Watermark",  icon: ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"] },
    { toolId: "protect",   label: "Protect",    icon: ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10","M9 12l2 2 4-4"] },
    { toolId: "unlock",    label: "Unlock",     icon: ["M8 11V7a4 4 0 018 0","M5 11h14a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7a2 2 0 012-2z","M12 16v2"] },
    { toolId: "ocr",       label: "OCR",        icon: ["M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4","M10 17l5-5-5-5","M13.8 12H3"] },
    { toolId: "organize",  label: "Organize",   icon: ["M8 6h13","M8 12h13","M8 18h13","M3 6h.01","M3 12h.01","M3 18h.01"] },
    { toolId: "ai",        label: "AI Summary", icon: ["M12 2a10 10 0 110 20A10 10 0 0112 2z","M12 8v4l3 3"] },
  ],
  jpg:  [{ toolId: "jpg2pdf", label: "JPG to PDF", icon: ["M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z","M14 2v6h6"] }],
  jpeg: [{ toolId: "jpg2pdf", label: "JPG to PDF", icon: ["M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z","M14 2v6h6"] }],
  png:  [{ toolId: "jpg2pdf", label: "Image to PDF", icon: ["M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z","M14 2v6h6"] }],
};

// Kind colours (matching SmartFileBanner)
const KIND_COLORS: Record<string, { bg: string; text: string; badge: string; badgeText: string }> = {
  pdf:     { bg: "#D1EDD9", text: "#1A5C35", badge: "#4A7C59",  badgeText: "#fff" },
  jpg:     { bg: "#FEF9C3", text: "#B45309", badge: "#D97706",  badgeText: "#fff" },
  jpeg:    { bg: "#FEF9C3", text: "#B45309", badge: "#D97706",  badgeText: "#fff" },
  png:     { bg: "#DBEAFE", text: "#1D4ED8", badge: "#2563EB",  badgeText: "#fff" },
  docx:    { bg: "#EFF6FF", text: "#1E40AF", badge: "#3B82F6",  badgeText: "#fff" },
  doc:     { bg: "#EFF6FF", text: "#1E40AF", badge: "#3B82F6",  badgeText: "#fff" },
  xlsx:    { bg: "#F0FDF4", text: "#166534", badge: "#22C55E",  badgeText: "#fff" },
  xls:     { bg: "#F0FDF4", text: "#166534", badge: "#22C55E",  badgeText: "#fff" },
  pptx:    { bg: "#FFF7ED", text: "#9A3412", badge: "#F97316",  badgeText: "#fff" },
  ppt:     { bg: "#FFF7ED", text: "#9A3412", badge: "#F97316",  badgeText: "#fff" },
  unknown: { bg: "#F1F5F9", text: "#475569", badge: "#94A3B8",  badgeText: "#fff" },
};

function getColors(ext: string) {
  return KIND_COLORS[ext.toLowerCase()] ?? KIND_COLORS.unknown;
}

function SmallIcon({ d, size = 13 }: { d: string | string[]; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
      {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
    </svg>
  );
}

// ── Home upload banner ────────────────────────────────────────────────────────
interface HomeBannerProps {
  file: File;
  detected: DetectedFile;
  onDismiss: () => void;
}

function HomeUploadBanner({ file, detected, onDismiss }: HomeBannerProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState("");
  const ext = detected.ext.toLowerCase();
  const colors = getColors(ext);
  const convertOptions = CONVERT_OPTIONS[ext] ?? [];
  const otherActions = OTHER_ACTIONS[ext] ?? [];

  const handleAction = async (toolId: string, label: string) => {
    setLoading(true);
    setLoadingLabel(label);
    try {
      const result = await uploadFile(file);
      router.push(`/tools/${toolId}?file_id=${result.file_id}`);
    } catch {
      setLoading(false);
      setLoadingLabel("");
      alert("Upload failed. Please try again.");
    }
  };

  return (
    <div className="detect-banner">
      {/* Header */}
      <div className="detect-header">
        <div className="detect-file-icon" style={{ background: colors.bg, color: colors.text }}>
          {detected.ext.slice(0, 4).toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="detect-file-name">{file.name}</div>
          <div className="detect-file-kind">{detected.label} detected</div>
        </div>
        <div className="detect-badge" style={{ background: colors.badge, color: colors.badgeText }}>
          {detected.ext.toUpperCase()}
        </div>
        {!loading && (
          <button suppressHydrationWarning
            onClick={onDismiss}
            style={{ marginLeft: 10, background: "none", border: "none", cursor: "pointer",
              color: "var(--muted)", display: "flex", alignItems: "center", padding: 4,
              borderRadius: 4, transition: "color 0.15s" }}
            title="Dismiss"
          >
            <SmallIcon d="M18 6L6 18M6 6l12 12" size={15} />
          </button>
        )}
      </div>

      {/* Body */}
      <div className="detect-body">
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", fontSize: 13, color: "var(--muted)" }}>
            <svg style={{ animation: "spin 0.8s linear infinite", flexShrink: 0 }}
              width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--text)"
              strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <line x1={12} y1={2} x2={12} y2={6} />
              <line x1={12} y1={18} x2={12} y2={22} />
              <line x1={4.93} y1={4.93} x2={7.76} y2={7.76} />
              <line x1={16.24} y1={16.24} x2={19.07} y2={19.07} />
              <line x1={2} y1={12} x2={6} y2={12} />
              <line x1={18} y1={12} x2={22} y2={12} />
              <line x1={4.93} y1={19.07} x2={7.76} y2={16.24} />
              <line x1={16.24} y1={7.76} x2={19.07} y2={4.93} />
            </svg>
            Uploading file for <strong style={{ color: "var(--text)", marginLeft: 4 }}>{loadingLabel}</strong>…
          </div>
        ) : (
          <>
            {/* Convert to section */}
            {convertOptions.length > 0 && (
              <>
                <div className="detect-section-label">Convert to</div>
                <div className="other-actions-row">
                  {convertOptions.map((opt) => (
                    <button suppressHydrationWarning
                      key={opt.toolId + opt.label}
                      className="other-action-chip"
                      onClick={() => handleAction(opt.toolId, opt.label)}
                    >
                      <SmallIcon d={["M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z","M14 2v6h6"]} size={12} />
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Other actions section */}
            {otherActions.length > 0 && (
              <div style={{ marginTop: convertOptions.length > 0 ? 16 : 0 }}>
                <div className="detect-section-label">
                  {convertOptions.length > 0 ? "Or do more with this file" : "What would you like to do?"}
                </div>
                <div className="other-actions-row">
                  {otherActions.map((a) => (
                    <button suppressHydrationWarning
                      key={a.toolId + a.label}
                      className="other-action-chip"
                      onClick={() => handleAction(a.toolId, a.label)}
                    >
                      <SmallIcon d={a.icon} size={12} />
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {convertOptions.length === 0 && otherActions.length === 0 && (
              <p style={{ fontSize: 13, color: "var(--muted)", padding: "4px 0" }}>
                No conversion options available for this file type.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Home Upload Zone ──────────────────────────────────────────────────────────
function HomeUploadZone({ onFile }: { onFile: (f: File, d: DetectedFile) => void }) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [isDrag, setIsDrag] = useState(false);

  const handle = useCallback((fl: FileList | null) => {
    if (!fl || fl.length === 0) return;
    const f = fl[0];
    const detected = analyzeFile(f);
    onFile(f, detected);
  }, [onFile]);

  return (
    <div
      className={`upload-zone${isDrag ? " drag-over" : ""}`}
      style={{ marginBottom: 0 }}
      onDragOver={(e) => { e.preventDefault(); setIsDrag(true); }}
      onDragLeave={() => setIsDrag(false)}
      onDrop={(e) => { e.preventDefault(); setIsDrag(false); handle(e.dataTransfer.files); }}
      onClick={() => fileInput.current?.click()}
    >
      <div className="upload-zone-icon">
        <SIcon d={["M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z","M14 2v6h6","M9 15l2 2 4-4"]} size={40} />
      </div>
      <div className="upload-zone-title">Drag & drop any file to get started</div>
      <div className="upload-zone-sub">PDF, Word, Excel, PowerPoint, Images</div>
      <button suppressHydrationWarning className="btn btn-dark" onClick={(e) => { e.stopPropagation(); fileInput.current?.click(); }}>
        Choose File
        <SIcon d="M6 9l6 6 6-6" size={13} />
      </button>
      <div className="upload-zone-note">PDF · DOC · DOCX · XLS · XLSX · PPT · PPTX · JPG · PNG · Max 100MB</div>
      <input suppressHydrationWarning
        ref={fileInput}
        type="file"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
        style={{ display: "none" }}
        onChange={(e) => handle(e.target.files)}
      />
    </div>
  );
}

// ── Main HomePage ─────────────────────────────────────────────────────────────
export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const [activeCat, setActiveCat] = useState("all");
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);
  const router = useRouter();

  // Home upload state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [detectedFile, setDetectedFile] = useState<DetectedFile | null>(null);

  const handleAdminClick = () => {
    if (isAuthenticated) {
      router.push("/admin");
    } else {
      alert("You are not authorized to do that.");
    }
  };

  const handleHomeUpload = useCallback((f: File, d: DetectedFile) => {
    setUploadedFile(f);
    setDetectedFile(d);
  }, []);

  const filtered = tools.filter((t) => {
    const catOk = activeCat === "all" || t.category === activeCat;
    const q = search.toLowerCase();
    const searchOk = !q || t.label.toLowerCase().includes(q) || t.desc.toLowerCase().includes(q);
    return catOk && searchOk;
  });

  // On homepage, limit visible tools unless expanded or searching/filtering
  const isFiltering = search.length > 0 || activeCat !== "all";
  const visibleTools = (showAll || isFiltering) ? filtered : filtered.slice(0, HOME_LIMIT);
  const hasMore = !isFiltering && filtered.length > HOME_LIMIT && !showAll;

  return (
    <main>
      {/* Hero */}
      <div className="container">
        <div className="hero">
          <div>
            <div className="hero-eyebrow">
              <span className="hero-eyebrow-dot" />
              SIMPLE. POWERFUL. PRIVATE.
            </div>
            <h1>
              PDF tools<br />
              <span className="serif">that just work</span><span className="period">.</span>
            </h1>
            <p className="hero-sub">
              Everything you need to edit, convert, protect and manage PDFs — in one clean workspace.
            </p>
            <div className="hero-btns">
              <Link href="/tools/merge" className="btn btn-dark btn-xl btn-arrow">
                Explore All Tools
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </Link>
              <Link href="/pricing" className="btn btn-outline btn-xl">
                View Pricing
              </Link>
              <button suppressHydrationWarning onClick={handleAdminClick} className="btn btn-outline btn-xl">
                Admin Panel
              </button>
            </div>
          </div>

          {/* Illustration */}
          <div className="hero-illustration">
            <svg width="520" height="420" viewBox="0 0 420 340" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ overflow: "visible" }}>
              <defs>
                <pattern id="dotPattern" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1.2" fill="var(--illus-line)" opacity="0.3" />
                </pattern>
                <linearGradient id="greenGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="var(--illus-green-start)" />
                  <stop offset="100%" stopColor="var(--illus-green-end)" />
                </linearGradient>
                <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 1 2 L 7 5 L 1 8" fill="none" stroke="var(--illus-line)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </marker>
              </defs>
              <rect x="250" y="160" width="120" height="120" fill="url(#dotPattern)" />
              <g style={{ filter: "drop-shadow(0 4px 20px rgba(0,0,0,0.02))" }}>
                <path d="M 230 40 L 330 40 L 370 80 L 370 300 L 230 300 Z" fill="var(--illus-page-bg)" stroke="var(--illus-page-border)" strokeWidth="1.5" />
                <path d="M 330 40 L 330 80 L 370 80 Z" fill="var(--bg-3)" stroke="var(--illus-page-border)" strokeWidth="1.5" />
                <circle cx="350" cy="120" r="1.5" fill="var(--illus-page-border)" />
                <circle cx="350" cy="280" r="1.5" fill="var(--illus-page-border)" />
              </g>
              <circle cx="210" cy="170" r="80" fill="url(#greenGradient)" />
              <rect x="150" y="210" width="70" height="70" rx="4" fill="var(--illus-square-bg)" stroke="var(--illus-page-border)" strokeWidth="0.5" />
              <g stroke="var(--illus-line)" strokeWidth="1.2" opacity="0.6">
                <line x1="120" y1="110" x2="140" y2="130" />
                <line x1="140" y1="110" x2="120" y2="130" />
                <line x1="130" y1="105" x2="130" y2="135" />
                <line x1="115" y1="120" x2="145" y2="120" />
              </g>
              <path d="M 115 285 Q 195 305 255 205" stroke="var(--illus-line)" strokeWidth="1.5" strokeDasharray="3 3" fill="none" markerEnd="url(#arrow)" />
              <path d="M 185 245 Q 235 270 290 220" stroke="var(--illus-line)" strokeWidth="1.5" fill="none" markerEnd="url(#arrow)" />
            </svg>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="stats-bar">
        {[
          { icon: ["M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z","M14 2v6h6"], num: "50M+", label: "Files processed" },
          { icon: ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"], num: "256-BIT", label: "SSL security" },
          { icon: ["M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2","M23 21v-2a4 4 0 00-3-3.87","M16 3.13a4 4 0 010 7.75","M9 7a4 4 0 100 8 4 4 0 000-8z"], num: "4.9★", label: "User rating" },
          { icon: ["M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"], num: "22+", label: "PDF tools" },
        ].map(({ icon, num, label }) => (
          <div key={label} className="stat-cell">
            <div className="stat-icon"><SIcon d={icon} size={20} /></div>
            <div className="stat-info">
              <div className="stat-num">{num}</div>
              <div className="stat-label">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tools section — sidebar + grid */}
      <div className="container">
        <div className="home-tools-section">
          <div className="home-tools-inner">
            {/* Left sidebar */}
            <div className="home-tools-sidebar">
              {sidebarCats.map((c) => (
                <button suppressHydrationWarning
                  key={c.id}
                  className={`home-sidebar-link${activeCat === c.id ? " active" : ""}`}
                  onClick={() => { setActiveCat(c.id); setShowAll(false); }}
                >
                  <SIcon d={c.icon} size={15} />
                  {c.label}
                </button>
              ))}

              <div className="sidebar-download" style={{ marginTop: 24 }}>
                <div className="sidebar-download-title">Work faster.</div>
                <div className="sidebar-download-desc">Install our desktop app for offline productivity.</div>
                <button suppressHydrationWarning className="btn btn-dark btn-sm" style={{ width: "100%", justifyContent: "center" }}>
                  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><path d="M7 10l5 5 5-5" /><path d="M12 15V3" /></svg>
                  Download App
                </button>
              </div>
            </div>

            {/* Tools grid */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                <div>
                  <div className="tools-section-num">01</div>
                  <h2 className="tools-section-title">
                    {activeCat === "all" ? "All PDF Tools" : activeCat}
                  </h2>
                </div>
                <div className="tools-search">
                  <span className="tools-search-icon">
                    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" /></svg>
                  </span>
                  <input suppressHydrationWarning
                    placeholder="Search tools..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setShowAll(false); }}
                  />
                </div>
              </div>

              {/* ── Home Upload Zone + Smart Banner ── */}
              <div style={{ marginBottom: 28 }}>
                {uploadedFile && detectedFile ? (
                  <HomeUploadBanner
                    file={uploadedFile}
                    detected={detectedFile}
                    onDismiss={() => { setUploadedFile(null); setDetectedFile(null); }}
                  />
                ) : (
                  <HomeUploadZone onFile={handleHomeUpload} />
                )}
              </div>

              <div className="home-tools-grid">
                {visibleTools.map((t, i) => (
                  <ToolCard key={t.id} tool={t} index={i} />
                ))}
                {filtered.length === 0 && (
                  <div style={{ gridColumn: "1/-1", padding: "60px 0", textAlign: "center", color: "var(--muted)", fontSize: 14 }}>
                    No tools found for &ldquo;{search}&rdquo;
                  </div>
                )}
              </div>

              {/* View All / Show Less buttons */}
              {filtered.length > 0 && (
                <div style={{ marginTop: 20, textAlign: "center", display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                  {hasMore && (
                    <button suppressHydrationWarning className="btn btn-outline btn-arrow" onClick={() => setShowAll(true)}>
                      View All {filtered.length} Tools
                      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    </button>
                  )}
                  {showAll && !isFiltering && (
                    <button suppressHydrationWarning className="btn btn-ghost btn-arrow" onClick={() => setShowAll(false)}>
                      <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 19l7-7-7-7" /></svg>
                      Show Less
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Features strip */}
      <div className="container" style={{ paddingTop: 60 }}>
        <div className="features-strip">
          <div className="features-strip-inner">
            {[
              { icon: ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"], title: "Private & Secure", desc: "Your files are never stored after processing." },
              { icon: ["M13 2L3 14h9l-1 8 10-12h-9l1-8z"], title: "Blazing Fast", desc: "Powerful servers for instant results." },
              { icon: ["M12 2a10 10 0 110 20A10 10 0 0112 2z","M2 12h20","M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"], title: "Works Anywhere", desc: "Any device, any browser, anytime." },
              { icon: ["M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2","M12 3a4 4 0 100 8 4 4 0 000-8z"], title: "No Sign-up", desc: "Use all tools instantly without creating account." },
            ].map((f) => (
              <div key={f.title} className="feat-cell">
                <div className="feat-cell-icon"><SIcon d={f.icon} size={22} /></div>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
