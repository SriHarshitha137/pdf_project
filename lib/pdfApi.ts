
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