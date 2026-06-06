"use client";
import {
  mergePdf, splitPdf, compressPdf, protectPdf, unlockPdf,
  pdfToJpg, jpgToPdf, ocrPdf, uploadFile, getJobStatus,
  getDownloadUrl, rotatePdf, watermarkPdf, organizePdf, aiSummarize,
  addPageNumbers, wordToPdf, pdfToWord, excelToPdf, pdfToExcel,
  pptToPdf, signPdf, aiTranslate, aiRewrite,
} from "@/lib/pdfApi";
import { useState, useRef, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { tools } from "@/lib/data";
import { analyzeFile, DetectedFile } from "@/lib/fileDetect";
import SmartFileBanner from "@/components/SmartFileBanner";

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

interface ToolState { splitMode?: string; rotation?: string; wmTab?: string; pageNumPos?: string; signTab?: string; translateLang?: string; rewriteTone?: string; qrUrl?: string; }
interface FileEntry {
  file: File; id: string; name: string; size: string; pages?: string;
  detected?: DetectedFile;
}

interface ToolConfig {
  title: string; desc: string; multi: boolean;
  accept: string; acceptLabel: string; num: string;
  howItWorks: { title: string; desc: string }[];
  options: (state: ToolState, set: React.Dispatch<React.SetStateAction<ToolState>>) => React.ReactNode;
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
              <input className="option-input" style={{ width: 60 }} type="number" defaultValue={1} min={1} />
              <span style={{ fontSize: 12, color: "var(--muted)" }}>to</span>
              <input className="option-input" style={{ width: 60 }} type="number" defaultValue={5} min={1} />
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
    options: () => (
      <div className="option-group">
        <span className="option-label">Compression Level</span>
        <select className="option-select"><option>Recommended</option><option>Low</option><option>High</option><option>Extreme</option></select>
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
          <select className="option-select"><option>High</option><option>Medium</option><option>Low</option></select>
        </div>
        <div className="option-group">
          <span className="option-label">Pages</span>
          <select className="option-select"><option>All Pages</option><option>Custom</option></select>
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
          <select className="option-select"><option>Fit to image</option><option>A4</option><option>Letter</option></select>
        </div>
        <div className="option-group">
          <span className="option-label">Orientation</span>
          <select className="option-select"><option>Portrait</option><option>Landscape</option></select>
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
          {["Left 90°", "Right 90°"].map((r) => (
            <div key={r} className={`radio-row${state.rotation === r ? " selected" : ""}`} style={{ flex: 1 }} onClick={() => set((s) => ({ ...s, rotation: r }))}>
              <div className="radio-dot" /><span className="radio-label" style={{ fontSize: 12 }}>{r}</span>
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
            <button key={t} className={`tab-btn${state.wmTab === t ? " active" : ""}`} onClick={() => set((s) => ({ ...s, wmTab: t }))}>{t} Watermark</button>
          ))}
        </div>
        {state.wmTab !== "Image"
          ? <div className="option-group"><span className="option-label">Text</span><input className="option-input" placeholder="e.g. CONFIDENTIAL" /></div>
          : <div className="option-group"><span className="option-label">Image</span><button className="btn btn-outline btn-sm" style={{ width: "100%" }}>Choose Image</button></div>
        }
        <div className="option-group">
          <span className="option-label">Position</span>
          <select className="option-select"><option>Center</option><option>Top Left</option><option>Top Right</option><option>Bottom Left</option><option>Bottom Right</option></select>
        </div>
      </>
    ),
    actionLabel: "Add Watermark", resultName: "Watermarked.pdf",
  },
  unlock: {
    title: "UNLOCK", desc: "Remove password from protected PDF.",
    multi: false, accept: ".pdf", acceptLabel: "PDF file", num: "09",
    howItWorks: [{ title: "Upload", desc: "Select locked PDF." }, { title: "Password", desc: "Enter password." }, { title: "Download", desc: "Unlocked PDF." }],
    options: () => (
      <div className="option-group">
        <span className="option-label">Password</span>
        <input className="option-input" type="password" placeholder="Enter PDF password" />
      </div>
    ),
    actionLabel: "Unlock PDF", resultName: "Unlocked.pdf",
  },
  protect: {
    title: "PROTECT", desc: "Password protect your PDF file.",
    multi: false, accept: ".pdf", acceptLabel: "PDF file", num: "10",
    howItWorks: [{ title: "Upload", desc: "Select PDF." }, { title: "Set password", desc: "Choose password." }, { title: "Download", desc: "Protected PDF." }],
    options: () => (
      <>
        <div className="option-group"><span className="option-label">Password</span><input className="option-input" type="password" placeholder="Enter password" /></div>
        <div className="option-group"><span className="option-label">Confirm</span><input className="option-input" type="password" placeholder="Confirm password" /></div>
      </>
    ),
    actionLabel: "Protect PDF", resultName: "Protected.pdf",
  },
  organize: {
    title: "ORGANIZE", desc: "Reorder, delete or add pages.",
    multi: false, accept: ".pdf", acceptLabel: "PDF file", num: "11",
    howItWorks: [{ title: "Upload", desc: "Select PDF." }, { title: "Organize", desc: "Reorder pages." }, { title: "Download", desc: "Organized PDF." }],
    options: () => (
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {["Reorder Pages","Delete Pages","Add Blank Pages"].map((a) => (
          <button key={a} className="btn btn-outline btn-sm" style={{ justifyContent: "center" }}>{a}</button>
        ))}
      </div>
    ),
    actionLabel: "Organize PDF", resultName: "Organized.pdf",
  },
  ocr: {
    title: "OCR", desc: "Make scanned PDFs searchable.",
    multi: false, accept: ".pdf", acceptLabel: "PDF file", num: "12",
    howItWorks: [{ title: "Upload", desc: "Scanned PDF." }, { title: "Language", desc: "Select language." }, { title: "Download", desc: "Searchable PDF." }],
    options: () => (
      <div className="option-group">
        <span className="option-label">Document Language</span>
        <select className="option-select"><option>English</option><option>Hindi</option><option>Spanish</option><option>French</option><option>German</option><option>Chinese</option></select>
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
        <select className="option-select"><option>Short</option><option>Medium</option><option>Detailed</option></select>
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
          <input className="option-input" type="number" defaultValue={1} min={1} />
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
        <select className="option-select"><option>A4</option><option>Letter</option><option>Legal</option></select>
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
        <select className="option-select"><option>Flowing text</option><option>Exact layout</option></select>
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
        <select className="option-select"><option>All Sheets</option><option>Active Sheet Only</option></select>
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
        <select className="option-select"><option>All Pages</option><option>Custom Range</option></select>
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
        <select className="option-select"><option>1 slide per page</option><option>2 slides per page</option><option>4 slides per page</option></select>
      </div>
    ),
    actionLabel: "Convert to PDF", resultName: "Presentation.pdf",
  },
  sign: {
    title: "SIGN PDF", desc: "Apply a digital signature to your PDF.",
    multi: false, accept: ".pdf", acceptLabel: "PDF file", num: "14",
    howItWorks: [{ title: "Upload", desc: "Select PDF." }, { title: "Sign", desc: "Draw or type signature." }, { title: "Download", desc: "Signed PDF." }],
    options: (state, set) => (
      <>
        <div className="tab-row">
          {["Draw", "Type", "Upload"].map((t) => (
            <button key={t} className={`tab-btn${state.signTab === t ? " active" : ""}`} onClick={() => set((s) => ({ ...s, signTab: t }))}>{t}</button>
          ))}
        </div>
        <div className="option-group">
          <span className="option-label">Position on Page</span>
          <select className="option-select"><option>Bottom Right</option><option>Bottom Left</option><option>Bottom Center</option><option>Top Right</option></select>
        </div>
      </>
    ),
    actionLabel: "Sign PDF", resultName: "Signed.pdf",
  },
  "ai-translate": {
    title: "AI TRANSLATE", desc: "Translate PDF content to target language.",
    multi: false, accept: ".pdf", acceptLabel: "PDF file", num: "20",
    howItWorks: [{ title: "Upload", desc: "Select PDF." }, { title: "Choose language", desc: "Pick target language." }, { title: "Download", desc: "Translated PDF." }],
    options: (state, set) => (
      <div className="option-group">
        <span className="option-label">Target Language</span>
        <select className="option-select" onChange={(e) => set((s) => ({ ...s, translateLang: e.target.value }))}>
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
          <span className="option-label">URL or Text</span>
          <input className="option-input" placeholder="https://example.com" value={state.qrUrl || ""} onChange={(e) => set((s) => ({ ...s, qrUrl: e.target.value }))} />
        </div>
        <div className="option-group">
          <span className="option-label">Size</span>
          <select className="option-select"><option>256×256</option><option>512×512</option><option>1024×1024</option></select>
        </div>
        <div className="option-group">
          <span className="option-label">Format</span>
          <select className="option-select"><option>PNG</option><option>SVG</option></select>
        </div>
      </>
    ),
    actionLabel: "Generate QR Code", resultName: "QRCode.png",
  },
};

export default function ToolPage({ params }: { params: Promise<{ toolId: string }> }) {
  const router = useRouter();
  const { toolId } = use(params);
  const cfg = CFGS[toolId];
  const tool = tools.find((t) => t.id === toolId);

  const [files, setFiles] = useState<FileEntry[]>([]);
  // detected info for the FIRST (or only) file — shown as smart banner
  const [detectedInfo, setDetectedInfo] = useState<{ detected: DetectedFile; name: string } | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  const [state, setState] = useState<ToolState>({ splitMode: "Split by page range", rotation: "Left 90°", wmTab: "Text", pageNumPos: "Bottom Center", signTab: "Draw", translateLang: "Hindi", rewriteTone: "Professional", qrUrl: "" });
  const [pState, setPState] = useState<"idle" | "processing" | "complete" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [curStep, setCurStep] = useState(0);
  const [isDrag, setIsDrag] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((fl: FileList | null) => {
    if (!fl) return;
    const arr = Array.from(fl).map((f) => ({
      file: f,
      id: Math.random().toString(36).slice(2),
      name: f.name,
      size: (f.size / 1024 / 1024).toFixed(1) + " MB",
      pages: `${Math.floor(Math.random() * 20) + 1} pages`,
      detected: analyzeFile(f),
    }));

    // Show smart banner for the first file
    if (arr.length > 0) {
      const first = arr[0];
      setDetectedInfo({ detected: first.detected!, name: first.name });
      setShowBanner(true);
    }

    setFiles((p) => (cfg?.multi ? [...p, ...arr] : arr.slice(0, 1)));
  }, [cfg?.multi]);

  const startProcessing = async () => {
    if (toolId !== "qr" && !files.length) return;
    try {
      setPState("processing");
      setProgress(0);
      let result;
      if (toolId === "merge") {
        result = await mergePdf(files.map((f) => f.file));
      } else if (toolId === "qr") {
        // QR is client-side — simulate job flow
        result = { job_id: "qr-local-" + Date.now() };
        // Directly complete after a brief moment
        setTimeout(() => {
          setProgress(100);
          setCurStep(4);
          const url = state.qrUrl || "https://example.com";
          const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(url)}&format=png`;
          setDownloadUrl(qrApiUrl);
          setPState("complete");
        }, 1500);
        return;
      } else {
        const uploadedFiles = await Promise.all(files.map((f) => uploadFile(f.file)));
        const fileIds = uploadedFiles.map((f) => f.file_id);
        switch (toolId) {
          case "split":          result = await splitPdf(fileIds[0]); break;
          case "compress":       result = await compressPdf(fileIds[0]); break;
          case "protect":        result = await protectPdf(fileIds[0], "123456"); break;
          case "unlock":         result = await unlockPdf(fileIds[0], "123456"); break;
          case "pdf2jpg":        result = await pdfToJpg(fileIds[0]); break;
          case "jpg2pdf":        result = await jpgToPdf(fileIds); break;
          case "ocr":            result = await ocrPdf(fileIds[0]); break;
          case "rotate":         result = await rotatePdf(fileIds[0]); break;
          case "watermark":      result = await watermarkPdf(fileIds[0]); break;
          case "organize":       result = await organizePdf(fileIds[0]); break;
          case "ai":             result = await aiSummarize(fileIds[0]); break;
          case "addPageNumbers": result = await addPageNumbers(fileIds[0], state.pageNumPos || "Bottom Center"); break;
          case "word2pdf":       result = await wordToPdf(fileIds[0]); break;
          case "pdf2word":       result = await pdfToWord(fileIds[0]); break;
          case "excel2pdf":      result = await excelToPdf(fileIds[0]); break;
          case "pdf2excel":      result = await pdfToExcel(fileIds[0]); break;
          case "ppt2pdf":        result = await pptToPdf(fileIds[0]); break;
          case "sign":           result = await signPdf(fileIds[0]); break;
          case "ai-translate":   result = await aiTranslate(fileIds[0], state.translateLang || "Hindi"); break;
          case "ai-rewrite":     result = await aiRewrite(fileIds[0], state.rewriteTone || "Professional"); break;
          default: throw new Error(`Tool ${toolId} not implemented`);
        }
      }

      const interval = setInterval(async () => {
        const status = await getJobStatus(result.job_id);
        setProgress(status.progress || 0);
        if (status.progress) setCurStep(Math.min(Math.floor((status.progress / 100) * 4), 4));
        if (status.status === "completed") {
          clearInterval(interval);
          const dl = await getDownloadUrl(result.job_id);
          setDownloadUrl(dl.download_url);
          setPState("complete");
        }
      }, 2000);
    } catch (error) {
      console.error(error);
      setPState("error");
    }
  };

  if (!cfg || !tool) {
    return (
      <div className="tool-page">
        <div className="tools-sidebar">
          {sidebarCats.map((c) => (
            <Link key={c.id} href={c.id === "all" ? "/" : `/tools/${tools.find(t => t.category === c.id)?.id || "merge"}`} className="sidebar-link">
              <SvgIcon d={c.icon} size={14} />{c.label}
            </Link>
          ))}
        </div>
        <div className="tool-main" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center" }}>
            <p style={{ color: "var(--muted)", marginBottom: 16 }}>Tool not found.</p>
            <button className="btn btn-dark" onClick={() => router.push("/")}>Go Home</button>
          </div>
        </div>
      </div>
    );
  }

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
        <div className="sidebar-download" style={{ marginTop: 24 }}>
          <div className="sidebar-download-title">Work faster.</div>
          <div className="sidebar-download-desc">Install our desktop app for offline productivity.</div>
          <button className="btn btn-dark btn-sm" style={{ width: "100%", justifyContent: "center" }}>
            <SvgIcon d={["M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4","M7 10l5 5 5-5","M12 15V3"]} size={12} />
            Download App
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="tool-main">
        <button className="btn btn-ghost btn-sm" style={{ marginBottom: 24, paddingLeft: 0 }} onClick={() => router.back()}>
          <SvgIcon d="M19 12H5M12 19l-7-7 7-7" size={14} />Back
        </button>

        <div className="tool-section-num">{cfg.num}</div>
        <h1 className="tool-title">{cfg.title}</h1>
        <p className="tool-desc">{cfg.desc}</p>

        {pState === "idle" && (
          <div className="tool-layout">
            <div>
              {/* ── Smart Detection Banner ── shown after a file is picked ── */}
              {showBanner && detectedInfo && (
                <SmartFileBanner
                  detected={detectedInfo.detected}
                  fileName={detectedInfo.name}
                  onDismiss={() => setShowBanner(false)}
                />
              )}

              {/* Upload zone — hidden for QR generator */}
              {toolId !== "qr" && (
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
                <button className="btn btn-dark" onClick={(e) => { e.stopPropagation(); fileInput.current?.click(); }}>
                  Choose Files
                  <SvgIcon d="M6 9l6 6 6-6" size={13} />
                </button>
                <div className="upload-zone-note">Max file size: 100MB</div>
                <input
                  ref={fileInput}
                  type="file"
                  accept={cfg.accept}
                  multiple={cfg.multi}
                  style={{ display: "none" }}
                  onChange={(e) => handleFiles(e.target.files)}
                />
              </div>
              )}

              {/* QR — no files needed, show direct action */}
              {toolId === "qr" && (
                <div style={{ marginTop: 20 }}>
                  <button className="btn btn-dark btn-block" onClick={startProcessing}>
                    Generate QR Code
                    <SvgIcon d="M5 12h14M12 5l7 7-7 7" size={14} />
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
                            {f.detected && (
                              <span style={{
                                marginLeft: 8, padding: "1px 7px", borderRadius: 99,
                                fontSize: 10, fontWeight: 700, background: "var(--bg-3)",
                                color: "var(--muted)", border: "1px solid var(--border)",
                                verticalAlign: "middle",
                              }}>
                                {f.detected.ext}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          className="file-row-remove"
                          onClick={() => {
                            setFiles((p) => p.filter((x) => x.id !== f.id));
                            if (files.length === 1) setShowBanner(false);
                          }}
                        >
                          <SvgIcon d="M18 6L6 18M6 6l12 12" size={13} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {cfg.multi && (
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ marginTop: 8 }}
                      onClick={() => fileInput.current?.click()}
                    >
                      <SvgIcon d={["M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4","M17 8l-5-5-5 5","M12 3v12"]} size={13} />
                      Add more files
                    </button>
                  )}

                  <div style={{ marginTop: 16 }}>
                    <button className="btn btn-dark btn-block" onClick={startProcessing}>
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
            <p>Your {toolId === "qr" ? "QR code" : "PDF"} has been processed successfully.</p>
            {toolId === "qr" && downloadUrl && (
              <div style={{ margin: "16px auto", textAlign: "center" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={downloadUrl} alt="Generated QR Code" style={{ width: 200, height: 200, border: "1px solid var(--border)", borderRadius: 8, background: "#fff", padding: 8 }} />
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
              <button className="btn btn-dark btn-lg" onClick={() => window.open(downloadUrl, "_blank")}>
                <SvgIcon d={["M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4","M7 10l5 5 5-5","M12 15V3"]} size={15} />
                Download
              </button>
              <button className="btn btn-outline btn-lg" onClick={() => { setFiles([]); setPState("idle"); setProgress(0); setShowBanner(false); setDetectedInfo(null); }}>
                Process Another
              </button>
            </div>
          </div>
        )}

        {pState === "error" && (
          <div className="state-card">
            <div style={{ width: 56, height: 56, borderRadius: "50%", border: "2px solid var(--danger)", color: "var(--danger)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 24, fontWeight: 700 }}>!</div>
            <h2>Something went wrong.</h2>
            <p>Please try again or contact support.</p>
            <button className="btn btn-dark btn-lg" onClick={() => { setPState("idle"); setProgress(0); }}>Try Again</button>
          </div>
        )}
      </div>
    </div>
  );
}
