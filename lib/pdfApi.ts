
import { api } from "./api";

export async function mergePdf(
  files: File[]
) {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append("files", file);
  });

  const response = await api.post(
    "/api/v1/tools/merge-pdf",
    formData,
    {
      headers: {
        "Content-Type":
          "multipart/form-data",
      },
    }
  );

  return response.data;
}
export async function uploadFile(
  file: File
) {
  const formData = new FormData();

  formData.append("file", file);

  const response = await api.post(
    "/api/v1/files/upload",
    formData,
    {
      headers: {
        "Content-Type":
          "multipart/form-data",
      },
    }
  );

  return response.data;
}
export async function splitPdf(
  fileId: number
) {
  const response = await api.post(
    "/api/v1/tools/split-pdf",
    {
      file_id: fileId,
    }
  );

  return response.data;
}
export async function compressPdf(
  fileId: number
) {
  const response = await api.post(
    "/api/v1/tools/compress-pdf",
    {
      file_id: fileId,
      compression_level: "medium",
    }
  );

  return response.data;
}

export async function protectPdf(
  fileId: number,
  password: string
) {
  const response = await api.post(
    "/api/v1/tools/protect-pdf",
    {
      file_id: fileId,
      password,
    }
  );

  return response.data;
}

export async function unlockPdf(
  fileId: number,
  password: string
) {
  const response = await api.post(
    "/api/v1/tools/unlock-pdf",
    {
      file_id: fileId,
      password,
    }
  );

  return response.data;
}

export async function pdfToJpg(
  fileId: number
) {
  const response = await api.post(
    "/api/v1/tools/pdf-to-jpg",
    {
      file_id: fileId,
    }
  );

  return response.data;
}
export async function jpgToPdf(
  fileIds: number[]
) {
  const response = await api.post(
    "/api/v1/tools/jpg-to-pdf",
    {
      file_ids: fileIds,
    }
  );

  return response.data;
}
export async function ocrPdf(
  fileId: number
) {
  const response = await api.post(
    "/api/v1/tools/ocr",
    {
      file_id: fileId,
      language: "english",
    }
  );

  return response.data;
}



export async function getJobStatus(
  jobId: string
) {
  const response = await api.get(
    `/api/v1/jobs/${jobId}/status`
  );

  return response.data;
}

export async function getDownloadUrl(
  jobId: string
) {
  const response = await api.get(
    `/api/v1/jobs/${jobId}/download`
  );

  return response.data;
}


export async function rotatePdf(
  fileId: number
) {
  const response = await api.post(
    "/api/v1/tools/rotate-pdf",
    {
      file_id: fileId,
      direction: "right",
    }
  );

  return response.data;
}

export async function watermarkPdf(
  fileId: number
) {
  const response = await api.post(
    "/api/v1/tools/watermark-pdf",
    {
      file_id: fileId,
      watermark_text: "CONFIDENTIAL",
    }
  );

  return response.data;
}

export async function organizePdf(
  fileId: number
) {
  const response = await api.post(
    "/api/v1/tools/organize-pdf",
    {
      file_id: fileId,
    }
  );

  return response.data;
}

export async function aiSummarize(
  fileId: number
) {
  const response = await api.post(
    "/api/v1/tools/ai-summarize",
    {
      file_id: fileId,
    }
  );

  return response.data;
}

export async function addPageNumbers(
  fileId: number,
  position: string
) {
  const response = await api.post(
    "/api/v1/tools/add-page-numbers",
    {
      file_id: fileId,
      position,
    }
  );

  return response.data;
}

export async function wordToPdf(
  fileId: number
) {
  const response = await api.post(
    "/api/v1/tools/word-to-pdf",
    {
      file_id: fileId,
    }
  );

  return response.data;
}

export async function pdfToWord(
  fileId: number
) {
  const response = await api.post(
    "/api/v1/tools/pdf-to-word",
    {
      file_id: fileId,
    }
  );

  return response.data;
}

export async function excelToPdf(
  fileId: number
) {
  const response = await api.post(
    "/api/v1/tools/excel-to-pdf",
    {
      file_id: fileId,
    }
  );

  return response.data;
}

export async function pdfToExcel(
  fileId: number
) {
  const response = await api.post(
    "/api/v1/tools/pdf-to-excel",
    {
      file_id: fileId,
    }
  );

  return response.data;
}

export async function pptToPdf(
  fileId: number
) {
  const response = await api.post(
    "/api/v1/tools/ppt-to-pdf",
    {
      file_id: fileId,
    }
  );

  return response.data;
}

export async function signPdf(
  fileId: number
) {
  const response = await api.post(
    "/api/v1/tools/sign-pdf",
    {
      file_id: fileId,
    }
  );

  return response.data;
}

export async function aiTranslate(
  fileId: number,
  targetLanguage: string
) {
  const response = await api.post(
    "/api/v1/tools/ai-translate",
    {
      file_id: fileId,
      target_language: targetLanguage,
    }
  );

  return response.data;
}

export async function aiRewrite(
  fileId: number,
  tone: string
) {
  const response = await api.post(
    "/api/v1/tools/ai-rewrite",
    {
      file_id: fileId,
      tone,
    }
  );

  return response.data;
}