// ─── File Type Detection & Smart Conversion Map ───────────────────────────

export type FileKind =
  | "pdf"
  | "jpg"
  | "png"
  | "webp"
  | "gif"
  | "bmp"
  | "tiff"
  | "svg"
  | "docx"
  | "doc"
  | "xlsx"
  | "pptx"
  | "txt"
  | "unknown";

export interface ConvertOption {
  to: string;          // target format label  e.g. "PDF", "JPG"
  toolId: string;      // which tool page to use
  label: string;       // dropdown label  e.g. "PNG → PDF"
  icon: string;        // SVG path for the icon
  description: string; // short explanation shown under label
}

export interface DetectedFile {
  kind: FileKind;
  ext: string;
  mime: string;
  label: string;       // human name e.g. "PNG Image"
  convertOptions: ConvertOption[];
  otherActions: { toolId: string; label: string; icon: string }[];
}

// ── Detect kind from File object ────────────────────────────────────────────
export function detectFileKind(file: File): FileKind {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const mime = file.type.toLowerCase();

  if (mime === "application/pdf" || ext === "pdf") return "pdf";
  if (mime === "image/jpeg" || ext === "jpg" || ext === "jpeg") return "jpg";
  if (mime === "image/png" || ext === "png") return "png";
  if (mime === "image/webp" || ext === "webp") return "webp";
  if (mime === "image/gif" || ext === "gif") return "gif";
  if (mime === "image/bmp" || ext === "bmp") return "bmp";
  if (mime === "image/tiff" || ext === "tiff" || ext === "tif") return "tiff";
  if (mime === "image/svg+xml" || ext === "svg") return "svg";
  if (
    mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    ext === "docx"
  )
    return "docx";
  if (mime === "application/msword" || ext === "doc") return "doc";
  if (
    mime === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    ext === "xlsx"
  )
    return "xlsx";
  if (
    mime ===
      "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
    ext === "pptx"
  )
    return "pptx";
  if (mime === "text/plain" || ext === "txt") return "txt";
  return "unknown";
}

// ── Human-readable labels ───────────────────────────────────────────────────
const KIND_LABELS: Record<FileKind, string> = {
  pdf: "PDF Document",
  jpg: "JPG Image",
  png: "PNG Image",
  webp: "WebP Image",
  gif: "GIF Image",
  bmp: "BMP Image",
  tiff: "TIFF Image",
  svg: "SVG Image",
  docx: "Word Document",
  doc: "Word Document (Legacy)",
  xlsx: "Excel Spreadsheet",
  pptx: "PowerPoint Presentation",
  txt: "Text File",
  unknown: "File",
};

// ── Icon paths ─────────────────────────────────────────────────────────────
const ICONS = {
  image:    "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
  pdf:      ["M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z", "M14 2v6h6"],
  compress: ["M4 14h6v6", "M20 10h-6V4", "M14 10l7-7", "M3 21l7-7"],
  rotate:   "M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15",
  split:    ["M16 3h5v5", "M8 3H3v5", "M12 22v-8.3a4 4 0 00-1.172-2.872L3 3", "M12 22v-8.3a4 4 0 011.172-2.872L21 3"],
  merge:    ["M8 3H5a2 2 0 00-2 2v3", "M21 8V5a2 2 0 00-2-2h-3", "M3 16v3a2 2 0 002 2h3", "M16 21h3a2 2 0 002-2v-3", "M12 8v8", "M8 12h8"],
  lock:     ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10", "M9 12l2 2 4-4"],
  unlock:   ["M8 11V7a4 4 0 018 0", "M5 11h14a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7a2 2 0 012-2z", "M12 16v2"],
  ocr:      ["M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4", "M10 17l5-5-5-5", "M13.8 12H3"],
  watermark:["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"],
  organize: ["M8 6h13", "M8 12h13", "M8 18h13", "M3 6h.01", "M3 12h.01", "M3 18h.01"],
  ai:       ["M12 2a10 10 0 110 20A10 10 0 0112 2z", "M12 8v4l3 3"],
  word:     ["M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z", "M14 2v6h6", "M8 13h8", "M8 17h5"],
  jpg:      "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
};

// ── Conversion map  (source kind → possible targets) ──────────────────────
const CONVERT_MAP: Record<FileKind, ConvertOption[]> = {
  // ── PDF source ────────────────────────────────────────────────────────────
  pdf: [
    { to: "JPG",  toolId: "pdf2jpg", label: "PDF → JPG",  icon: ICONS.jpg,      description: "Convert each page to a JPG image" },
    { to: "PNG",  toolId: "pdf2jpg", label: "PDF → PNG",  icon: ICONS.image,    description: "Convert each page to a PNG image" },
    { to: "WORD", toolId: "ocr",     label: "PDF → Word", icon: Array.isArray(ICONS.word) ? ICONS.word[0] : ICONS.word, description: "Extract text into an editable Word file" },
    { to: "TXT",  toolId: "ocr",     label: "PDF → Text", icon: Array.isArray(ICONS.ocr) ? ICONS.ocr[0] : ICONS.ocr,  description: "Extract all text content from PDF" },
  ],

  // ── Image sources ─────────────────────────────────────────────────────────
  jpg: [
    { to: "PDF",  toolId: "jpg2pdf", label: "JPG → PDF",  icon: Array.isArray(ICONS.pdf) ? ICONS.pdf[0] : ICONS.pdf, description: "Pack one or more JPGs into a PDF" },
    { to: "PNG",  toolId: "jpg2pdf", label: "JPG → PNG",  icon: ICONS.image,   description: "Convert JPG to lossless PNG format" },
    { to: "WEBP", toolId: "jpg2pdf", label: "JPG → WebP", icon: ICONS.image,   description: "Convert to modern WebP format" },
  ],
  png: [
    { to: "PDF",  toolId: "jpg2pdf", label: "PNG → PDF",  icon: Array.isArray(ICONS.pdf) ? ICONS.pdf[0] : ICONS.pdf, description: "Pack one or more PNGs into a PDF" },
    { to: "JPG",  toolId: "jpg2pdf", label: "PNG → JPG",  icon: ICONS.jpg,     description: "Convert to compressed JPG format" },
    { to: "WEBP", toolId: "jpg2pdf", label: "PNG → WebP", icon: ICONS.image,   description: "Convert to modern WebP format" },
  ],
  webp: [
    { to: "PDF",  toolId: "jpg2pdf", label: "WebP → PDF", icon: Array.isArray(ICONS.pdf) ? ICONS.pdf[0] : ICONS.pdf, description: "Convert WebP image to PDF" },
    { to: "JPG",  toolId: "jpg2pdf", label: "WebP → JPG", icon: ICONS.jpg,     description: "Convert WebP to JPG format" },
    { to: "PNG",  toolId: "jpg2pdf", label: "WebP → PNG", icon: ICONS.image,   description: "Convert WebP to lossless PNG" },
  ],
  gif: [
    { to: "PDF",  toolId: "jpg2pdf", label: "GIF → PDF",  icon: Array.isArray(ICONS.pdf) ? ICONS.pdf[0] : ICONS.pdf, description: "Convert GIF frame(s) to PDF" },
    { to: "JPG",  toolId: "jpg2pdf", label: "GIF → JPG",  icon: ICONS.jpg,     description: "Convert GIF to JPG image" },
    { to: "PNG",  toolId: "jpg2pdf", label: "GIF → PNG",  icon: ICONS.image,   description: "Convert GIF to PNG image" },
  ],
  bmp: [
    { to: "PDF",  toolId: "jpg2pdf", label: "BMP → PDF",  icon: Array.isArray(ICONS.pdf) ? ICONS.pdf[0] : ICONS.pdf, description: "Convert BMP to PDF" },
    { to: "JPG",  toolId: "jpg2pdf", label: "BMP → JPG",  icon: ICONS.jpg,     description: "Convert BMP to JPG" },
    { to: "PNG",  toolId: "jpg2pdf", label: "BMP → PNG",  icon: ICONS.image,   description: "Convert BMP to PNG" },
  ],
  tiff: [
    { to: "PDF",  toolId: "jpg2pdf", label: "TIFF → PDF", icon: Array.isArray(ICONS.pdf) ? ICONS.pdf[0] : ICONS.pdf, description: "Convert TIFF to PDF" },
    { to: "JPG",  toolId: "jpg2pdf", label: "TIFF → JPG", icon: ICONS.jpg,     description: "Convert TIFF to JPG" },
    { to: "PNG",  toolId: "jpg2pdf", label: "TIFF → PNG", icon: ICONS.image,   description: "Convert TIFF to PNG" },
  ],
  svg: [
    { to: "PDF",  toolId: "jpg2pdf", label: "SVG → PDF",  icon: Array.isArray(ICONS.pdf) ? ICONS.pdf[0] : ICONS.pdf, description: "Convert SVG vector to PDF" },
    { to: "PNG",  toolId: "jpg2pdf", label: "SVG → PNG",  icon: ICONS.image,   description: "Rasterize SVG to PNG" },
  ],

  // ── Document sources ──────────────────────────────────────────────────────
  docx: [
    { to: "PDF",  toolId: "jpg2pdf", label: "Word → PDF", icon: Array.isArray(ICONS.pdf) ? ICONS.pdf[0] : ICONS.pdf, description: "Convert Word document to PDF" },
  ],
  doc: [
    { to: "PDF",  toolId: "jpg2pdf", label: "Doc → PDF",  icon: Array.isArray(ICONS.pdf) ? ICONS.pdf[0] : ICONS.pdf, description: "Convert legacy Word to PDF" },
  ],
  xlsx: [
    { to: "PDF",  toolId: "jpg2pdf", label: "Excel → PDF",icon: Array.isArray(ICONS.pdf) ? ICONS.pdf[0] : ICONS.pdf, description: "Convert spreadsheet to PDF" },
  ],
  pptx: [
    { to: "PDF",  toolId: "jpg2pdf", label: "PPT → PDF",  icon: Array.isArray(ICONS.pdf) ? ICONS.pdf[0] : ICONS.pdf, description: "Convert presentation to PDF" },
    { to: "JPG",  toolId: "pdf2jpg", label: "PPT → JPG",  icon: ICONS.jpg,     description: "Convert slides to JPG images" },
  ],
  txt: [
    { to: "PDF",  toolId: "jpg2pdf", label: "TXT → PDF",  icon: Array.isArray(ICONS.pdf) ? ICONS.pdf[0] : ICONS.pdf, description: "Convert plain text to PDF" },
  ],
  unknown: [],
};

// ── Other actions available per kind (non-convert) ─────────────────────────
const OTHER_ACTIONS_MAP: Partial<Record<FileKind, { toolId: string; label: string; icon: string }[]>> = {
  pdf: [
    { toolId: "compress",  label: "Compress",  icon: "compress" },
    { toolId: "merge",     label: "Merge",     icon: "merge" },
    { toolId: "split",     label: "Split",     icon: "split" },
    { toolId: "rotate",    label: "Rotate",    icon: "rotate" },
    { toolId: "watermark", label: "Watermark", icon: "watermark" },
    { toolId: "protect",   label: "Protect",   icon: "lock" },
    { toolId: "unlock",    label: "Unlock",    icon: "unlock" },
    { toolId: "ocr",       label: "OCR",       icon: "ocr" },
    { toolId: "organize",  label: "Organize",  icon: "organize" },
    { toolId: "ai",        label: "AI Summary",icon: "ai" },
  ],
  jpg:  [{ toolId: "jpg2pdf", label: "Make PDF", icon: "pdf" }, { toolId: "watermark", label: "Watermark", icon: "watermark" }],
  png:  [{ toolId: "jpg2pdf", label: "Make PDF", icon: "pdf" }, { toolId: "watermark", label: "Watermark", icon: "watermark" }],
  webp: [{ toolId: "jpg2pdf", label: "Make PDF", icon: "pdf" }],
  gif:  [{ toolId: "jpg2pdf", label: "Make PDF", icon: "pdf" }],
  bmp:  [{ toolId: "jpg2pdf", label: "Make PDF", icon: "pdf" }],
  tiff: [{ toolId: "jpg2pdf", label: "Make PDF", icon: "pdf" }],
};

// ── Main export ─────────────────────────────────────────────────────────────
export function analyzeFile(file: File): DetectedFile {
  const kind = detectFileKind(file);
  return {
    kind,
    ext: file.name.split(".").pop()?.toUpperCase() ?? "FILE",
    mime: file.type || "application/octet-stream",
    label: KIND_LABELS[kind],
    convertOptions: CONVERT_MAP[kind] ?? [],
    otherActions: OTHER_ACTIONS_MAP[kind] ?? [],
  };
}
