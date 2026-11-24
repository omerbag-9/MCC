/**
 * Larger files without R2 S3 credentials go through the Worker in parts of this size (an R2
 * multipart upload, /api/admin/uploads/multipart). R2 needs every part but the last to be the same
 * size and at least 5 MiB. Shared by the server and the browser (lib/client/upload.ts).
 */
export const UPLOAD_PART_BYTES = 10 * 1024 * 1024;
