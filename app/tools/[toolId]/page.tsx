"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";
import { icons, tools } from "@/lib/data";

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
    title: "MERGE PDF", desc: "Combine multiple PDF files into one", multi: true, accept: ".pdf", acceptLabel: "PDF files",
    howItWorks: [
      { title: "Add PDF files", desc: "Select multiple PDFs to merge." },
      { title: "Arrange order", desc: "Drag to reorder as needed." },
      { title: "Download", desc: "Get your merged PDF instantly." },
    ],
    options: () => (
      <div className="option-group">
        <label className="checkbox-item" style={{ cursor: "pointer" }}>
          <div className="checkbox-box checked"><Icon d={icons.check} size={9} strokeWidth={3} /></div>
          <span className="checkbox-label">Merge in upload order</span>
        </label>
      </div>
    ),
    actionLabel: "Merge PDF", resultName: "Merged_File.pdf",
  },
  split: {
    title: "SPLIT PDF", desc: "Extract pages or split into multiple files", multi: false, accept: ".pdf", acceptLabel: "PDF file",
    howItWorks: [
      { title: "Upload PDF", desc: "Select the PDF to split." },
      { title: "Set options", desc: "Choose split method." },
      { title: "Download", desc: "Get your split files." },
    ],
    options: ({ state, setState }) => (
      <>
        <div className="option-group">
          <span className="option-label">Split Mode</span>
          <div className="radio-group">
            {["Extract every page","Split by page range","Split each page"].map((o) => (
              <div key={o} className={`radio-item${state.splitMode === o ? " selected" : ""}`} onClick={() => setState((s) => ({ ...s, splitMode: o }))}>
                <div className="radio-dot" />
                <span className="radio-text">{o}</span>
              </div>
            ))}
          </div>
        </div>
        {state.splitMode === "Split by page range" && (
          <div className="option-group">
            <span className="option-label">Page Range</span>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--font-mono)" }}>from</span>
              <input className="option-input" style={{ width: 56 }} type="number" defaultValue={1} min={1} />
              <span style={{ fontSize: 11, color: "var(--muted)", fontFamily: "var(--font-mono)" }}>to</span>
              <input className="option-input" style={{ width: 56 }} type="number" defaultValue={5} min={1} />
            </div>
          </div>
        )}
      </>
    ),
    actionLabel: "Split PDF", resultName: "Split_Files.zip",
  },
  compress: {
    title: "COMPRESS PDF", desc: "Reduce file size without losing quality", multi: false, accept: ".pdf", acceptLabel: "PDF file",
    howItWorks: [
      { title: "Upload PDF", desc: "Select the PDF to compress." },
      { title: "Choose level", desc: "Pick compression level." },
      { title: "Download", desc: "Get your compressed PDF." },
    ],
    options: () => (
      <>
        <div className="option-group">
          <span className="option-label">Compression Level</span>
          <select className="option-select">
            <option>Recommended</option><option>Low</option><option>High</option><option>Extreme</option>
          </select>
        </div>
        <div className="option-group">
          <label className="checkbox-item" style={{ cursor: "pointer" }}>
            <div className="checkbox-box"><span /></div>
            <span className="checkbox-label">Remove embedded images</span>
          </label>
        </div>
      </>
    ),
    actionLabel: "Compress PDF", resultName: "Compressed.pdf",
  },
  pdf2jpg: {
    title: "PDF TO JPG", desc: "Convert PDF pages to JPG images", multi: false, accept: ".pdf", acceptLabel: "PDF file",
    howItWorks: [
      { title: "Upload PDF", desc: "Select the PDF file." },
      { title: "Set quality", desc: "Choose image quality." },
      { title: "Download", desc: "Get a ZIP of your JPGs." },
    ],
    options: () => (
      <>
        <div className="option-group">
          <span className="option-label">Image Quality</span>
          <select className="option-select"><option>High</option><option>Medium</option><option>Low</option></select>
        </div>
        <div className="option-group">
          <span className="option-label">Pages</span>
          <select className="option-select"><option>All Pages</option><option>Specific pages</option></select>
        </div>
      </>
    ),
    actionLabel: "Convert to JPG", resultName: "PDF_Images.zip",
  },
  jpg2pdf: {
    title: "JPG TO PDF", desc: "Convert images to a PDF document", multi: true, accept: ".jpg,.jpeg,.png,.webp", acceptLabel: "image files",
    howItWorks: [
      { title: "Add images", desc: "Select your image files." },
      { title: "Arrange order", desc: "Drag to reorder." },
      { title: "Download", desc: "Get your PDF." },
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
    actionLabel: "Convert to PDF", resultName: "Converted.pdf",
  },
  rotate: {
    title: "ROTATE PDF", desc: "Rotate PDF pages left or right", multi: false, accept: ".pdf", acceptLabel: "PDF file",
    howItWorks: [
      { title: "Upload PDF", desc: "Select the PDF." },
      { title: "Choose direction", desc: "Rotate left or right." },
      { title: "Download", desc: "Get your rotated PDF." },
    ],
    options: ({ state, setState }) => (
      <div className="option-group">
        <span className="option-label">Rotation</span>
        <div style={{ display: "flex", gap: 6 }}>
          {["Rotate Left","Rotate Right"].map((r) => (
            <div key={r} className={`radio-item${state.rotation === r ? " selected" : ""}`} style={{ flex: 1 }} onClick={() => setState((s) => ({ ...s, rotation: r }))}>
              <div className="radio-dot" />
              <span className="radio-text" style={{ fontSize: 11 }}>{r}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    actionLabel: "Rotate PDF", resultName: "Rotated.pdf",
  },
  watermark: {
    title: "WATERMARK PDF", desc: "Add text or image watermark", multi: false, accept: ".pdf", acceptLabel: "PDF file",
    howItWorks: [
      { title: "Upload PDF", desc: "Select the PDF." },
      { title: "Add watermark", desc: "Choose text or image." },
      { title: "Download", desc: "Get watermarked PDF." },
    ],
    options: ({ state, setState }) => (
      <>
        <div className="tab-row">
          {["Text","Image"].map((t) => (
            <button key={t} className={`tab-btn${state.wmTab === t ? " active" : ""}`} onClick={() => setState((s) => ({ ...s, wmTab: t }))}>{t}</button>
          ))}
        </div>
        {state.wmTab !== "Image" ? (
          <div className="option-group">
            <span className="option-label">Watermark Text</span>
            <input className="option-input" placeholder="e.g. CONFIDENTIAL" />
          </div>
        ) : (
          <div className="option-group">
            <span className="option-label">Watermark Image</span>
            <button className="btn btn-ghost btn-sm" style={{ width: "100%", justifyContent: "center" }}>Choose Image</button>
          </div>
        )}
        <div className="option-group">
          <span className="option-label">Position</span>
          <select className="option-select"><option>Center</option><option>Top Left</option><option>Top Right</option><option>Bottom Left</option><option>Bottom Right</option></select>
        </div>
      </>
    ),
    actionLabel: "Add Watermark", resultName: "Watermarked.pdf",
  },
  unlock: {
    title: "UNLOCK PDF", desc: "Remove password from a protected PDF", multi: false, accept: ".pdf", acceptLabel: "PDF file",
    howItWorks: [
      { title: "Upload PDF", desc: "Select the locked PDF." },
      { title: "Enter password", desc: "Provide the correct password." },
      { title: "Download", desc: "Get your unlocked PDF." },
    ],
    options: () => (
      <div className="option-group">
        <span className="option-label">Password</span>
        <input className="option-input" type="password" placeholder="Enter PDF password" />
      </div>
    ),
    actionLabel: "Unlock PDF", resultName: "Unlocked.pdf",
  },
  protect: {
    title: "PROTECT PDF", desc: "Password protect your PDF", multi: false, accept: ".pdf", acceptLabel: "PDF file",
    howItWorks: [
      { title: "Upload PDF", desc: "Select the PDF to protect." },
      { title: "Set password", desc: "Choose a strong password." },
      { title: "Download", desc: "Get your protected PDF." },
    ],
    options: () => (
      <>
        <div className="option-group">
          <span className="option-label">New Password</span>
          <input className="option-input" type="password" placeholder="Enter password" />
        </div>
        <div className="option-group">
          <span className="option-label">Confirm Password</span>
          <input className="option-input" type="password" placeholder="Confirm password" />
        </div>
      </>
    ),
    actionLabel: "Protect PDF", resultName: "Protected.pdf",
  },
  organize: {
    title: "ORGANIZE PDF", desc: "Reorder, delete, or add pages", multi: false, accept: ".pdf", acceptLabel: "PDF file",
    howItWorks: [
      { title: "Upload PDF", desc: "Select the PDF." },
      { title: "Organize pages", desc: "Reorder or delete pages." },
      { title: "Download", desc: "Get your organized PDF." },
    ],
    options: () => (
      <div style={{ display: "flex", gap: 6, flexDirection: "column" }}>
        {["Reorder Pages","Delete Pages","Add Pages"].map((a) => (
          <button key={a} className="btn btn-ghost btn-sm" style={{ justifyContent: "center" }}>{a}</button>
        ))}
      </div>
    ),
    actionLabel: "Organize PDF", resultName: "Organized.pdf",
  },
  ocr: {
    title: "OCR PDF", desc: "Make scanned PDFs searchable and editable", multi: false, accept: ".pdf", acceptLabel: "PDF file",
    howItWorks: [
      { title: "Upload scanned PDF", desc: "Select a scanned PDF." },
      { title: "Select language", desc: "Choose the document language." },
      { title: "Download", desc: "Get your searchable PDF." },
    ],
    options: () => (
      <div className="option-group">
        <span className="option-label">Language</span>
        <select className="option-select">
          <option>English</option><option>Hindi</option><option>Spanish</option><option>French</option><option>German</option><option>Chinese</option>
        </select>
      </div>
    ),
    actionLabel: "Run OCR", resultName: "OCR_Result.pdf",
  },
  ai: {
    title: "AI SUMMARIZE", desc: "Get an AI-generated summary of your PDF", multi: false, accept: ".pdf", acceptLabel: "PDF file",
    howItWorks: [
      { title: "Upload PDF", desc: "Select your PDF." },
      { title: "AI reads it", desc: "Our AI extracts and summarizes." },
      { title: "View summary", desc: "Copy or download the summary." },
    ],
    options: () => (
      <div className="option-group">
        <span className="option-label">Summary Length</span>
        <select className="option-select"><option>Short</option><option>Medium</option><option>Detailed</option></select>
      </div>
    ),
    actionLabel: "Summarize PDF", resultName: "Summary.txt",
  },
};

interface FileEntry {
  file: File;
  id: string;
  name: string;
  size: string;
}

export default function ToolPage({ params }: { params: { toolId: string } }) {
  const router = useRouter();
  const cfg = toolConfigs[params.toolId];
  const tool = tools.find((t) => t.id === params.toolId);

  const [files, setFiles] = useState<FileEntry[]>([]);
  const [state, setState] = useState<ToolState>({
    splitMode: "Split by page range",
    rotation: "Rotate Left",
    wmTab: "Text",
  });
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
  }, [cfg?.multi]);

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
      p += Math.random() * 9 + 5;
      if (p >= 100) {
        p = 100;
        clearInterval(interval);
        setTimeout(() => setProcessState("complete"), 350);
      }
      setProgress(Math.min(p, 100));
      setCurrentStep(Math.min(Math.floor((p / 100) * 4), 4));
    }, 160);
  };

  if (!cfg || !tool) {
    return (
      <div className="container" style={{ padding: "100px 0", textAlign: "center" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--accent)", letterSpacing: 2, marginBottom: 16 }}>// 404</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 64, letterSpacing: 2, color: "var(--white)" }}>
          TOOL NOT<br />FOUND
        </h1>
        <button className="btn btn-primary btn-lg" style={{ marginTop: 32 }} onClick={() => router.push("/")}>
          Back to Home
        </button>
      </div>
    );
  }

  const stepLabels = ["Uploading", "Queued", "Processing", "Finalizing", "Complete"];

  return (
    <div className="tool-page">
      <div className="container">
        <button className="back-btn" onClick={() => router.back()}>
          <Icon d={icons.arrowLeft} size={14} /> All Tools
        </button>

        <div className="tool-page-header">
          <div className="section-label">// {tool.category}</div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(48px,6vw,80px)", letterSpacing: 2, color: "var(--white)", lineHeight: 0.95, marginBottom: 12 }}>
            {cfg.title}
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 15 }}>{cfg.desc}</p>
        </div>

        <div className="tool-layout">
          {/* Main */}
          <div>
            {processState === "idle" && (
              <>
                <div
                  className={`dropzone${isDrag ? " drag-over" : ""}`}
                  onDragOver={(e) => { e.preventDefault(); setIsDrag(true); }}
                  onDragLeave={() => setIsDrag(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInput.current?.click()}
                >
                  <div className="dropzone-icon"><Icon d={icons.upload} size={44} /></div>
                  <h3>Drop {cfg.acceptLabel} here</h3>
                  <p>or click to browse from your device</p>
                  <button
                    className="btn btn-primary"
                    onClick={(e) => { e.stopPropagation(); fileInput.current?.click(); }}
                  >
                    <Icon d={icons.upload} size={15} /> Select Files
                  </button>
                  <p className="dropzone-or" style={{ fontFamily: "var(--font-mono)" }}>
                    // Accepts: {cfg.accept.split(",").join(" ")}
                  </p>
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
                          <span className="file-icon"><Icon d={icons.file} size={18} /></span>
                          <div className="file-info">
                            <div className="file-name">{f.name}</div>
                            <div className="file-size">{f.size}</div>
                          </div>
                          <button
                            className="file-remove"
                            onClick={() => setFiles((prev) => prev.filter((x) => x.id !== f.id))}
                          >
                            <Icon d={icons.x} size={13} />
                          </button>
                        </div>
                      ))}
                    </div>

                    {cfg.multi && (
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ marginTop: 10 }}
                        onClick={() => fileInput.current?.click()}
                      >
                        <Icon d={icons.upload} size={13} /> Add more
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
                <div
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 11,
                    color: "var(--accent)",
                    letterSpacing: 2,
                    marginBottom: 16,
                  }}
                >
                  // Processing
                </div>
                <h2>WORKING ON IT...</h2>
                <p>Please wait while we process your file{files.length > 1 ? "s" : ""}.</p>
                <div className="progress-bar-wrap">
                  <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                </div>
                <div className="progress-label">{Math.round(progress)}%</div>
                <div className="steps-list">
                  {stepLabels.map((label, i) => (
                    <div key={label} className="step-item">
                      <div className={`step-dot${i < currentStep ? " done" : i === currentStep ? " active" : ""}`}>
                        {i < currentStep && <Icon d={icons.check} size={9} strokeWidth={3} />}
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
                <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--success)", letterSpacing: 2, marginBottom: 12 }}>
                  // Success
                </div>
                <h2>DONE!</h2>
                <p>Your file has been processed successfully.</p>
                <div className="file-result">
                  <span style={{ color: "var(--accent)" }}><Icon d={icons.file} size={22} /></span>
                  <div className="file-result-info">
                    <div className="file-result-name">{cfg.resultName}</div>
                    <div className="file-result-size">Ready to download</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                  <button className="btn btn-success btn-lg">
                    <Icon d={icons.download} size={15} /> Download
                  </button>
                  <button
                    className="btn btn-ghost btn-lg"
                    onClick={() => { setFiles([]); setProcessState("idle"); setProgress(0); }}
                  >
                    Process Another
                  </button>
                </div>
              </div>
            )}

            {processState === "error" && (
              <div className="state-card">
                <div className="error-icon">!</div>
                <h2>FAILED</h2>
                <p>Something went wrong. Please try again.</p>
                <button className="btn btn-primary btn-lg" onClick={() => { setProcessState("idle"); setProgress(0); }}>
                  Try Again
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <div className="options-card">
              <div className="options-title">Options</div>
              {cfg.options({ state, setState })}
            </div>

            <div className="how-it-works">
              <div className="how-title">How It Works</div>
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

            <div className="security-note" style={{ marginTop: 12 }}>
              <Icon d={icons.shield} size={16} style={{ color: "var(--success)", flexShrink: 0, marginTop: 1 }} />
              <p>
                <strong>Secure processing.</strong> All files encrypted in transit. Permanently deleted after processing.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
