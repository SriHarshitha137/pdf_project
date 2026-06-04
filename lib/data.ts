export const icons: Record<string, string | string[]> = {
  merge: ["M8 3H5a2 2 0 00-2 2v3","M21 8V5a2 2 0 00-2-2h-3","M3 16v3a2 2 0 002 2h3","M16 21h3a2 2 0 002-2v-3","M12 8v8","M8 12h8"],
  split: ["M16 3h5v5","M8 3H3v5","M12 22v-8.3a4 4 0 00-1.172-2.872L3 3","M12 22v-8.3a4 4 0 011.172-2.872L21 3"],
  compress: ["M4 14h6v6","M20 10h-6V4","M14 10l7-7","M3 21l7-7"],
  pdf2jpg: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z",
  jpg2pdf: ["M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z","M14 2v6h6","M16 13H8","M16 17H8","M10 9H8"],
  rotate: "M1 4v6h6M23 20v-6h-6M20.49 9A9 9 0 005.64 5.64L1 10M23 14l-4.64 4.36A9 9 0 013.51 15",
  watermark: ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"],
  unlock: ["M8 11V7a4 4 0 018 0","M5 11h14a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2v-7a2 2 0 012-2z","M12 16v2"],
  protect: ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10","M9 12l2 2 4-4"],
  organize: ["M8 6h13","M8 12h13","M8 18h13","M3 6h.01","M3 12h.01","M3 18h.01"],
  ocr: ["M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4","M10 17l5-5-5-5","M13.8 12H3"],
  ai: ["M12 2a10 10 0 110 20A10 10 0 0112 2z","M12 8v4l3 3"],
  upload: ["M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4","M17 8l-5-5-5 5","M12 3v12"],
  download: ["M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4","M7 10l5 5 5-5","M12 15V3"],
  x: "M18 6L6 18M6 6l12 12",
  check: "M20 6L9 17l-5-5",
  chevronDown: "M6 9l6 6 6-6",
  chevronRight: "M9 18l6-6-6-6",
  arrowLeft: "M19 12H5M12 19l-7-7 7-7",
  menu: ["M3 12h18","M3 6h18","M3 18h18"],
  search: ["M11 19a8 8 0 100-16 8 8 0 000 16z","M21 21l-4.35-4.35"],
  file: ["M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z","M14 2v6h6"],
  star: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  zap: "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  users: ["M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2","M23 21v-2a4 4 0 00-3-3.87","M16 3.13a4 4 0 010 7.75","M9 7a4 4 0 100 8 4 4 0 000-8z"],
  globe: ["M12 2a10 10 0 110 20A10 10 0 0112 2z","M2 12h20","M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"],
  settings: ["M12 15a3 3 0 100-6 3 3 0 000 6z","M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"],
};

export interface Tool {
  id: string;
  label: string;
  desc: string;
  color: string;
  icon: string | string[];
  category: string;
}

export const tools: Tool[] = [
  { id: "merge",    label: "Merge PDF",      desc: "Combine multiple PDFs into a single file",           color: "#E84040", icon: icons.merge,    category: "Merge & Split" },
  { id: "split",    label: "Split PDF",      desc: "Extract pages or split PDF into parts",              color: "#E8A040", icon: icons.split,    category: "Merge & Split" },
  { id: "compress", label: "Compress PDF",   desc: "Reduce PDF file size without losing quality",        color: "#40A8E8", icon: icons.compress, category: "Compress" },
  { id: "pdf2jpg",  label: "PDF to JPG",     desc: "Convert PDF pages to JPG images",                   color: "#E84080", icon: icons.pdf2jpg,  category: "Convert" },
  { id: "jpg2pdf",  label: "JPG to PDF",     desc: "Convert images to PDF document",                    color: "#8040E8", icon: icons.jpg2pdf,  category: "Convert" },
  { id: "rotate",   label: "Rotate PDF",     desc: "Rotate PDF pages left or right",                    color: "#40C8A8", icon: icons.rotate,   category: "Edit & Sign" },
  { id: "watermark",label: "Watermark PDF",  desc: "Add text or image watermark to PDF",                color: "#E8C040", icon: icons.watermark,category: "Edit & Sign" },
  { id: "unlock",   label: "Unlock PDF",     desc: "Remove password and restrictions",                  color: "#40E880", icon: icons.unlock,   category: "Protect" },
  { id: "protect",  label: "Protect PDF",    desc: "Add password and encrypt your PDF",                 color: "#E86040", icon: icons.protect,  category: "Protect" },
  { id: "organize", label: "Organize PDF",   desc: "Reorder, delete or add pages in PDF",               color: "#6080E8", icon: icons.organize, category: "Organize" },
  { id: "ocr",      label: "OCR PDF",        desc: "Make scanned PDF searchable and editable",          color: "#40E8C8", icon: icons.ocr,      category: "OCR" },
  { id: "ai",       label: "AI Summarize",   desc: "Get AI summary of your PDF content",                color: "#C840E8", icon: icons.ai,       category: "AI" },
];

export const categories = ["All Tools", "Merge & Split", "Convert", "Edit & Sign", "Compress", "Protect", "OCR", "Organize", "AI"];

export interface Plan {
  name: string;
  price: string;
  desc: string;
  features: string[];
  featured?: boolean;
}

export const plans: Plan[] = [
  {
    name: "Free",
    price: "₹0",
    desc: "Perfect for occasional use",
    features: ["5 files/day", "Basic PDF tools", "Up to 10MB per file", "Standard processing speed"],
  },
  {
    name: "Pro",
    price: "₹299",
    desc: "For power users and professionals",
    features: ["Unlimited files", "All PDF tools", "Up to 500MB per file", "Priority processing", "No watermarks", "API access"],
    featured: true,
  },
  {
    name: "Team",
    price: "₹799",
    desc: "For teams and businesses",
    features: ["Everything in Pro", "5 team members", "Team dashboard", "Priority support", "Custom branding", "Invoice & receipts"],
  },
];
