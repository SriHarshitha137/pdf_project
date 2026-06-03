
export interface MergeResponse {
  job_id: string;
  status: string;
}

export interface JobStatusResponse {
  job_id: string;
  status: string;
  progress: number;
}

export interface DownloadResponse {
  download_url: string;
}