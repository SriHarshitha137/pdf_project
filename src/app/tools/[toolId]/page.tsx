"use client";
import {
  mergePdf, splitPdf, compressPdf, protectPdf, unlockPdf,
  pdfToJpg, jpgToPdf, ocrPdf, uploadFile, getJobStatus,
  downloadJobResult, rotatePdf, watermarkPdf, organizePdf, aiSummarize,
  addPageNumbers, wordToPdf, pdfToWord, excelToPdf, pdfToExcel,
  pptToPdf, signPdf, aiTranslate, aiRewrite, qrToPdf,
  runTool,
} from "@/lib/pdfApi";
import { useState, useRef, useCallback, use, useEffect, type Dispatch, type SetStateAction, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { tools } from "@/lib/data";
// import { useAuth } from "@/lib/AuthContext";

function SvgIcon({ d, size = 16, stroke = "currentColor", strokeWidth = 1.6 }: {
  d: string | string[]; size?: number; stroke?: string; strokeWidth?: number;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
    </svg>
  );
}

const sidebarCats = [
  { id: "all",         label: "All Tools",    icon: ["M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"] },
  { id: "Merge & Split", label: "Merge & Split", icon: ["M8 3H5a2 2 0 00-2 2v3","M21 8V5a2 2 0 00-2-2h-3","M3 16v3a2 2 0 002 2h3","M16 21h3a2 2 0 002-2v-3","M12 8v8","M8 12h8"] },
  { id: "Convert",     label: "Convert",      icon: ["M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z","M14 2v6h6"] },
  { id: "Edit & Sign", label: "Edit & Sign",  icon: ["M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7","M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"] },
  { id: "Compress",    label: "Compress",     icon: ["M4 14h6v6","M20 10h-6V4","M14 10l7-7","M3 21l7-7"] },
  { id: "Protect",     label: "Protect",      icon: ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"] },
  { id: "OCR",         label: "OCR",          icon: ["M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4","M10 17l5-5-5-5","M13.8 12H3"] },
  { id: "Organize",    label: "Organize",     icon: ["M8 6h13","M8 12h13","M8 18h13","M3 6h.01","M3 12h.01","M3 18h.01"] },
  { id: "AI",          label: "AI Tools",     icon: ["M12 2a10 10 0 110 20A10 10 0 0112 2z","M12 8v4l3 3"] },
  { id: "Utilities",   label: "Utilities",    icon: ["M3 3h7v7H3z","M14 3h7v7h-7z","M3 14h7v7H3z","M14 14h3v3h-3z","M17 17h3v3h-3z"] },
];

interface ToolState {
  splitMode?: string; rotation?: number; wmTab?: string; pageNumPos?: string;
  compressionPercent?: number; password?: string; confirmPassword?: string;
  watermarkText?: string; ocrLanguage?: string;
  // Sign
  signType?: "typed" | "stamp" | "digital";
  signText?: string; signFont?: string; signPosition?: string;
  signPassword?: string; signReason?: string;
  stampFileId?: number; certFileId?: number;
  // QR
  translateLang?: string; rewriteTone?: string;
  qrUrl?: string; qrSize?: string; qrFormat?: string;
  // QR to PDF
  qr2pdfUrl?: string; qr2pdfPosition?: string; qr2pdfSize?: string; qr2pdfPages?: string;
  textValue?: string;
  imageQuality?: number;
  resizeWidth?: number;
  resizeHeight?: number;
  downscaleMaxWidth?: number;
  downscaleMaxHeight?: number;
  cropLeft?: number;
  cropTop?: number;
  cropWidth?: number;
  cropHeight?: number;
  backgroundColor?: string;
  smartCropWidth?: number;
  smartCropHeight?: number;
  dpi?: number;
  upscaleScale?: number;
  upscaleModel?: string;
  organizeMode?: string;
}
interface FileEntry {
  file: File; id: string; name: string; size: string; pages?: string;
  preloadedFileId?: number;
}

interface ToolConfig {
  title: string; desc: string; multi: boolean;
  accept: string; acceptLabel: string; num: string;
  howItWorks: { title: string; desc: string }[];
  options: (state: ToolState, set: Dispatch<SetStateAction<ToolState>>) => ReactNode;
  actionLabel: string; resultName: string;
}

const CFGS: Record<string, ToolConfig> = {
  merge: {
    title: "MERGE", desc: "Combine multiple PDF files into a single document.",
    multi: true, accept: ".pdf", acceptLabel: "PDF files", num: "02",
    howItWorks: [{ title: "Add PDFs", desc: "Select multiple PDFs." }, { title: "Arrange", desc: "Reorder as needed." }, { title: "Download", desc: "Get merged PDF." }],
    options: (_s, _set) => (
      <div className="option-group">
        <label className="checkbox-row" style={{ cursor: "pointer" }}>
          <div className="checkbox-box checked"><SvgIcon d="M20 6L9 17l-5-5" size={9} strokeWidth={3} /></div>
          <span className="checkbox-label">Merge in the original order</span>
        </label>
      </div>
    ),
    actionLabel: "Merge PDF", resultName: "Merged_File.pdf",
  },
  split: {
    title: "SPLIT", desc: "Extract pages or split into parts.",
    multi: false, accept: ".pdf", acceptLabel: "PDF file", num: "03",
    howItWorks: [{ title: "Upload PDF", desc: "Select the PDF." }, { title: "Configure", desc: "Choose split mode." }, { title: "Download", desc: "Get split files." }],
    options: (state, set) => (
      <>
        <div className="option-group">
          <span className="option-label">Split Mode</span>
          <div className="radio-group">
            {["Extract every page", "Split by page range", "Split each page"].map((o) => (
              <div key={o} className={`radio-row${state.splitMode === o ? " selected" : ""}`} onClick={() => set((s) => ({ ...s, splitMode: o }))}>
                <div className="radio-dot" /><span className="radio-label">{o}</span>
              </div>
            ))}
          </div>
        </div>
        {state.splitMode === "Split by page range" && (
          <div className="option-group">
            <span className="option-label">Range</span>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input suppressHydrationWarning className="option-input" style={{ width: 60 }} type="number" defaultValue={1} min={1} />
              <span style={{ fontSize: 12, color: "var(--muted)" }}>to</span>
              <input suppressHydrationWarning className="option-input" style={{ width: 60 }} type="number" defaultValue={5} min={1} />
            </div>
          </div>
        )}
      </>
    ),
    actionLabel: "Split PDF", resultName: "Split_Files.zip",
  },
  compress: {
    title: "COMPRESS", desc: "Reduce PDF size without quality loss.",
    multi: false, accept: ".pdf", acceptLabel: "PDF file", num: "04",
    howItWorks: [{ title: "Upload", desc: "Select the PDF." }, { title: "Choose level", desc: "Pick compression." }, { title: "Download", desc: "Smaller PDF." }],
    options: (state, set) => (
      <div className="option-group">
        <span className="option-label">Compression Level</span>
        <select suppressHydrationWarning
          className="option-select"
          value={state.compressionPercent?.toString() ?? "50"}
          onChange={(e) => set(s => ({ ...s, compressionPercent: parseInt(e.target.value) }))}
        >
          <option value="30">Extreme (30%)</option>
          <option value="50">Recommended (50%)</option>
          <option value="70">Low (70%)</option>
          <option value="90">High Quality (90%)</option>
        </select>
      </div>
    ),
    actionLabel: "Compress PDF", resultName: "Compressed.pdf",
  },
  pdf2jpg: {
    title: "PDF TO JPG", desc: "Convert PDF pages to JPG images.",
    multi: false, accept: ".pdf", acceptLabel: "PDF file", num: "05",
    howItWorks: [{ title: "Upload", desc: "Select PDF." }, { title: "Configure", desc: "Quality & pages." }, { title: "Download", desc: "ZIP of images." }],
    options: () => (
      <>
        <div className="option-group">
          <span className="option-label">Quality</span>
          <select suppressHydrationWarning className="option-select"><option>High</option><option>Medium</option><option>Low</option></select>
        </div>
        <div className="option-group">
          <span className="option-label">Pages</span>
          <select suppressHydrationWarning className="option-select"><option>All Pages</option><option>Custom</option></select>
        </div>
      </>
    ),
    actionLabel: "Convert to JPG", resultName: "PDF_Images.zip",
  },
  jpg2pdf: {
    title: "JPG TO PDF", desc: "Convert images to a PDF document.",
    multi: true, accept: ".jpg,.jpeg,.png,.webp,.gif,.bmp,.tiff,.tif,.svg", acceptLabel: "images", num: "06",
    howItWorks: [{ title: "Add images", desc: "Select images." }, { title: "Arrange", desc: "Set order." }, { title: "Download", desc: "PDF ready." }],
    options: () => (
      <>
        <div className="option-group">
          <span className="option-label">Page Size</span>
          <select suppressHydrationWarning className="option-select"><option>Fit to image</option><option>A4</option><option>Letter</option></select>
        </div>
        <div className="option-group">
          <span className="option-label">Orientation</span>
          <select suppressHydrationWarning className="option-select"><option>Portrait</option><option>Landscape</option></select>
        </div>
      </>
    ),
    actionLabel: "Convert to PDF", resultName: "Converted.pdf",
  },
  rotate: {
    title: "ROTATE", desc: "Rotate PDF pages left or right.",
    multi: false, accept: ".pdf", acceptLabel: "PDF file", num: "07",
    howItWorks: [{ title: "Upload", desc: "Select PDF." }, { title: "Rotate", desc: "Choose direction." }, { title: "Download", desc: "Rotated PDF." }],
    options: (state, set) => (
      <div className="option-group">
        <span className="option-label">Direction</span>
        <div style={{ display: "flex", gap: 6 }}>
          {[
            { label: "Left 90°", val: 270 },
            { label: "Right 90°", val: 90 },
            { label: "180°", val: 180 }
          ].map((r) => (
            <div key={r.label} className={`radio-row${state.rotation === r.val ? " selected" : ""}`} style={{ flex: 1 }} onClick={() => set((s) => ({ ...s, rotation: r.val }))}>
              <div className="radio-dot" /><span className="radio-label" style={{ fontSize: 12 }}>{r.label}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    actionLabel: "Rotate PDF", resultName: "Rotated.pdf",
  },
  watermark: {
    title: "WATERMARK", desc: "Add text or image watermark to PDF.",
    multi: false, accept: ".pdf", acceptLabel: "PDF file", num: "08",
    howItWorks: [{ title: "Upload", desc: "Select PDF." }, { title: "Add mark", desc: "Text or image." }, { title: "Download", desc: "Watermarked PDF." }],
    options: (state, set) => (
      <>
        <div className="tab-row">
          {["Text", "Image"].map((t) => (
            <button suppressHydrationWarning key={t} className={`tab-btn${state.wmTab === t ? " active" : ""}`} onClick={() => set((s) => ({ ...s, wmTab: t }))}>{t} Watermark</button>
          ))}
        </div>
        {state.wmTab !== "Image"
          ? <div className="option-group"><span className="option-label">Text</span><input suppressHydrationWarning className="option-input" placeholder="e.g. CONFIDENTIAL" value={state.watermarkText ?? ""} onChange={(e) => set(s => ({ ...s, watermarkText: e.target.value }))} /></div>
          : <div className="option-group"><span className="option-label">Image</span><button suppressHydrationWarning className="btn btn-outline btn-sm" style={{ width: "100%" }}>Choose Image</button></div>
        }
        <div className="option-group">
          <span className="option-label">Position</span>
          <select suppressHydrationWarning className="option-select"><option>Center</option><option>Top Left</option><option>Top Right</option><option>Bottom Left</option><option>Bottom Right</option></select>
        </div>
      </>
    ),
    actionLabel: "Add Watermark", resultName: "Watermarked.pdf",
  },
  unlock: {
    title: "UNLOCK", desc: "Remove password from protected PDF.",
    multi: false, accept: ".pdf", acceptLabel: "PDF file", num: "09",
    howItWorks: [{ title: "Upload", desc: "Select locked PDF." }, { title: "Password", desc: "Enter password." }, { title: "Download", desc: "Unlocked PDF." }],
    options: (state, set) => (
      <div className="option-group">
        <span className="option-label">Password</span>
        <input suppressHydrationWarning className="option-input" type="password" placeholder="Enter PDF password" value={state.password ?? ""} onChange={(e) => set(s => ({ ...s, password: e.target.value }))} />
      </div>
    ),
    actionLabel: "Unlock PDF", resultName: "Unlocked.pdf",
  },
  protect: {
    title: "PROTECT", desc: "Password protect your PDF file.",
    multi: false, accept: ".pdf", acceptLabel: "PDF file", num: "10",
    howItWorks: [{ title: "Upload", desc: "Select PDF." }, { title: "Set password", desc: "Choose password." }, { title: "Download", desc: "Protected PDF." }],
    options: (state, set) => (
      <>
        <div className="option-group"><span className="option-label">Password</span><input suppressHydrationWarning className="option-input" type="password" placeholder="Enter password" value={state.password ?? ""} onChange={(e) => set(s => ({ ...s, password: e.target.value }))} /></div>
        <div className="option-group"><span className="option-label">Confirm</span><input suppressHydrationWarning className="option-input" type="password" placeholder="Confirm password" value={state.confirmPassword ?? ""} onChange={(e) => set(s => ({ ...s, confirmPassword: e.target.value }))} /></div>
      </>
    ),
    actionLabel: "Protect PDF", resultName: "Protected.pdf",
  },
  organize: {
    title: "ORGANIZE", desc: "Reorder, delete or add pages.",
    multi: false, accept: ".pdf", acceptLabel: "PDF file", num: "11",
    howItWorks: [{ title: "Upload", desc: "Select PDF." }, { title: "Organize", desc: "Reorder pages." }, { title: "Download", desc: "Organized PDF." }],
    options: (state, set) => (
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {["Reorder Pages","Delete Pages","Add Blank Pages"].map((a) => (
          <button
            suppressHydrationWarning
            key={a}
            className={`btn btn-outline btn-sm${state.organizeMode === a ? " selected" : ""}`}
            style={{ justifyContent: "center" }}
            onClick={() => set((s) => ({ ...s, organizeMode: a }))}
          >
            {a}
          </button>
        ))}
      </div>
    ),
    actionLabel: "Organize PDF", resultName: "Organized.pdf",
  },
  ocr: {
    title: "OCR", desc: "Make scanned PDFs searchable.",
    multi: false, accept: ".pdf", acceptLabel: "PDF file", num: "12",
    howItWorks: [{ title: "Upload", desc: "Scanned PDF." }, { title: "Language", desc: "Select language." }, { title: "Download", desc: "Searchable PDF." }],
    options: (state, set) => (
      <div className="option-group">
        <span className="option-label">Document Language</span>
        <select suppressHydrationWarning className="option-select" value={state.ocrLanguage ?? "eng"} onChange={(e) => set(s => ({ ...s, ocrLanguage: e.target.value }))}>
          <option value="eng">English</option>
          <option value="hin">Hindi</option>
          <option value="spa">Spanish</option>
          <option value="fra">French</option>
          <option value="deu">German</option>
          <option value="chi_sim">Chinese</option>
        </select>
      </div>
    ),
    actionLabel: "Run OCR", resultName: "OCR_Result.pdf",
  },
  ai: {
    title: "AI SUMMARISE", desc: "Get AI-generated summary of PDF.",
    multi: false, accept: ".pdf", acceptLabel: "PDF file", num: "19",
    howItWorks: [{ title: "Upload", desc: "Select PDF." }, { title: "AI reads", desc: "Extracts content." }, { title: "Summary", desc: "Copy or download." }],
    options: () => (
      <div className="option-group">
        <span className="option-label">Length</span>
        <select suppressHydrationWarning className="option-select"><option>Short</option><option>Medium</option><option>Detailed</option></select>
      </div>
    ),
    actionLabel: "Summarise", resultName: "Summary.txt",
  },
  addPageNumbers: {
    title: "ADD PAGE NUMBERS", desc: "Stamp page numbers at a chosen position.",
    multi: false, accept: ".pdf", acceptLabel: "PDF file", num: "12",
    howItWorks: [{ title: "Upload", desc: "Select PDF." }, { title: "Configure", desc: "Choose position & style." }, { title: "Download", desc: "Numbered PDF." }],
    options: (state, set) => (
      <>
        <div className="option-group">
          <span className="option-label">Position</span>
          <div className="radio-group">
            {["Bottom Center", "Bottom Right", "Bottom Left", "Top Center", "Top Right", "Top Left"].map((p) => (
              <div key={p} className={`radio-row${state.pageNumPos === p ? " selected" : ""}`} onClick={() => set((s) => ({ ...s, pageNumPos: p }))}>
                <div className="radio-dot" /><span className="radio-label">{p}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="option-group">
          <span className="option-label">Starting Number</span>
          <input suppressHydrationWarning className="option-input" type="number" defaultValue={1} min={1} />
        </div>
      </>
    ),
    actionLabel: "Add Page Numbers", resultName: "Numbered.pdf",
  },
  word2pdf: {
    title: "WORD TO PDF", desc: "Convert .docx Word files to PDF.",
    multi: false, accept: ".doc,.docx", acceptLabel: "Word file", num: "06",
    howItWorks: [{ title: "Upload", desc: "Select .docx file." }, { title: "Convert", desc: "We handle formatting." }, { title: "Download", desc: "PDF ready." }],
    options: () => (
      <div className="option-group">
        <span className="option-label">Page Size</span>
        <select suppressHydrationWarning className="option-select"><option>A4</option><option>Letter</option><option>Legal</option></select>
      </div>
    ),
    actionLabel: "Convert to PDF", resultName: "Converted.pdf",
  },
  pdf2word: {
    title: "PDF TO WORD", desc: "Extract PDF content to editable .docx.",
    multi: false, accept: ".pdf", acceptLabel: "PDF file", num: "07",
    howItWorks: [{ title: "Upload", desc: "Select PDF." }, { title: "Extract", desc: "AI preserves layout." }, { title: "Download", desc: "Editable .docx." }],
    options: () => (
      <div className="option-group">
        <span className="option-label">Mode</span>
        <select suppressHydrationWarning className="option-select"><option>Flowing text</option><option>Exact layout</option></select>
      </div>
    ),
    actionLabel: "Convert to Word", resultName: "Converted.docx",
  },
  excel2pdf: {
    title: "EXCEL TO PDF", desc: "Convert .xlsx spreadsheets to PDF.",
    multi: false, accept: ".xls,.xlsx", acceptLabel: "Excel file", num: "08",
    howItWorks: [{ title: "Upload", desc: "Select .xlsx file." }, { title: "Convert", desc: "Sheets become pages." }, { title: "Download", desc: "PDF ready." }],
    options: () => (
      <div className="option-group">
        <span className="option-label">Sheet Selection</span>
        <select suppressHydrationWarning className="option-select"><option>All Sheets</option><option>Active Sheet Only</option></select>
      </div>
    ),
    actionLabel: "Convert to PDF", resultName: "Spreadsheet.pdf",
  },
  pdf2excel: {
    title: "PDF TO EXCEL", desc: "Extract tables from PDF to .xlsx.",
    multi: false, accept: ".pdf", acceptLabel: "PDF file", num: "09",
    howItWorks: [{ title: "Upload", desc: "Select PDF with tables." }, { title: "Extract", desc: "Tables detected." }, { title: "Download", desc: ".xlsx ready." }],
    options: () => (
      <div className="option-group">
        <span className="option-label">Pages</span>
        <select suppressHydrationWarning className="option-select"><option>All Pages</option><option>Custom Range</option></select>
      </div>
    ),
    actionLabel: "Extract to Excel", resultName: "Extracted.xlsx",
  },
  ppt2pdf: {
    title: "PPT TO PDF", desc: "Convert PowerPoint presentations to PDF.",
    multi: false, accept: ".ppt,.pptx", acceptLabel: "PowerPoint file", num: "10",
    howItWorks: [{ title: "Upload", desc: "Select .pptx file." }, { title: "Convert", desc: "Slides become pages." }, { title: "Download", desc: "PDF ready." }],
    options: () => (
      <div className="option-group">
        <span className="option-label">Layout</span>
        <select suppressHydrationWarning className="option-select"><option>1 slide per page</option><option>2 slides per page</option><option>4 slides per page</option></select>
      </div>
    ),
    actionLabel: "Convert to PDF", resultName: "Presentation.pdf",
  },
  sign: {
    title: "SIGN PDF", desc: "Add a typed, stamped, or digital signature to your PDF.",
    multi: false, accept: ".pdf", acceptLabel: "PDF file", num: "14",
    howItWorks: [{ title: "Upload", desc: "Select your PDF." }, { title: "Choose type", desc: "Typed, Stamp, or Digital." }, { title: "Download", desc: "Signed PDF." }],
    options: (state, set) => {
      const type = state.signType ?? "typed";
      return (
        <>
          {/* ── Sign type selector ── */}
          <div className="option-group">
            <span className="option-label">Signature Type</span>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
              {([
                { id: "typed",   label: "Typed",   icon: ["M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7","M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"], desc: "Type your name" },
                { id: "stamp",   label: "Stamp",   icon: ["M22 11.08V12a10 10 0 11-5.93-9.14","M22 4L12 14.01l-3-3"],                                                          desc: "Upload image" },
                { id: "digital", label: "Digital", icon: ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10","M9 12l2 2 4-4"],                                                      desc: "Certificate" },
              ] as const).map((opt) => (
                <button suppressHydrationWarning
                  key={opt.id}
                  onClick={() => set((s) => ({ ...s, signType: opt.id }))}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                    padding: "12px 8px", borderRadius: "var(--radius)",
                    border: `1.5px solid ${type === opt.id ? "var(--text)" : "var(--border)"}`,
                    background: type === opt.id ? "var(--bg-3)" : "var(--bg)",
                    cursor: "pointer", transition: "all 0.15s", fontFamily: "var(--font-sans)",
                  }}
                >
                  <svg width={18} height={18} viewBox="0 0 24 24" fill="none"
                    stroke={type === opt.id ? "var(--text)" : "var(--muted)"}
                    strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
                    {opt.icon.map((p, i) => <path key={i} d={p} />)}
                  </svg>
                  <span style={{ fontSize: 11, fontWeight: 600, color: type === opt.id ? "var(--text)" : "var(--muted)" }}>{opt.label}</span>
                  <span style={{ fontSize: 10, color: "var(--muted-2)", lineHeight: 1.3 }}>{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Typed signature ── */}
          {type === "typed" && (
            <>
              <div className="option-group">
                <span className="option-label">Your Name / Signature Text</span>
                <input suppressHydrationWarning
                  className="option-input"
                  placeholder="e.g. John Smith"
                  value={state.signText ?? ""}
                  onChange={(e) => set((s) => ({ ...s, signText: e.target.value }))}
                  style={{ fontStyle: "italic" }}
                />
              </div>
              <div className="option-group">
                <span className="option-label">Font Style</span>
                <select suppressHydrationWarning className="option-select" value={state.signFont ?? "Caveat"} onChange={(e) => set((s) => ({ ...s, signFont: e.target.value }))}>
                  <option value="Caveat">Caveat (Handwritten)</option>
                  <option value="DancingScript">Dancing Script</option>
                  <option value="Pacifico">Pacifico</option>
                  <option value="Arial">Arial (Print)</option>
                </select>
              </div>
            </>
          )}

          {/* ── Stamp (image) signature ── */}
          {type === "stamp" && (
            <>
              <div className="option-group">
                <span className="option-label">Signature Image</span>
                <div style={{
                  border: "1.5px dashed var(--border-2)", borderRadius: "var(--radius)",
                  padding: "20px", textAlign: "center", background: "var(--bg)", cursor: "pointer",
                }}
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file"; input.accept = ".png,.jpg,.jpeg,.svg";
                    input.onchange = (e) => {
                      const f = (e.target as HTMLInputElement).files?.[0];
                      if (f) set((s) => ({ ...s, stampFileId: Date.now() }));
                    };
                    input.click();
                  }}
                >
                  <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 8px" }}>
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><path d="M17 8l-5-5-5 5" /><path d="M12 3v12" />
                  </svg>
                  <div style={{ fontSize: 12, color: "var(--muted)", fontFamily: "var(--font-sans)" }}>
                    {state.stampFileId ? "✓ Image uploaded" : "Click to upload PNG / JPG / SVG"}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--muted-2)", marginTop: 4, fontFamily: "var(--font-sans)" }}>
                    Transparent PNG recommended
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ── Digital certificate signature ── */}
          {type === "digital" && (
            <>
              <div className="option-group">
                <span className="option-label">Certificate File (.p12 / .pfx)</span>
                <div style={{
                  border: "1.5px dashed var(--border-2)", borderRadius: "var(--radius)",
                  padding: "16px", textAlign: "center", background: "var(--bg)", cursor: "pointer",
                }}
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "file"; input.accept = ".p12,.pfx,.pem";
                    input.onchange = (e) => {
                      const f = (e.target as HTMLInputElement).files?.[0];
                      if (f) set((s) => ({ ...s, certFileId: Date.now() }));
                    };
                    input.click();
                  }}
                >
                  <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" style={{ margin: "0 auto 6px" }}>
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                  </svg>
                  <div style={{ fontSize: 12, color: "var(--muted)", fontFamily: "var(--font-sans)" }}>
                    {state.certFileId ? "✓ Certificate uploaded" : "Upload .p12 / .pfx certificate"}
                  </div>
                </div>
              </div>
              <div className="option-group">
                <span className="option-label">Certificate Password</span>
                <input suppressHydrationWarning className="option-input" type="password" placeholder="Enter certificate password"
                  value={state.signPassword ?? ""}
                  onChange={(e) => set((s) => ({ ...s, signPassword: e.target.value }))} />
              </div>
              <div className="option-group">
                <span className="option-label">Reason for Signing</span>
                <input suppressHydrationWarning className="option-input" placeholder="e.g. I approve this document"
                  value={state.signReason ?? ""}
                  onChange={(e) => set((s) => ({ ...s, signReason: e.target.value }))} />
              </div>
            </>
          )}

          {/* ── Common: position ── */}
          <div className="option-group">
            <span className="option-label">Placement on Page</span>
            <select suppressHydrationWarning className="option-select" value={state.signPosition ?? "Bottom Right"} onChange={(e) => set((s) => ({ ...s, signPosition: e.target.value }))}>
              <option>Bottom Right</option><option>Bottom Left</option>
              <option>Bottom Center</option><option>Top Right</option><option>Top Left</option>
            </select>
          </div>
        </>
      );
    },
    actionLabel: "Sign PDF", resultName: "Signed.pdf",
  },
  "ai-translate": {
    title: "AI TRANSLATE", desc: "Translate PDF content to target language.",
    multi: false, accept: ".pdf", acceptLabel: "PDF file", num: "20",
    howItWorks: [{ title: "Upload", desc: "Select PDF." }, { title: "Choose language", desc: "Pick target language." }, { title: "Download", desc: "Translated PDF." }],
    options: (state, set) => (
      <div className="option-group">
        <span className="option-label">Target Language</span>
        <select suppressHydrationWarning className="option-select" onChange={(e) => set((s) => ({ ...s, translateLang: e.target.value }))}>
          <option value="Hindi">Hindi</option>
          <option value="Spanish">Spanish</option>
          <option value="French">French</option>
          <option value="German">German</option>
          <option value="Chinese">Chinese (Simplified)</option>
          <option value="Japanese">Japanese</option>
          <option value="Arabic">Arabic</option>
          <option value="Portuguese">Portuguese</option>
          <option value="Russian">Russian</option>
          <option value="English">English</option>
        </select>
      </div>
    ),
    actionLabel: "Translate PDF", resultName: "Translated.pdf",
  },
  "ai-rewrite": {
    title: "AI REWRITE", desc: "Rewrite PDF content in a new tone or style.",
    multi: false, accept: ".pdf", acceptLabel: "PDF file", num: "21",
    howItWorks: [{ title: "Upload", desc: "Select PDF." }, { title: "Choose tone", desc: "Pick rewrite style." }, { title: "Download", desc: "Rewritten PDF." }],
    options: (state, set) => (
      <div className="option-group">
        <span className="option-label">Rewrite Tone</span>
        <div className="radio-group">
          {["Professional", "Casual", "Formal", "Simplified", "Academic"].map((t) => (
            <div key={t} className={`radio-row${state.rewriteTone === t ? " selected" : ""}`} onClick={() => set((s) => ({ ...s, rewriteTone: t }))}>
              <div className="radio-dot" /><span className="radio-label">{t}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    actionLabel: "Rewrite PDF", resultName: "Rewritten.pdf",
  },
  qr: {
    title: "QR GENERATOR", desc: "Generate a QR code from any URL or link.",
    multi: false, accept: "", acceptLabel: "no file needed", num: "22",
    howItWorks: [{ title: "Enter URL", desc: "Paste any link." }, { title: "Customise", desc: "Pick size & color." }, { title: "Download", desc: "PNG QR code." }],
    options: (state, set) => (
      <>
        <div className="option-group">
          <span className="option-label">Size</span>
          <select suppressHydrationWarning className="option-select" value={state.qrSize ?? "512×512"} onChange={(e) => set((s) => ({ ...s, qrSize: e.target.value }))}>
            <option>256×256</option><option>512×512</option><option>1024×1024</option>
          </select>
        </div>
        <div className="option-group">
          <span className="option-label">Format</span>
          <select suppressHydrationWarning className="option-select" value={state.qrFormat ?? "PNG"} onChange={(e) => set((s) => ({ ...s, qrFormat: e.target.value }))}>
            <option>PNG</option><option>SVG</option>
          </select>
        </div>
      </>
    ),
    actionLabel: "Generate QR Code", resultName: "QRCode.png",
  },
  qr2pdf: {
    title: "QR TO PDF", desc: "Embed a QR code into an existing PDF file.",
    multi: false, accept: ".pdf", acceptLabel: "PDF file", num: "23",
    howItWorks: [{ title: "Upload PDF", desc: "Select your PDF." }, { title: "Enter URL", desc: "Paste the link for QR." }, { title: "Download", desc: "PDF with embedded QR." }],
    options: (state, set) => (
      <>
        <div className="option-group">
          <span className="option-label">URL or Text for QR</span>
          <input suppressHydrationWarning className="option-input" placeholder="https://example.com"
            value={state.qr2pdfUrl ?? ""}
            onChange={(e) => set((s) => ({ ...s, qr2pdfUrl: e.target.value }))} />
        </div>
        <div className="option-group">
          <span className="option-label">Position on Page</span>
          <select suppressHydrationWarning className="option-select" value={state.qr2pdfPosition ?? "Bottom Right"} onChange={(e) => set((s) => ({ ...s, qr2pdfPosition: e.target.value }))}>
            <option>Bottom Right</option><option>Bottom Left</option>
            <option>Top Right</option><option>Top Left</option><option>Center</option>
          </select>
        </div>
        <div className="option-group">
          <span className="option-label">QR Size</span>
          <select suppressHydrationWarning className="option-select" value={state.qr2pdfSize ?? "Medium"} onChange={(e) => set((s) => ({ ...s, qr2pdfSize: e.target.value }))}>
            <option>Small</option><option>Medium</option><option>Large</option>
          </select>
        </div>
        <div className="option-group">
          <span className="option-label">Apply to Pages</span>
          <select suppressHydrationWarning className="option-select" value={state.qr2pdfPages ?? "All Pages"} onChange={(e) => set((s) => ({ ...s, qr2pdfPages: e.target.value }))}>
            <option>All Pages</option><option>First Page Only</option><option>Last Page Only</option><option>Custom Range</option>
          </select>
        </div>
      </>
    ),
    actionLabel: "Embed QR in PDF", resultName: "QR_Embedded.pdf",
  },
};

const emptyOptions = () => null;

const numberInput = (
  label: string,
  value: number | undefined,
  fallback: number,
  onChange: (value: number) => void
) => (
  <div className="option-group">
    <span className="option-label">{label}</span>
    <input suppressHydrationWarning
      className="option-input"
      type="number"
      value={value ?? fallback}
      onChange={(e) => onChange(parseInt(e.target.value || `${fallback}`, 10))}
    />
  </div>
);

type NewToolDef = {
  id: string;
  title: string;
  desc: string;
  accept: string;
  acceptLabel: string;
  actionLabel: string;
  resultName: string;
  endpoint: string;
  category: "file" | "text";
  options?: ToolConfig["options"];
  payload?: (fileId: number, state: ToolState) => Record<string, unknown>;
  textPayload?: (state: ToolState) => Record<string, unknown>;
};

const NEW_TOOL_DEFS: NewToolDef[] = [
  { id: "pdf2text", title: "PDF TO TEXT", desc: "Extract text from a PDF into a .txt file.", accept: ".pdf", acceptLabel: "PDF file", actionLabel: "Extract Text", resultName: "Extracted.txt", endpoint: "pdf-to-text", category: "file" },
  { id: "excel2csv", title: "EXCEL TO CSV", desc: "Convert spreadsheet rows into CSV.", accept: ".xls,.xlsx", acceptLabel: "Excel file", actionLabel: "Convert to CSV", resultName: "Spreadsheet.csv", endpoint: "excel-to-csv", category: "file" },
  { id: "excel2json", title: "EXCEL TO JSON", desc: "Convert spreadsheet rows into JSON records.", accept: ".xls,.xlsx", acceptLabel: "Excel file", actionLabel: "Convert to JSON", resultName: "Spreadsheet.json", endpoint: "excel-to-json", category: "file" },
  { id: "word2txt", title: "WORD TO TXT", desc: "Convert Word content to plain text.", accept: ".doc,.docx", acceptLabel: "Word file", actionLabel: "Convert to TXT", resultName: "Document.txt", endpoint: "word-to-txt", category: "file" },
  { id: "word2html", title: "WORD TO HTML", desc: "Convert Word content to HTML.", accept: ".doc,.docx", acceptLabel: "Word file", actionLabel: "Convert to HTML", resultName: "Document.html", endpoint: "word-to-html", category: "file" },
  { id: "word2markdown", title: "WORD TO MARKDOWN", desc: "Convert Word content to Markdown.", accept: ".doc,.docx", acceptLabel: "Word file", actionLabel: "Convert to Markdown", resultName: "Document.md", endpoint: "word-to-markdown", category: "file" },
  { id: "jpg2png", title: "JPG TO PNG", desc: "Convert JPG images to PNG.", accept: ".jpg,.jpeg", acceptLabel: "JPG image", actionLabel: "Convert to PNG", resultName: "Image.png", endpoint: "jpg-to-png", category: "file" },
  { id: "png2jpg", title: "PNG TO JPG", desc: "Convert PNG images to JPG.", accept: ".png", acceptLabel: "PNG image", actionLabel: "Convert to JPG", resultName: "Image.jpg", endpoint: "png-to-jpg", category: "file" },
  { id: "png2webp", title: "PNG TO WEBP", desc: "Convert PNG images to WebP.", accept: ".png", acceptLabel: "PNG image", actionLabel: "Convert to WebP", resultName: "Image.webp", endpoint: "png-to-webp", category: "file" },
  { id: "webp2jpg", title: "WEBP TO JPG", desc: "Convert WebP images to JPG.", accept: ".webp", acceptLabel: "WebP image", actionLabel: "Convert to JPG", resultName: "Image.jpg", endpoint: "webp-to-jpg", category: "file" },
  { id: "json2csv", title: "JSON TO CSV", desc: "Convert JSON data to CSV.", accept: ".json", acceptLabel: "JSON file", actionLabel: "Convert to CSV", resultName: "Data.csv", endpoint: "json-to-csv", category: "file" },
  { id: "csv2json", title: "CSV TO JSON", desc: "Convert CSV rows to JSON.", accept: ".csv", acceptLabel: "CSV file", actionLabel: "Convert to JSON", resultName: "Data.json", endpoint: "csv-to-json", category: "file" },
  { id: "json2xml", title: "JSON TO XML", desc: "Convert JSON data to XML.", accept: ".json", acceptLabel: "JSON file", actionLabel: "Convert to XML", resultName: "Data.xml", endpoint: "json-to-xml", category: "file" },
  { id: "xml2json", title: "XML TO JSON", desc: "Convert XML data to JSON.", accept: ".xml", acceptLabel: "XML file", actionLabel: "Convert to JSON", resultName: "Data.json", endpoint: "xml-to-json", category: "file" },
  { id: "yaml2json", title: "YAML TO JSON", desc: "Convert YAML data to JSON.", accept: ".yaml,.yml", acceptLabel: "YAML file", actionLabel: "Convert to JSON", resultName: "Data.json", endpoint: "yaml-to-json", category: "file" },
  { id: "pdf2png", title: "PDF TO PNG", desc: "Convert PDF pages to PNG images.", accept: ".pdf", acceptLabel: "PDF file", actionLabel: "Convert to PNG", resultName: "PDF_PNG.zip", endpoint: "pdf-to-png", category: "file", options: (s, set) => numberInput("DPI", s.dpi, 200, (dpi) => set((p) => ({ ...p, dpi }))), payload: (fileId, s) => ({ file_id: fileId, dpi: s.dpi ?? 200 }) },
  { id: "pdf2html", title: "PDF TO HTML", desc: "Convert PDF text layout to HTML.", accept: ".pdf", acceptLabel: "PDF file", actionLabel: "Convert to HTML", resultName: "Document.html", endpoint: "pdf-to-html", category: "file" },
  { id: "ppt2images", title: "PPT TO IMAGES", desc: "Export presentation slides as images.", accept: ".ppt,.pptx", acceptLabel: "PowerPoint file", actionLabel: "Export Images", resultName: "Slides.zip", endpoint: "ppt-to-images", category: "file", options: (s, set) => numberInput("DPI", s.dpi, 200, (dpi) => set((p) => ({ ...p, dpi }))), payload: (fileId, s) => ({ file_id: fileId, dpi: s.dpi ?? 200 }) },
  { id: "image2text", title: "IMAGE TO TEXT", desc: "Extract text from an image.", accept: ".jpg,.jpeg,.png,.webp,.bmp,.tiff,.tif", acceptLabel: "image", actionLabel: "Extract Text", resultName: "Image_Text.txt", endpoint: "image-to-text", category: "file", payload: (fileId, s) => ({ file_id: fileId, language: s.ocrLanguage ?? "eng" }) },
  { id: "screenshot2text", title: "SCREENSHOT TO TEXT", desc: "Extract text from a screenshot.", accept: ".jpg,.jpeg,.png,.webp", acceptLabel: "screenshot", actionLabel: "Extract Text", resultName: "Screenshot_Text.txt", endpoint: "screenshot-to-text", category: "file", payload: (fileId, s) => ({ file_id: fileId, language: s.ocrLanguage ?? "eng" }) },
  { id: "handwriting2text", title: "HANDWRITING TO TEXT", desc: "Extract text from handwriting images.", accept: ".jpg,.jpeg,.png,.webp", acceptLabel: "handwriting image", actionLabel: "Extract Text", resultName: "Handwriting_Text.txt", endpoint: "handwriting-to-text", category: "file", payload: (fileId, s) => ({ file_id: fileId, language: s.ocrLanguage === "eng" ? "en" : "en" }) },
  { id: "compressjpg", title: "COMPRESS JPG", desc: "Reduce JPG image size.", accept: ".jpg,.jpeg", acceptLabel: "JPG image", actionLabel: "Compress JPG", resultName: "Compressed.jpg", endpoint: "compress-jpg", category: "file", options: (s, set) => numberInput("Quality", s.imageQuality, 75, (imageQuality) => set((p) => ({ ...p, imageQuality }))), payload: (fileId, s) => ({ file_id: fileId, quality: s.imageQuality ?? 75 }) },
  { id: "compresspng", title: "COMPRESS PNG", desc: "Optimize PNG image size.", accept: ".png", acceptLabel: "PNG image", actionLabel: "Compress PNG", resultName: "Compressed.png", endpoint: "compress-png", category: "file" },
  { id: "compresswebp", title: "COMPRESS WEBP", desc: "Reduce WebP image size.", accept: ".webp", acceptLabel: "WebP image", actionLabel: "Compress WebP", resultName: "Compressed.webp", endpoint: "compress-webp", category: "file", options: (s, set) => numberInput("Quality", s.imageQuality, 75, (imageQuality) => set((p) => ({ ...p, imageQuality }))), payload: (fileId, s) => ({ file_id: fileId, quality: s.imageQuality ?? 75 }) },
  { id: "resizeimage", title: "RESIZE IMAGE", desc: "Resize an image to exact dimensions.", accept: ".jpg,.jpeg,.png,.webp", acceptLabel: "image", actionLabel: "Resize Image", resultName: "Resized.png", endpoint: "resize-image", category: "file", options: (s, set) => <>{numberInput("Width", s.resizeWidth, 1024, (resizeWidth) => set((p) => ({ ...p, resizeWidth })))}{numberInput("Height", s.resizeHeight, 1024, (resizeHeight) => set((p) => ({ ...p, resizeHeight })))}</>, payload: (fileId, s) => ({ file_id: fileId, width: s.resizeWidth ?? 1024, height: s.resizeHeight ?? 1024 }) },
  { id: "downscaleimage", title: "DOWNSCALE IMAGE", desc: "Shrink an image within max dimensions.", accept: ".jpg,.jpeg,.png,.webp", acceptLabel: "image", actionLabel: "Downscale Image", resultName: "Downscaled.png", endpoint: "downscale-image", category: "file", options: (s, set) => <>{numberInput("Max Width", s.downscaleMaxWidth, 1024, (downscaleMaxWidth) => set((p) => ({ ...p, downscaleMaxWidth })))}{numberInput("Max Height", s.downscaleMaxHeight, 1024, (downscaleMaxHeight) => set((p) => ({ ...p, downscaleMaxHeight })))}</>, payload: (fileId, s) => ({ file_id: fileId, max_width: s.downscaleMaxWidth ?? 1024, max_height: s.downscaleMaxHeight ?? 1024 }) },
  { id: "cropimage", title: "CROP IMAGE", desc: "Crop an image by position and size.", accept: ".jpg,.jpeg,.png,.webp", acceptLabel: "image", actionLabel: "Crop Image", resultName: "Cropped.png", endpoint: "crop-image", category: "file", options: (s, set) => <>{numberInput("Left", s.cropLeft, 0, (cropLeft) => set((p) => ({ ...p, cropLeft })))}{numberInput("Top", s.cropTop, 0, (cropTop) => set((p) => ({ ...p, cropTop })))}{numberInput("Width", s.cropWidth, 512, (cropWidth) => set((p) => ({ ...p, cropWidth })))}{numberInput("Height", s.cropHeight, 512, (cropHeight) => set((p) => ({ ...p, cropHeight })))}</>, payload: (fileId, s) => ({ file_id: fileId, left: s.cropLeft ?? 0, top: s.cropTop ?? 0, width: s.cropWidth ?? 512, height: s.cropHeight ?? 512 }) },
  { id: "circlecrop", title: "CIRCLE CROP", desc: "Crop an image into a transparent circle.", accept: ".jpg,.jpeg,.png,.webp", acceptLabel: "image", actionLabel: "Circle Crop", resultName: "Circle_Crop.png", endpoint: "circle-crop", category: "file" },
  { id: "removebackground", title: "REMOVE BACKGROUND", desc: "Remove the background from an image.", accept: ".jpg,.jpeg,.png,.webp", acceptLabel: "image", actionLabel: "Remove Background", resultName: "No_Background.png", endpoint: "remove-background", category: "file" },
  { id: "transparentbackground", title: "TRANSPARENT BACKGROUND", desc: "Create a transparent-background cutout.", accept: ".jpg,.jpeg,.png,.webp", acceptLabel: "image", actionLabel: "Make Transparent", resultName: "Transparent.png", endpoint: "transparent-background", category: "file" },
  { id: "replacebackground", title: "REPLACE BACKGROUND", desc: "Replace image background with a solid color.", accept: ".jpg,.jpeg,.png,.webp", acceptLabel: "image", actionLabel: "Replace Background", resultName: "Background_Replaced.png", endpoint: "replace-background", category: "file", options: (s, set) => <div className="option-group"><span className="option-label">Background Color</span><input suppressHydrationWarning className="option-input" value={s.backgroundColor ?? "#ffffff"} onChange={(e) => set((p) => ({ ...p, backgroundColor: e.target.value }))} /></div>, payload: (fileId, s) => ({ file_id: fileId, background_color: s.backgroundColor ?? "#ffffff" }) },
  { id: "smartcrop", title: "SMART CROP", desc: "Crop around the important content.", accept: ".jpg,.jpeg,.png,.webp", acceptLabel: "image", actionLabel: "Smart Crop", resultName: "Smart_Crop.png", endpoint: "smart-crop", category: "file", options: (s, set) => <>{numberInput("Width", s.smartCropWidth, 1024, (smartCropWidth) => set((p) => ({ ...p, smartCropWidth })))}{numberInput("Height", s.smartCropHeight, 1024, (smartCropHeight) => set((p) => ({ ...p, smartCropHeight })))}</>, payload: (fileId, s) => ({ file_id: fileId, width: s.smartCropWidth ?? 1024, height: s.smartCropHeight ?? 1024 }) },
  { id: "upscaleimage", title: "UPSCALE IMAGE", desc: "Upscale images with Real-ESRGAN.", accept: ".jpg,.jpeg,.png,.webp", acceptLabel: "image", actionLabel: "Upscale Image", resultName: "Upscaled.png", endpoint: "upscale-image", category: "file", options: (s, set) => <><div className="option-group"><span className="option-label">Scale</span><select suppressHydrationWarning className="option-select" value={String(s.upscaleScale ?? 2)} onChange={(e) => set((p) => ({ ...p, upscaleScale: parseInt(e.target.value, 10) }))}><option value="2">2x</option><option value="3">3x</option><option value="4">4x</option></select></div><div className="option-group"><span className="option-label">Model</span><select suppressHydrationWarning className="option-select" value={s.upscaleModel ?? "general"} onChange={(e) => set((p) => ({ ...p, upscaleModel: e.target.value }))}><option value="general">General</option><option value="soft">Soft</option><option value="anime">Anime</option><option value="anime_fast">Anime Fast</option></select></div></>, payload: (fileId, s) => ({ file_id: fileId, scale: s.upscaleScale ?? 2, model: s.upscaleModel ?? "general" }) },
  { id: "image2cartoon", title: "IMAGE TO CARTOON", desc: "Apply a cartoon-style effect.", accept: ".jpg,.jpeg,.png,.webp", acceptLabel: "image", actionLabel: "Create Cartoon", resultName: "Cartoon.png", endpoint: "image-to-cartoon", category: "file" },
  { id: "image2sketch", title: "IMAGE TO SKETCH", desc: "Turn an image into a sketch.", accept: ".jpg,.jpeg,.png,.webp", acceptLabel: "image", actionLabel: "Create Sketch", resultName: "Sketch.png", endpoint: "image-to-sketch", category: "file" },
  { id: "image2anime", title: "IMAGE TO ANIME", desc: "Create an anime-style image effect.", accept: ".jpg,.jpeg,.png,.webp", acceptLabel: "image", actionLabel: "Create Anime", resultName: "Anime.png", endpoint: "image-to-anime", category: "file" },
  { id: "image2avatar", title: "IMAGE TO AVATAR", desc: "Stylize a face image into an avatar.", accept: ".jpg,.jpeg,.png,.webp", acceptLabel: "portrait image", actionLabel: "Create Avatar", resultName: "Avatar.png", endpoint: "image-to-avatar", category: "file" },
  { id: "pdf2ppt", title: "PDF TO PPT", desc: "Convert PDF pages into image-based slides.", accept: ".pdf", acceptLabel: "PDF file", actionLabel: "Convert to PPT", resultName: "Presentation.pptx", endpoint: "pdf-to-ppt", category: "file", options: (s, set) => numberInput("DPI", s.dpi, 200, (dpi) => set((p) => ({ ...p, dpi }))), payload: (fileId, s) => ({ file_id: fileId, dpi: s.dpi ?? 200 }) },
  { id: "pdf2epub", title: "PDF TO EPUB", desc: "Convert a PDF into an EPUB ebook.", accept: ".pdf", acceptLabel: "PDF file", actionLabel: "Convert to EPUB", resultName: "Book.epub", endpoint: "pdf-to-epub", category: "file" },
  { id: "epub2pdf", title: "EPUB TO PDF", desc: "Convert an EPUB ebook to PDF.", accept: ".epub", acceptLabel: "EPUB file", actionLabel: "Convert to PDF", resultName: "Book.pdf", endpoint: "epub-to-pdf", category: "file" },
  { id: "mobi2epub", title: "MOBI TO EPUB", desc: "Convert MOBI ebooks to EPUB.", accept: ".mobi", acceptLabel: "MOBI file", actionLabel: "Convert to EPUB", resultName: "Book.epub", endpoint: "mobi-to-epub", category: "file" },
  { id: "azw32pdf", title: "AZW3 TO PDF", desc: "Convert AZW3 ebooks to PDF.", accept: ".azw3", acceptLabel: "AZW3 file", actionLabel: "Convert to PDF", resultName: "Book.pdf", endpoint: "azw3-to-pdf", category: "file" },
  { id: "upper2lower", title: "UPPERCASE TO LOWERCASE", desc: "Convert text to lowercase.", accept: "", acceptLabel: "text", actionLabel: "Convert Text", resultName: "Text.txt", endpoint: "uppercase-to-lowercase", category: "text" },
  { id: "lower2upper", title: "LOWERCASE TO UPPERCASE", desc: "Convert text to uppercase.", accept: "", acceptLabel: "text", actionLabel: "Convert Text", resultName: "Text.txt", endpoint: "lowercase-to-uppercase", category: "text" },
  { id: "titlecase", title: "TEXT TO TITLE CASE", desc: "Convert text to title case.", accept: "", acceptLabel: "text", actionLabel: "Convert Text", resultName: "Title_Case.txt", endpoint: "text-to-title-case", category: "text" },
  { id: "text2base64", title: "TEXT TO BASE64", desc: "Encode text as Base64.", accept: "", acceptLabel: "text", actionLabel: "Encode Text", resultName: "Base64.txt", endpoint: "text-to-base64", category: "text" },
  { id: "base642text", title: "BASE64 TO TEXT", desc: "Decode Base64 into text.", accept: "", acceptLabel: "text", actionLabel: "Decode Text", resultName: "Decoded.txt", endpoint: "base64-to-text", category: "text" },
  { id: "urlencode", title: "URL ENCODE", desc: "Encode text for URLs.", accept: "", acceptLabel: "text", actionLabel: "Encode URL", resultName: "Url_Encoded.txt", endpoint: "url-encode", category: "text" },
  { id: "urldecode", title: "URL DECODE", desc: "Decode URL-encoded text.", accept: "", acceptLabel: "text", actionLabel: "Decode URL", resultName: "Url_Decoded.txt", endpoint: "url-decode", category: "text" },
];

const NEW_TOOL_MAP = Object.fromEntries(
  NEW_TOOL_DEFS.map((tool) => [tool.id, tool])
) as Record<string, NewToolDef>;

const TEXT_TOOL_IDS = new Set(
  NEW_TOOL_DEFS.filter((tool) => tool.category === "text").map((tool) => tool.id)
);

const NO_UPLOAD_TOOL_IDS = new Set(["qr", ...TEXT_TOOL_IDS]);

Object.assign(
  CFGS,
  Object.fromEntries(
    NEW_TOOL_DEFS.map((tool, index) => [
      tool.id,
      {
        title: tool.title,
        desc: tool.desc,
        multi: false,
        accept: tool.accept,
        acceptLabel: tool.acceptLabel,
        num: String(24 + index).padStart(2, "0"),
        howItWorks: tool.category === "text"
          ? [{ title: "Enter text", desc: "Paste your text." }, { title: "Process", desc: "Run the utility." }, { title: "Download", desc: "Get the result." }]
          : [{ title: "Upload", desc: `Select your ${tool.acceptLabel}.` }, { title: "Process", desc: "We convert it securely." }, { title: "Download", desc: "Get the result." }],
        options: tool.options ?? emptyOptions,
        actionLabel: tool.actionLabel,
        resultName: tool.resultName,
      } satisfies ToolConfig,
    ])
  )
);

export default function ToolPage({ params }: { params: Promise<{ toolId: string }> }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toolId } = use(params);
  const cfg = CFGS[toolId];
  const tool = tools.find((t) => t.id === toolId);

  // ── Auth guard ──────────────────────────────────────────────
  // const { isAuthenticated, isLoading: authLoading } = useAuth();

  // useEffect(() => {
  //   if (!authLoading && !isAuthenticated) {
  //     router.push(`/signin?next=${encodeURIComponent(`/tools/${toolId}`)}`);
  //   }
  // }, [authLoading, isAuthenticated, router, toolId]);
  // ────────────────────────────────────────────────────────────

  const [files, setFiles] = useState<FileEntry[]>([]);

  const [state, setState] = useState<ToolState>({
    // rotation is a number (270 = left 90°, 90 = right 90°, 180 = 180°)
    splitMode: "Split by page range", rotation: 270, wmTab: "Text",
    pageNumPos: "Bottom Center",
    signType: "typed", signText: "", signFont: "Caveat", signPosition: "Bottom Right",
    signPassword: "", signReason: "",
    translateLang: "Hindi", rewriteTone: "Professional",
    qrUrl: "", qrSize: "512×512", qrFormat: "PNG",
    qr2pdfUrl: "", qr2pdfPosition: "Bottom Right", qr2pdfSize: "Medium", qr2pdfPages: "All Pages",
    organizeMode: "Reorder Pages",
    textValue: "",
    imageQuality: 75,
    resizeWidth: 1024, resizeHeight: 1024,
    downscaleMaxWidth: 1024, downscaleMaxHeight: 1024,
    cropLeft: 0, cropTop: 0, cropWidth: 512, cropHeight: 512,
    backgroundColor: "#ffffff",
    smartCropWidth: 1024, smartCropHeight: 1024,
    dpi: 200,
    upscaleScale: 2, upscaleModel: "general",
  });
  const [pState, setPState] = useState<"idle" | "processing" | "complete" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [progress, setProgress] = useState(0);
  const [curStep, setCurStep] = useState(0);
  const [isDrag, setIsDrag] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const preloadedRef = useRef(false);

  // ── Pre-load file from ?file_id= query param (e.g. after home-page upload) ──
  useEffect(() => {
    if (preloadedRef.current) return;
    const fileIdParam = searchParams.get("file_id");
    if (!fileIdParam) return;
    const fileId = parseInt(fileIdParam, 10);
    if (isNaN(fileId)) return;

    preloadedRef.current = true;
    const mockFile = new File([], "uploaded-file");
    setTimeout(() => {
      setFiles([{
        file: mockFile,
        id: `preloaded-${fileId}`,
        name: "Uploaded file",
        size: "-",
        pages: "-",
        preloadedFileId: fileId,
      }]);
    }, 0);
  }, [searchParams]);
  // ──────────────────────────────────────────────────────────

  // Cleanup object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (downloadUrl.startsWith("blob:")) {
        window.URL.revokeObjectURL(downloadUrl);
      }
    };
  }, [downloadUrl]);

  const handleFiles = useCallback((fl: FileList | null) => {
    if (!fl) return;
    const arr = Array.from(fl).map((f) => ({
      file: f,
      id: Math.random().toString(36).slice(2),
      name: f.name,
      size: (f.size / 1024 / 1024).toFixed(1) + " MB",
      pages: `${Math.floor(Math.random() * 20) + 1} pages`,
    }));

    setFiles((p) => (cfg?.multi ? [...p, ...arr] : arr.slice(0, 1)));
  }, [cfg?.multi]);

  const startProcessing = async () => {
    if (!NO_UPLOAD_TOOL_IDS.has(toolId) && !files.length) return;
    if (toolId === "qr" && !state.qrUrl?.trim()) return;
    if (TEXT_TOOL_IDS.has(toolId) && !state.textValue?.trim()) return;
    if (toolId === "qr2pdf" && (!files.length || !state.qr2pdfUrl?.trim())) return;
    if (toolId === "merge" && files.length < 2) {
      alert("Please upload at least 2 files to merge");
      return;
    }
    try {
      setPState("processing");
      setErrorMsg("");
      setProgress(0);
      setCurStep(1); // Uploading
      let result;
      if (toolId === "qr") {
        setTimeout(() => {
          const sizeMap: Record<string, string> = { "256×256": "256x256", "512×512": "512x512", "1024×1024": "1024x1024" };
          const px = sizeMap[state.qrSize ?? "512×512"] ?? "512x512";
          const url = state.qrUrl || "https://example.com";
          const fmt = (state.qrFormat ?? "PNG").toLowerCase();
          const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${px}&data=${encodeURIComponent(url)}&format=${fmt}`;
          setProgress(100); setCurStep(4);
          setDownloadUrl(qrApiUrl);
          setPState("complete");
        }, 1200);
        return;
      } else if (TEXT_TOOL_IDS.has(toolId)) {
        const textTool = NEW_TOOL_MAP[toolId];
        if (!textTool) throw new Error(`Tool ${toolId} not implemented`);
        setCurStep(2);
        result = await runTool(
          textTool.endpoint,
          textTool.textPayload
            ? textTool.textPayload(state)
            : { text: state.textValue ?? "" }
        );
      } else {
        // For pre-loaded files, skip re-upload and use existing file_id directly
        let fileIds: number[];
        if (files.length === 1 && files[0].preloadedFileId !== undefined) {
          fileIds = [files[0].preloadedFileId];
        } else if (files.every((f) => f.preloadedFileId !== undefined)) {
          fileIds = files.map((f) => f.preloadedFileId as number);
        } else {
          const uploadedFiles = await Promise.all(
            files.map((f) =>
              f.preloadedFileId !== undefined
                ? Promise.resolve({ file_id: f.preloadedFileId })
                : uploadFile(f.file)
            )
          );
          fileIds = uploadedFiles.map((f) => f.file_id);
        }

        setCurStep(2); // Processing

        const newTool = NEW_TOOL_MAP[toolId];
        if (newTool) {
          result = await runTool(
            newTool.endpoint,
            newTool.payload
              ? newTool.payload(fileIds[0], state)
              : { file_id: fileIds[0] }
          );
        } else {
          switch (toolId) {
            case "merge":          result = await mergePdf(fileIds); break;
            case "split":          result = await splitPdf(fileIds[0]); break;
            case "compress":       result = await compressPdf(fileIds[0], state.compressionPercent ?? 50); break;
            case "protect":        result = await protectPdf(fileIds[0], state.password ?? ""); break;
            case "unlock":         result = await unlockPdf(fileIds[0], state.password ?? ""); break;
            case "pdf2jpg":        result = await pdfToJpg(fileIds[0]); break;
            case "jpg2pdf":        result = await jpgToPdf(fileIds); break;
            case "ocr":            result = await ocrPdf(fileIds[0], state.ocrLanguage ?? "eng"); break;
            case "rotate":         result = await rotatePdf(fileIds[0], state.rotation ?? 270); break;
            case "watermark":      result = await watermarkPdf(fileIds[0], state.watermarkText ?? ""); break;
            case "organize":       result = await organizePdf(fileIds[0], [1]); break;
            case "ai":             result = await aiSummarize(fileIds[0]); break;
            case "addPageNumbers": result = await addPageNumbers(fileIds[0]); break;
            case "word2pdf":       result = await wordToPdf(fileIds[0]); break;
            case "pdf2word":       result = await pdfToWord(fileIds[0]); break;
            case "excel2pdf":      result = await excelToPdf(fileIds[0]); break;
            case "pdf2excel":      result = await pdfToExcel(fileIds[0]); break;
            case "ppt2pdf":        result = await pptToPdf(fileIds[0]); break;
            case "sign":
              result = await signPdf({
                pdfFileId: fileIds[0],
                mode: state.signType === "stamp" ? "image" : state.signType === "digital" ? "digital" : "typed",
                signatureText: state.signText,
                signatureFileId: state.stampFileId,
                certificateFileId: state.certFileId,
                password: state.signPassword,
              });
              break;
            case "ai-translate":   result = await aiTranslate(fileIds[0], state.translateLang || "Hindi"); break;
            case "ai-rewrite":     result = await aiRewrite(fileIds[0], state.rewriteTone || "Professional"); break;
            case "qr2pdf":         result = await qrToPdf(fileIds[0], state.qr2pdfUrl ?? ""); break;
            default: throw new Error(`Tool ${toolId} not implemented`);
          }
        }
      }

      setCurStep(3); // Queued/Polling

      const interval = setInterval(async () => {
        try {
          const status = await getJobStatus(result.job_id);

          if (status.status === "completed") {
            clearInterval(interval);
            setProgress(100);
            setCurStep(4);
            if (status.download_url) {
              setDownloadUrl(status.download_url);
              setPState("complete");
              return;
            }
            try {
              const dlResult = await downloadJobResult(result.job_id);
              const objectUrl = window.URL.createObjectURL(dlResult.blob);

            
              

              setDownloadUrl(objectUrl);
              setPState("complete");
            } catch (dlErr) {
              console.error("Failed to download job result", dlErr);
              setErrorMsg("Processing succeeded but download failed. Please try again.");
              setPState("error");
            }
          } else if (status.status === "failed") {
            clearInterval(interval);
            setErrorMsg("The processing job failed. Please try again.");
            setPState("error");
          } else {
            // Fake progress while polling
            setProgress((p) => Math.min(p + 15, 95));
          }
        } catch (err) {
          console.error("Polling error", err);
        }
      }, 2000);
    } catch (error: unknown) {
      console.error(error);
      // Extract a readable error message from axios error
      const axiosError = error as { response?: { data?: { detail?: string }; status?: number } };
      let msg = "Something went wrong. Please try again.";
      if (axiosError?.response?.status === 401) {
        msg = "Session expired. Please sign in again.";
        router.push(`/signin?next=${encodeURIComponent(`/tools/${toolId}`)}`);
      } else if (axiosError?.response?.data?.detail) {
        msg = axiosError.response.data.detail;
      }
      setErrorMsg(msg);
      setPState("error");
    }
  };

  // Show loading spinner while auth is being determined
  // // if (authLoading) {
  // //   return (
  // //     <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
  // //       <div style={{ textAlign: "center" }}>
  // //         <div style={{
  // //           width: 40, height: 40, border: "3px solid var(--border)",
  // //           borderTopColor: "var(--text)", borderRadius: "50%",
  // //           animation: "spin 0.8s linear infinite", margin: "0 auto 12px"
  // //         }} />
  // //         <div style={{ fontSize: 14, color: "var(--muted)" }}>Loading…</div>
  // //       </div>
  // //     </div>
  // //   );
  // }

  // // Don't render content while redirect is happening
  // if (!isAuthenticated) {
  //   return null;
  // }

  // if (!cfg || !tool) {
  //   return (
  //     <div className="tool-page">
  //       <div className="tools-sidebar">
  //         {sidebarCats.map((c) => (
  //           <Link key={c.id} href={c.id === "all" ? "/" : `/tools/${tools.find(t => t.category === c.id)?.id || "merge"}`} className="sidebar-link">
  //             <SvgIcon d={c.icon} size={14} />{c.label}
  //           </Link>
  //         ))}
  //       </div>
  //       <div className="tool-main" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
  //         <div style={{ textAlign: "center" }}>
  //           <p style={{ color: "var(--muted)", marginBottom: 16 }}>Tool not found.</p>
  //           <button suppressHydrationWarning className="btn btn-dark" onClick={() => router.push("/")}>Go Home</button>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  const stepLabels = ["Uploading", "Queued", "Processing", "Finalizing", "Done"];

  return (
    <div className="tool-page">
      {/* Sidebar */}
      <div className="tools-sidebar">
        {sidebarCats.map((c) => (
          <Link
            key={c.id}
            href={c.id === "all" ? "/" : `/tools/${tools.find(t => t.category === c.id)?.id || "merge"}`}
            className="sidebar-link"
          >
            <SvgIcon d={c.icon} size={14} />{c.label}
          </Link>
        ))}
      </div>

      {/* Main */}
      <div className="tool-main">
        <button suppressHydrationWarning className="btn btn-ghost btn-sm" style={{ marginBottom: 24, paddingLeft: 0 }} onClick={() => router.back()}>
          <SvgIcon d="M19 12H5M12 19l-7-7 7-7" size={14} />Back
        </button>

        <h1 className="tool-title">{cfg.title}</h1>
        <p className="tool-desc">{cfg.desc}</p>

        {pState === "idle" && (
          <div className="tool-layout">
            <div>
              {/* Upload zone — hidden for QR generator */}
              {!NO_UPLOAD_TOOL_IDS.has(toolId) && (
              <div
                className={`upload-zone${isDrag ? " drag-over" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setIsDrag(true); }}
                onDragLeave={() => setIsDrag(false)}
                onDrop={(e) => { e.preventDefault(); setIsDrag(false); handleFiles(e.dataTransfer.files); }}
                onClick={() => fileInput.current?.click()}
              >
                <div className="upload-zone-icon">
                  <SvgIcon d={["M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z","M14 2v6h6","M9 15l2 2 4-4"]} size={40} />
                </div>
                <div className="upload-zone-title">Drag & drop your {cfg.acceptLabel} here</div>
                <div className="upload-zone-sub">or</div>
                <button suppressHydrationWarning className="btn btn-dark" onClick={(e) => { e.stopPropagation(); fileInput.current?.click(); }}>
                  Choose Files
                  <SvgIcon d="M6 9l6 6 6-6" size={13} />
                </button>
                <div className="upload-zone-note">Max file size: 100MB</div>
                <input suppressHydrationWarning
                  ref={fileInput}
                  type="file"
                  accept={cfg.accept}
                  multiple={cfg.multi}
                  style={{ display: "none" }}
                  onChange={(e) => handleFiles(e.target.files)}
                />
              </div>
              )}

              {/* QR Generator — URL input */}
              {TEXT_TOOL_IDS.has(toolId) && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{
                    background: "var(--bg-2)", border: "1px solid var(--border)",
                    borderRadius: "var(--radius-lg)", padding: "28px 24px",
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 12 }}>
                      Text
                    </div>
                    <textarea suppressHydrationWarning
                      className="option-input"
                      placeholder="Paste text here"
                      value={state.textValue ?? ""}
                      onChange={(e) => setState((s) => ({ ...s, textValue: e.target.value }))}
                      style={{ minHeight: 180, resize: "vertical", fontSize: 14 }}
                    />
                    {state.textValue?.trim() && (
                      <div style={{ marginTop: 10, fontSize: 11, color: "var(--accent-2)", display: "flex", alignItems: "center", gap: 5 }}>
                        <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                        Ready to process
                      </div>
                    )}
                  </div>

                  <button suppressHydrationWarning
                    className="btn btn-dark btn-block"
                    onClick={startProcessing}
                    disabled={!state.textValue?.trim()}
                    style={{ opacity: state.textValue?.trim() ? 1 : 0.5, cursor: state.textValue?.trim() ? "pointer" : "not-allowed" }}
                  >
                    {cfg.actionLabel}
                    <SvgIcon d="M5 12h14M12 5l7 7-7 7" size={14} />
                  </button>
                </div>
              )}

              {toolId === "qr" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{
                    background: "var(--bg-2)", border: "1px solid var(--border)",
                    borderRadius: "var(--radius-lg)", padding: "28px 24px",
                  }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 12 }}>
                      URL or Text to Encode
                    </div>
                    <div style={{ position: "relative" }}>
                      <input suppressHydrationWarning
                        className="option-input"
                        placeholder="https://example.com"
                        value={state.qrUrl ?? ""}
                        onChange={(e) => setState((s) => ({ ...s, qrUrl: e.target.value }))}
                        style={{ paddingLeft: 38, fontSize: 14, height: 44 }}
                        onKeyDown={(e) => { if (e.key === "Enter" && state.qrUrl?.trim()) startProcessing(); }}
                      />
                      <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--muted)"
                        strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round"
                        style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                      </svg>
                    </div>
                    {state.qrUrl && (
                      <div style={{ marginTop: 10, fontSize: 11, color: "var(--accent-2)", display: "flex", alignItems: "center", gap: 5 }}>
                        <svg width={11} height={11} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                        Ready to generate
                      </div>
                    )}
                  </div>

                  {/* Live QR preview */}
                  {state.qrUrl?.trim() && (
                    <div style={{
                      background: "var(--bg-2)", border: "1px solid var(--border)",
                      borderRadius: "var(--radius-lg)", padding: "20px", textAlign: "center",
                    }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 1.2, marginBottom: 14 }}>
                        Live Preview
                      </div>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(state.qrUrl)}&format=png`}
                        alt="QR Preview"
                        style={{ width: 160, height: 160, borderRadius: 8, background: "#fff", padding: 8, border: "1px solid var(--border)", margin: "0 auto" }}
                      />
                      <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 10 }}>
                        Adjust size & format in Options →
                      </div>
                    </div>
                  )}

                  <button suppressHydrationWarning
                    className="btn btn-dark btn-block"
                    onClick={startProcessing}
                    disabled={!state.qrUrl?.trim()}
                    style={{ opacity: state.qrUrl?.trim() ? 1 : 0.5, cursor: state.qrUrl?.trim() ? "pointer" : "not-allowed" }}
                  >
                    <SvgIcon d={["M3 3h7v7H3z","M14 3h7v7h-7z","M3 14h7v7H3z","M14 14h3v3h-3z","M17 17h3v3h-3z"]} size={15} />
                    Generate QR Code
                  </button>
                </div>
              )}

              {/* File list */}
              {files.length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <div className="files-panel-title">Files to {cfg.title.toLowerCase()} ({files.length})</div>
                  <div className="file-list">
                    {files.map((f, i) => (
                      <div key={f.id} className="file-row">
                        <div className="file-row-num">{String(i + 1).padStart(2, "0")}</div>
                        <div className="file-row-drag">
                          <SvgIcon d={["M9 6h6","M9 12h6","M9 18h6","M5 6h.01","M5 12h.01","M5 18h.01"]} size={13} />
                        </div>
                        <div className="file-row-info">
                          <div className="file-row-name">{f.name}</div>
                          <div className="file-row-meta">
                            {f.size} · {f.pages}
                            {f.preloadedFileId !== undefined && (
                              <span style={{
                                marginLeft: 8, padding: "1px 7px", borderRadius: 99,
                                fontSize: 10, fontWeight: 700, background: "var(--bg-3)",
                                color: "var(--accent-2)", border: "1px solid var(--border)",
                                verticalAlign: "middle",
                              }}>
                                pre-loaded
                              </span>
                            )}
                          </div>
                        </div>
                        <button suppressHydrationWarning
                          className="file-row-remove"
                          onClick={() => setFiles((p) => p.filter((x) => x.id !== f.id))}
                        >
                          <SvgIcon d="M18 6L6 18M6 6l12 12" size={13} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {cfg.multi && (
                    <button suppressHydrationWarning
                      className="btn btn-ghost btn-sm"
                      style={{ marginTop: 8 }}
                      onClick={() => fileInput.current?.click()}
                    >
                      <SvgIcon d={["M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4","M17 8l-5-5-5 5","M12 3v12"]} size={13} />
                      Add more files
                    </button>
                  )}

                  <div style={{ marginTop: 16 }}>
                    <button suppressHydrationWarning className="btn btn-dark btn-block" onClick={startProcessing}>
                      {cfg.actionLabel}
                      <SvgIcon d="M5 12h14M12 5l7 7-7 7" size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right: options */}
            <div>
              <div className="options-panel">
                <div className="options-panel-title">Options</div>
                <div className="options-body">{cfg.options(state, setState)}</div>
              </div>

              <div className="how-panel">
                <div className="how-panel-title">How it works</div>
                {cfg.howItWorks.map((s, i) => (
                  <div key={i} className="how-step">
                    <div className="how-step-num">{i + 1}</div>
                    <div className="how-step-text">
                      <h4>{s.title}</h4><p>{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="trust-note">
                <SvgIcon d={["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"]} size={14} stroke="var(--success)" />
                <p><strong>Secure.</strong> Files deleted after processing. 256-bit SSL encryption.</p>
              </div>
            </div>
          </div>
        )}

        {pState === "processing" && (
          <div className="state-card">
            <h2>Processing your file{files.length > 1 ? "s" : ""}…</h2>
            <p>Please wait a moment.</p>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <div className="progress-pct">{Math.round(progress)}%</div>
            <div className="steps-list">
              {stepLabels.map((l, i) => (
                <div key={l} className="step-row">
                  <div className={`step-circle${i < curStep ? " done" : i === curStep ? " active" : ""}`}>
                    {i < curStep && <SvgIcon d="M20 6L9 17l-5-5" size={9} strokeWidth={3} />}
                  </div>
                  <span className={`step-text${i < curStep ? " done" : i === curStep ? " active" : ""}`}>{l}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {pState === "complete" && (
          <div className="state-card">
            <div className="success-ring">
              <SvgIcon d="M20 6L9 17l-5-5" size={24} stroke="var(--success)" strokeWidth={2.5} />
            </div>
            <h2>Done! Your file is ready.</h2>
            <p>{toolId === "qr" ? "Your QR code has been generated." : toolId === "qr2pdf" ? "QR code embedded in your PDF." : "Your PDF has been processed successfully."}</p>

            {/* QR preview */}
            {toolId === "qr" && downloadUrl && (
              <div style={{ margin: "16px auto 24px", textAlign: "center" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={downloadUrl} alt="Generated QR Code"
                  style={{ width: 200, height: 200, border: "1px solid var(--border)", borderRadius: 10, background: "#fff", padding: 10, display: "block", margin: "0 auto" }} />
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 10 }}>
                  Encodes: <span style={{ color: "var(--text)", fontWeight: 500 }}>{state.qrUrl}</span>
                </div>
              </div>
            )}

            <div className="result-file-row">
              <SvgIcon d={["M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z","M14 2v6h6"]} size={20} stroke="var(--accent-2)" />
              <div>
                <div className="result-file-name">{cfg.resultName}</div>
                <div className="result-file-meta">Ready to download</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <button suppressHydrationWarning className="btn btn-dark btn-lg" onClick={() => window.open(downloadUrl, "_blank")}>
                <SvgIcon d={["M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4","M7 10l5 5 5-5","M12 15V3"]} size={15} />
                Download
              </button>
              <button suppressHydrationWarning className="btn btn-outline btn-lg" onClick={() => { setFiles([]); setPState("idle"); setProgress(0); setErrorMsg(""); }}>
                Process Another
              </button>
            </div>
          </div>
        )}

        {pState === "error" && (
          <div className="state-card">
            <div style={{ width: 56, height: 56, borderRadius: "50%", border: "2px solid var(--danger)", color: "var(--danger)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 24, fontWeight: 700 }}>!</div>
            <h2>Something went wrong.</h2>
            <p style={{ color: "var(--muted)", marginBottom: 8 }}>
              {errorMsg || "Please try again or contact support."}
            </p>
            <button suppressHydrationWarning className="btn btn-dark btn-lg" onClick={() => { setPState("idle"); setProgress(0); setErrorMsg(""); }}>Try Again</button>
          </div>
        )}
      </div>
    </div>
  );
}
