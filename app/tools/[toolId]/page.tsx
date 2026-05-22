"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";
import { icons, tools } from "@/lib/data";

// ── Tool Configs ────────────────────────────────────────────────────────────
interface ToolState {
  splitMode?: string;
  rotation?: string;
  wmTab?: string;
}

interface OptionProps {
  state: ToolState;
  setState: React.Dispatch<React.SetStateAction<ToolState>>;
}

interface ToolConfig {
  title: string;
  desc: string;
  multi: boolean;
  accept: string;
  acceptLabel: string;
  howItWorks: { title: string; desc: string }[];
  options: (props: OptionProps) => React.ReactNode;
  actionLabel: string;
  resultName: string;
}

const toolConfigs: Record<string, ToolConfig> = {
  merge: {
    title: "Merge PDF",
    desc: "Combine multiple PDF files into a single PDF",
    multi: true,
    accept: ".pdf",
    acceptLabel: "PDF files",
    howItWorks: [
      { title: "Add your PDF files", desc: "Select multiple PDF files to merge." },
      { title: "Arrange files", desc: "Drag and drop to reorder your files." },
      { title: "Merge and download", desc: "Click merge and download your new PDF." },
    ],
    options: () => (
      <div className="option-group">
        <label className="checkbox-item" style={{ cursor: "pointer" }}>
          <div className="checkbox-box checked"><Icon d={icons.check} size={11} strokeWidth={3} /></div>
          <span className="checkbox-label">Merge in the original order</span>
        </label>
      </div>
    ),
    actionLabel: "Merge PDF",
    resultName: "Merged_File.pdf",
  },
  split: {
    title: "Split PDF",
    desc: "Extract pages or split PDF into multiple files",
    multi: false,
    accept: ".pdf",
    acceptLabel: "PDF file",
    howItWorks: [
      { title: "Upload a PDF", desc: "Select the PDF file to split." },
      { title: "Choose option", desc: "Select split method or page range." },
      { title: "Download files", desc: "Your split PDF files are ready." },
    ],
    options: ({ state, setState }) => (
      <>
        <div className="option-group">
          <span className="option-label">Split Options</span>
          <div className="radio-group">
            {["Extract every page","Split by page range","Split by each page"].map((o) => (
              <div key={o} className={`radio-item${state.splitMode === o ? " selected" : ""}`} onClick={() => setState((s) => ({ ...s, splitMode: o }))}>
                <div className="radio-dot" />
                <span className="radio-text">{o}</span>
              </div>
            ))}
          </div>
        </div>
        {state.splitMode === "Split by page range" && (
          <div className="option-group">
            <span className="option-label">Page range</span>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 13, color: "var(--muted)" }}>from</span>
              <input className="option-input" style={{ width: 60 }} type="number" defaultValue={1} min={1} />
              <span style={{ fontSize: 13, color: "var(--muted)" }}>to</span>
              <input className="option-input" style={{ width: 60 }} type="number" defaultValue={5} min={1} />
            </div>
          </div>
        )}
      </>
    ),
    actionLabel: "Split PDF",
    resultName: "Split_Files.zip",
  },
  compress: {
    title: "Compress PDF",
    desc: "Reduce PDF file size without losing quality",
    multi: false,
    accept: ".pdf",
    acceptLabel: "PDF file",
    howItWorks: [
      { title: "Upload PDF", desc: "Select the PDF file to compress." },
      { title: "Choose level", desc: "Choose a compression level." },
      { title: "Download", desc: "Download your compressed PDF." },
    ],
    options: () => (
      <>
        <div className="option-group">
          <span className="option-label">Compression Level</span>
          <select className="option-select">
            <option>Recommended</option>
            <option>Low compression</option>
            <option>High compression</option>
            <option>Extreme compression</option>
          </select>
        </div>
        <div className="option-group">
          <label className="checkbox-item" style={{ cursor: "pointer" }}>
            <div className="checkbox-box" style={{ borderColor: "var(--border)" }} />
            <span className="checkbox-label">Remove images (if size matters more)</span>
          </label>
        </div>
      </>
    ),
    actionLabel: "Compress PDF",
    resultName: "Compressed.pdf",
  },
  pdf2jpg: {
    title: "PDF to JPG",
    desc: "Convert PDF pages to JPG images",
    multi: false,
    accept: ".pdf",
    acceptLabel: "PDF file",
    howItWorks: [
      { title: "Upload PDF", desc: "Select PDF file." },
      { title: "Choose options", desc: "Choose quality and pages." },
      { title: "Download images", desc: "Download your JPG images." },
    ],
    options: () => (
      <>
        <div className="option-group">
          <span className="option-label">Image Quality</span>
          <select className="option-select"><option>High</option><option>Medium</option><option>Low</option></select>
        </div>
        <div className="option-group">
          <span className="option-label">Select Pages</span>
          <select className="option-select"><option>All Pages</option><option>Specific pages</option></select>
        </div>
      </>
    ),
    actionLabel: "Convert to JPG",
    resultName: "PDF_Images.zip",
  },
  jpg2pdf: {
    title: "JPG to PDF",
    desc: "Convert JPG images to a PDF document",
    multi: true,
    accept: ".jpg,.jpeg,.png,.webp",
    acceptLabel: "image files",
    howItWorks: [
      { title: "Add images", desc: "Select JPG images." },
      { title: "Arrange images", desc: "Drag to reorder." },
      { title: "Convert & download", desc: "Convert and download PDF." },
    ],
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
    actionLabel: "Convert to PDF",
    resultName: "Converted.pdf",
  },
  rotate: {
    title: "Rotate PDF",
    desc: "Rotate PDF pages left or right",
    multi: false,
    accept: ".pdf",
    acceptLabel: "PDF file",
    howItWorks: [
      { title: "Upload PDF", desc: "Select the PDF file." },
      { title: "Choose direction", desc: "Rotate left or right." },
      { title: "Download", desc: "Download rotated PDF." },
    ],
    options: ({ state, setState }) => (
      <div className="option-group">
        <span className="option-label">Rotation</span>
        <div style={{ display: "flex", gap: 8 }}>
          {["Rotate Left","Rotate Right"].map((r) => (
            <div key={r} className={`radio-item${state.rotation === r ? " selected" : ""}`} style={{ flex: 1 }} onClick={() => setState((s) => ({ ...s, rotation: r }))}>
              <div className="radio-dot" />
              <span className="radio-text">{r}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    actionLabel: "Rotate PDF",
    resultName: "Rotated.pdf",
  },
  watermark: {
    title: "Watermark PDF",
    desc: "Add text or image watermark to PDF",
    multi: false,
    accept: ".pdf",
    acceptLabel: "PDF file",
    howItWorks: [
      { title: "Upload PDF", desc: "Select the PDF file." },
      { title: "Add watermark", desc: "Add text or image watermark." },
      { title: "Download", desc: "Download watermarked PDF." },
    ],
    options: ({ state, setState }) => (
      <>
        <div className="tab-row">
          {["Text Watermark","Image Watermark"].map((t) => (
            <button key={t} className={`tab-btn${state.wmTab === t ? " active" : ""}`} onClick={() => setState((s) => ({ ...s, wmTab: t }))}>{t}</button>
          ))}
        </div>
        {state.wmTab !== "Image Watermark" ? (
          <div className="option-group">
            <span className="option-label">Watermark text</span>
            <input className="option-input" placeholder="Enter watermark text" />
          </div>
        ) : (
          <div className="option-group">
            <span className="option-label">Watermark image</span>
            <button className="btn btn-secondary btn-sm" style={{ width: "100%", justifyContent: "center" }}>Choose Image</button>
          </div>
        )}
        <div className="option-group">
          <span className="option-label">Position</span>
          <select className="option-select">
            <option>Center</option><option>Top Left</option><option>Top Right</option><option>Bottom Left</option><option>Bottom Right</option>
          </select>
        </div>
      </>
    ),
    actionLabel: "Add Watermark",
    resultName: "Watermarked.pdf",
  },
  unlock: {
    title: "Unlock PDF",
    desc: "Remove password from a protected PDF",
    multi: false,
    accept: ".pdf",
    acceptLabel: "PDF file",
    howItWorks: [
      { title: "Upload PDF", desc: "Select the locked PDF." },
      { title: "Enter password", desc: "Enter the correct password." },
      { title: "Download", desc: "Download unlocked PDF." },
    ],
    options: () => (
      <div className="option-group">
        <span className="option-label">Password</span>
        <input className="option-input" type="password" placeholder="Enter password" />
      </div>
    ),
    actionLabel: "Unlock PDF",
    resultName: "Unlocked.pdf",
  },
  protect: {
    title: "Protect PDF",
    desc: "Password protect your PDF file",
    multi: false,
    accept: ".pdf",
    acceptLabel: "PDF file",
    howItWorks: [
      { title: "Upload PDF", desc: "Select only one PDF file." },
      { title: "Set password", desc: "Set a strong password." },
      { title: "Download", desc: "Download protected PDF." },
    ],
    options: () => (
      <>
        <div className="option-group">
          <span className="option-label">Password</span>
          <input className="option-input" type="password" placeholder="Enter password" />
        </div>
        <div className="option-group">
          <span className="option-label">Confirm Password</span>
          <input className="option-input" type="password" placeholder="Confirm password" />
        </div>
      </>
    ),
    actionLabel: "Protect PDF",
    resultName: "Protected.pdf",
  },
  organize: {
    title: "Organize PDF",
    desc: "Rearrange, delete or add pages in PDF",
    multi: false,
    accept: ".pdf",
    acceptLabel: "PDF file",
    howItWorks: [
      { title: "Upload PDF", desc: "Select only one PDF file." },
      { title: "Organize pages", desc: "Reorder, delete, or add pages." },
      { title: "Download", desc: "Download your organized PDF." },
    ],
    options: () => (
      <div style={{ display: "flex", gap: 8, flexDirection: "column" }}>
        {["Reorder Pages","Delete Pages","Add Pages"].map((a) => (
          <button key={a} className="btn btn-secondary btn-sm" style={{ justifyContent: "center" }}>{a}</button>
        ))}
      </div>
    ),
    actionLabel: "Organize PDF",
    resultName: "Organized.pdf",
  },
  ocr: {
    title: "OCR PDF",
    desc: "Make scanned PDF searchable and editable",
    multi: false,
    accept: ".pdf",
    acceptLabel: "PDF file",
    howItWorks: [
      { title: "Upload scanned PDF", desc: "Select scanned PDF file." },
      { title: "Run OCR", desc: "We extract text from images." },
      { title: "Download", desc: "Download searchable PDF." },
    ],
    options: () => (
      <div className="option-group">
        <span className="option-label">Language</span>
        <select className="option-select">
          <option>English</option><option>Hindi</option><option>Spanish</option><option>French</option><option>German</option><option>Chinese</option>
        </select>
      </div>
    ),
    actionLabel: "Run OCR",
    resultName: "OCR_Result.pdf",
  },
  ai: {
    title: "AI Summarize PDF",
    desc: "Get an AI-generated summary of your PDF content",
    multi: false,
    accept: ".pdf",
    acceptLabel: "PDF file",
    howItWorks: [
      { title: "Upload PDF", desc: "Select the PDF file." },
      { title: "AI Processing", desc: "AI reads and summarizes it." },
      { title: "View Summary", desc: "View or copy the summary." },
    ],
    options: () => (
      <div className="option-group">
        <span className="option-label">Summary Length</span>
        <select className="option-select"><option>Short</option><option>Medium</option><option>Detailed</option></select>
      </div>
    ),
    actionLabel: "Summarize PDF",
    resultName: "Summary.txt",
  },
};

// ── File entry type ─────────────────────────────────────────────────────────
interface FileEntry {
  file: File;
  id: string;
  name: string;
  size: string;
}

// ── ToolPage ─────────────────────────────────────────────────────────────────
export default function ToolPage({ params }: { params: { toolId: string } }) {
  const router = useRouter();
  const cfg = toolConfigs[params.toolId];
  const tool = tools.find((t) => t.id === params.toolId);

  const [files, setFiles] = useState<FileEntry[]>([]);
  const [state, setState] = useState<ToolState>({ splitMode: "Split by page range", rotation: "Rotate Left", wmTab: "Text Watermark" });
  const [processState, setProcessState] = useState<"idle"|"processing"|"complete"|"error">("idle");
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [isDrag, setIsDrag] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((incoming: FileList | null) => {
    if (!incoming) return;
    const arr = Array.from(incoming).map((f) => ({
      file: f,
      id: Math.random().toString(36).slice(2),
      name: f.name,
      size: (f.size / 1024 / 1024).toFixed(1) + " MB",
    }));
    setFiles((prev) => (cfg.multi ? [...prev, ...arr] : arr.slice(0, 1)));
  }, [cfg.multi]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDrag(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const startProcessing = () => {
    if (!files.length) return;
    setProcessState("processing");
    setProgress(0);
    setCurrentStep(0);
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 8 + 4;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        setTimeout(() => setProcessState("complete"), 400);
      }
      setProgress(Math.min(p, 100));
      setCurrentStep(Math.min(Math.floor((p / 100) * 4), 4));
    }, 180);
  };

  if (!cfg || !tool) {
    return (
      <div className="container" style={{ padding: "80px 0", textAlign: "center" }}>
        <h1>Tool not found</h1>
        <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => router.push("/")}>
          Back to Home
        </button>
      </div>
    );
  }

  const stepLabels = ["Uploading", "Queued", "Processing", "Finalizing", "Completed"];

  return (
    <div className="tool-page">
      <div className="container">
        <button className="back-btn" onClick={() => router.back()}>
          <Icon d={icons.arrowLeft} size={16} /> All Tools
        </button>

        <div className="tool-page-header">
          <h1>{cfg.title}</h1>
          <p>{cfg.desc}</p>
        </div>

        <div className="tool-layout">
          {/* Main content */}
          <div className="tool-main">
            {processState === "idle" && (
              <>
                <div
                  className={`dropzone${isDrag ? " drag-over" : ""}`}
                  onDragOver={(e) => { e.preventDefault(); setIsDrag(true); }}
                  onDragLeave={() => setIsDrag(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInput.current?.click()}
                >
                  <div className="dropzone-icon">
                    <Icon d={icons.upload} size={40} />
                  </div>
                  <h3>Drop {cfg.acceptLabel} here</h3>
                  <p>or click to browse from your computer</p>
                  <button className="btn btn-primary" onClick={(e) => { e.stopPropagation(); fileInput.current?.click(); }}>
                    <Icon d={icons.upload} size={16} /> Select {cfg.acceptLabel}
                  </button>
                  <p className="dropzone-or">Supported: {cfg.accept.split(",").join(", ")}</p>
                  <input
                    ref={fileInput}
                    type="file"
                    accept={cfg.accept}
                    multiple={cfg.multi}
                    style={{ display: "none" }}
                    onChange={(e) => handleFiles(e.target.files)}
                  />
                </div>

                {files.length > 0 && (
                  <>
                    <div className="file-list">
                      {files.map((f) => (
                        <div key={f.id} className="file-item">
                          <span className="file-icon"><Icon d={icons.file} size={20} /></span>
                          <div className="file-info">
                            <div className="file-name">{f.name}</div>
                            <div className="file-size">{f.size}</div>
                          </div>
                          <button
                            className="file-remove"
                            onClick={() => setFiles((prev) => prev.filter((x) => x.id !== f.id))}
                          >
                            <Icon d={icons.x} size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                    {cfg.multi && (
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ marginTop: 12 }}
                        onClick={() => fileInput.current?.click()}
                      >
                        <Icon d={icons.upload} size={14} /> Add more files
                      </button>
                    )}
                    <button
                      className="btn btn-primary btn-block"
                      style={{ marginTop: 20 }}
                      onClick={startProcessing}
                    >
                      {cfg.actionLabel}
                    </button>
                  </>
                )}
              </>
            )}

            {processState === "processing" && (
              <div className="state-card">
                <h2>Processing your file{files.length > 1 ? "s" : ""}…</h2>
                <p>Please wait while we {cfg.actionLabel.toLowerCase()}.</p>
                <div className="progress-bar-wrap">
                  <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                </div>
                <div className="progress-label">{Math.round(progress)}%</div>
                <div className="steps-list">
                  {stepLabels.map((label, i) => (
                    <div key={label} className="step-item">
                      <div className={`step-dot${i < currentStep ? " done" : i === currentStep ? " active" : ""}`}>
                        {i < currentStep && <Icon d={icons.check} size={10} strokeWidth={3} />}
                      </div>
                      <span className={`step-label${i < currentStep ? " done" : i === currentStep ? " active" : ""}`}>
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {processState === "complete" && (
              <div className="state-card">
                <div className="success-icon">
                  <Icon d={icons.check} size={28} strokeWidth={2.5} />
                </div>
                <h2>Done! Your file is ready.</h2>
                <p>Your PDF has been processed successfully.</p>
                <div className="file-result">
                  <span style={{ color: "var(--red)" }}><Icon d={icons.file} size={24} /></span>
                  <div className="file-result-info">
                    <div className="file-result-name">{cfg.resultName}</div>
                    <div className="file-result-size">Ready to download</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                  <button className="btn btn-success btn-lg">
                    <Icon d={icons.download} size={16} /> Download
                  </button>
                  <button
                    className="btn btn-secondary btn-lg"
                    onClick={() => { setFiles([]); setProcessState("idle"); setProgress(0); }}
                  >
                    Process another file
                  </button>
                </div>
              </div>
            )}

            {processState === "error" && (
              <div className="state-card">
                <div className="error-icon">!</div>
                <h2>Something went wrong</h2>
                <p>There was an error processing your file. Please try again.</p>
                <button
                  className="btn btn-primary btn-lg"
                  onClick={() => { setProcessState("idle"); setProgress(0); }}
                >
                  Try Again
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="tool-sidebar">
            <div className="options-card" style={{ marginBottom: 16 }}>
              <div className="options-title">Options</div>
              {cfg.options({ state, setState })}
            </div>

            <div className="how-it-works">
              <div className="how-title">How it works</div>
              {cfg.howItWorks.map((step, i) => (
                <div key={i} className="how-step">
                  <div className="how-num">{i + 1}</div>
                  <div className="how-step-text">
                    <h4>{step.title}</h4>
                    <p>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="security-note" style={{ marginTop: 16 }}>
              <Icon d={icons.shield} size={18} style={{ color: "var(--success)", flexShrink: 0 }} />
              <p>
                <strong>Your files are safe.</strong> All files are encrypted with 256-bit SSL and
                deleted permanently after processing. We never store or share your data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
