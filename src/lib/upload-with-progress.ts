export interface UploadResult {
  url?: string;
  error?: string;
}

export function uploadWithProgress(
  endpoint: string,
  file: File,
  onProgress?: (percent: number) => void
): Promise<UploadResult> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', endpoint);

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener('load', () => {
      let parsed: UploadResult = {};
      try {
        parsed = xhr.responseText ? JSON.parse(xhr.responseText) : {};
      } catch {
        parsed = {};
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve({ url: parsed.url });
      } else {
        resolve({ error: parsed.error || `خطا در آپلود (${xhr.status})` });
      }
    });

    xhr.addEventListener('error', () => {
      resolve({ error: 'خطای اتصال به سرور' });
    });
    xhr.addEventListener('abort', () => {
      resolve({ error: 'آپلود لغو شد' });
    });

    const formData = new FormData();
    formData.append('file', file);
    xhr.send(formData);
  });
}
