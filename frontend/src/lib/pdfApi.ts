
import { api } from "./api";

// ─── File Upload ────────────────────────────────────────────
export async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await api.post(
    "/api/v1/files/upload",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return response.data; // { file_id, filename, file_url }
}

// ─── Merge PDF ──────────────────────────────────────────────
// Backend: POST /api/v1/merge/ → { file_ids: [int, int, ...] }
export async function mergePdf(fileIds: number[]) {
  const response = await api.post("/api/v1/merge/", {
    file_ids: fileIds,
  });
  return response.data; // { job_id, status }
}

// ─── Split PDF ──────────────────────────────────────────────
// Backend: POST /api/v1/split/ → { file_id }
export async function splitPdf(fileId: number) {
  const response = await api.post("/api/v1/split/", {
    file_id: fileId,
  });
  return response.data;
}

// ─── Compress PDF ───────────────────────────────────────────
// Backend: POST /api/v1/tools/compress-pdf → { file_id, compression_percent: int[0-100] }
export async function compressPdf(
  fileId: number,
  compressionPercent: number = 50
) {
  const response = await api.post(
    "/api/v1/tools/compress-pdf",
    {
      file_id: fileId,
      compression_percent: compressionPercent,
    }
  );
  return response.data;
}

// ─── Protect PDF ────────────────────────────────────────────
// Backend: POST /api/v1/protect/ → { file_id, password }
export async function protectPdf(
  fileId: number,
  password: string
) {
  const response = await api.post("/api/v1/protect/", {
    file_id: fileId,
    password,
  });
  return response.data;
}

// ─── Unlock PDF ─────────────────────────────────────────────
// Backend: POST /api/v1/unlock/ → { file_id, password }
export async function unlockPdf(
  fileId: number,
  password: string
) {
  const response = await api.post("/api/v1/unlock/", {
    file_id: fileId,
    password,
  });
  return response.data;
}

// ─── PDF to JPG ─────────────────────────────────────────────
// Backend: POST /api/v1/pdf-to-jpg/ → { file_id }
export async function pdfToJpg(fileId: number) {
  const response = await api.post("/api/v1/pdf-to-jpg/", {
    file_id: fileId,
  });
  return response.data;
}

// ─── JPG to PDF ─────────────────────────────────────────────
// Backend: POST /api/v1/jpg-to-pdf/ → { file_ids: [int] }
export async function jpgToPdf(fileIds: number[]) {
  const response = await api.post("/api/v1/jpg-to-pdf/", {
    file_ids: fileIds,
  });
  return response.data;
}

// ─── OCR PDF ────────────────────────────────────────────────
// Backend: POST /api/v1/tools/ocr → { file_id, language: "eng" }
export async function ocrPdf(
  fileId: number,
  language: string = "eng"
) {
  const response = await api.post("/api/v1/tools/ocr", {
    file_id: fileId,
    language,
  });
  return response.data;
}

// ─── Job Status ─────────────────────────────────────────────
export async function getJobStatus(jobId: number) {
  const response = await api.get(
    `/api/v1/jobs/${jobId}/status`
  );
  return response.data; // { job_id, status }
}

// ─── Job Download ───────────────────────────────────────────
// Authenticated download returning a Blob and filename
export async function downloadJobResult(jobId: number): Promise<{ blob: Blob, filename: string }> {
  const response = await api.get(`/api/v1/jobs/${jobId}/download`, {
    responseType: "blob",
  });
  
  // Try to extract filename from Content-Disposition header
  let filename = `result_${jobId}.pdf`;
  const disposition = response.headers["content-disposition"];
  if (disposition && disposition.indexOf("attachment") !== -1) {
    const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);
    if (matches != null && matches[1]) {
      filename = matches[1].replace(/['"]/g, "");
    }
  }

  return { blob: response.data, filename };
}

// ─── Rotate PDF ─────────────────────────────────────────────
// Backend: POST /api/v1/rotate/ → { file_id, rotation: 90|180|270 }
export async function rotatePdf(
  fileId: number,
  rotation: number = 90
) {
  const response = await api.post("/api/v1/rotate/", {
    file_id: fileId,
    rotation,
  });
  return response.data;
}

// ─── Watermark PDF ──────────────────────────────────────────
// Backend: POST /api/v1/watermark/ → { file_id, text }
export async function watermarkPdf(
  fileId: number,
  text: string
) {
  const response = await api.post("/api/v1/watermark/", {
    file_id: fileId,
    text,
  });
  return response.data;
}

// ─── Organize PDF ───────────────────────────────────────────
// Backend: POST /api/v1/tools/organize-pdf → { file_id, page_order: [int] }
export async function organizePdf(
  fileId: number,
  pageOrder: number[]
) {
  const response = await api.post(
    "/api/v1/tools/organize-pdf",
    {
      file_id: fileId,
      page_order: pageOrder,
    }
  );
  return response.data;
}

// ─── AI Summarise ───────────────────────────────────────────
// Backend: POST /api/v1/ai-summarise/ → { file_id }
export async function aiSummarize(fileId: number) {
  const response = await api.post("/api/v1/ai-summarise/", {
    file_id: fileId,
  });
  return response.data;
}

// ─── Add Page Numbers ───────────────────────────────────────
// Backend: POST /api/v1/page-numbers/ → { file_id }
export async function addPageNumbers(fileId: number) {
  const response = await api.post("/api/v1/page-numbers/", {
    file_id: fileId,
  });
  return response.data;
}

// ─── Word to PDF ────────────────────────────────────────────
// Backend: POST /api/v1/tools/word-to-pdf → { file_id }
export async function wordToPdf(fileId: number) {
  const response = await api.post(
    "/api/v1/tools/word-to-pdf",
    {
      file_id: fileId,
    }
  );
  return response.data;
}

// ─── PDF to Word ────────────────────────────────────────────
// Backend: POST /api/v1/tools/pdf-to-word → { file_id }
export async function pdfToWord(fileId: number) {
  const response = await api.post(
    "/api/v1/tools/pdf-to-word",
    {
      file_id: fileId,
    }
  );
  return response.data;
}

// ─── Excel to PDF ───────────────────────────────────────────
// Backend: POST /api/v1/tools/excel-to-pdf → { file_id }
export async function excelToPdf(fileId: number) {
  const response = await api.post(
    "/api/v1/tools/excel-to-pdf",
    {
      file_id: fileId,
    }
  );
  return response.data;
}

// ─── PDF to Excel ───────────────────────────────────────────
// Backend: POST /api/v1/tools/pdf-to-excel → { file_id }
export async function pdfToExcel(fileId: number) {
  const response = await api.post(
    "/api/v1/tools/pdf-to-excel",
    {
      file_id: fileId,
    }
  );
  return response.data;
}

// ─── PPT to PDF ─────────────────────────────────────────────
// Backend: POST /api/v1/tools/ppt-to-pdf → { file_id }
export async function pptToPdf(fileId: number) {
  const response = await api.post(
    "/api/v1/tools/ppt-to-pdf",
    {
      file_id: fileId,
    }
  );
  return response.data;
}

// ─── Sign PDF (unified) ────────────────────────────────────
// Backend: POST /api/v1/tools/sign-pdf → single endpoint with mode field
// modes: "typed" | "image" | "digital"
export async function signPdf(params: {
  pdfFileId: number;
  mode: "typed" | "image" | "digital";
  signatureText?: string;
  signatureFileId?: number;
  certificateFileId?: number;
  password?: string;
  page?: number;
  x?: number;
  y?: number;
}) {
  const response = await api.post(
    "/api/v1/tools/sign-pdf",
    {
      pdf_file_id: params.pdfFileId,
      mode: params.mode,
      signature_text: params.signatureText || null,
      signature_file_id: params.signatureFileId || null,
      certificate_file_id: params.certificateFileId || null,
      password: params.password || null,
      page: params.page ?? 0,
      x: params.x ?? 100,
      y: params.y ?? 700,
    }
  );
  return response.data;
}

// ─── QR to PDF ──────────────────────────────────────────────
// Backend: POST /api/v1/qr-pdf/ → { file_id, url }
export async function qrToPdf(
  fileId: number,
  url: string
) {
  const response = await api.post("/api/v1/qr-pdf/", {
    file_id: fileId,
    url,
  });
  return response.data;
}

// ─── AI Translate ───────────────────────────────────────────
// Backend: POST /api/v1/ai-translate/ → { file_id, target_language }
export async function aiTranslate(
  fileId: number,
  targetLanguage: string
) {
  const response = await api.post("/api/v1/ai-translate/", {
    file_id: fileId,
    target_language: targetLanguage,
  });
  return response.data;
}

// ─── AI Rewrite ─────────────────────────────────────────────
// Backend: POST /api/v1/ai-rewrite/ → { file_id, tone }
export async function aiRewrite(
  fileId: number,
  tone: string
) {
  const response = await api.post("/api/v1/ai-rewrite/", {
    file_id: fileId,
    tone,
  });
  return response.data;
}

// ─── QR Generator ───────────────────────────────────────────
// Backend: POST /api/v1/tools/generate-qr → { url }
// Note: Frontend uses client-side QR generation by default.
// This function is available if backend processing is desired.
export async function generateQr(url: string) {
  const response = await api.post(
    "/api/v1/tools/generate-qr",
    {
      url,
    }
  );
  return response.data;
}