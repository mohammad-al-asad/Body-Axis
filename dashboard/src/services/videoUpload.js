import { managementApi } from "./managementApi";

export async function uploadVideoMultipart(file, { onProgress } = {}) {
  const upload = await managementApi.initiateVideoMultipartUpload({
    file_name: file.name,
    content_type: file.type || "application/octet-stream",
    file_size: file.size,
  });

  const completedParts = [];
  let uploadedBytes = 0;

  try {
    for (const part of upload.parts) {
      const start = (part.part_number - 1) * upload.part_size;
      const end = Math.min(start + upload.part_size, file.size);
      const chunk = file.slice(start, end);
      const response = await fetch(part.url, {
        method: "PUT",
        body: chunk,
      });

      if (!response.ok) {
        throw new Error(`S3 upload failed on part ${part.part_number}.`);
      }

      const etag = response.headers.get("etag") || response.headers.get("ETag");
      if (!etag) {
        throw new Error(
          "S3 upload completed, but the ETag header was not exposed. Add bucket CORS with ETag in ExposeHeaders.",
        );
      }

      completedParts.push({
        part_number: part.part_number,
        etag,
      });
      uploadedBytes += chunk.size;
      onProgress?.({
        uploadedBytes,
        totalBytes: file.size,
        percent: Math.round((uploadedBytes / file.size) * 100),
      });
    }

    return {
      video_upload_key: upload.key,
      video_upload_id: upload.upload_id,
      video_upload_parts: JSON.stringify(completedParts),
      video_file_name: file.name,
      video_file_size: String(file.size),
    };
  } catch (error) {
    await managementApi.abortVideoMultipartUpload({
      key: upload.key,
      upload_id: upload.upload_id,
    }).catch(() => undefined);
    throw error;
  }
}
