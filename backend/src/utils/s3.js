// AWS S3 support removed. This file intentionally left as a stub
// to avoid import errors if any legacy references remain.
export function getS3Client() { return null; }
export function getS3UploadStrategy() { return 'on-demand'; }
export async function ensureFileInS3() { return null; }
export async function uploadFileToS3() { return null; }
export async function getPresignedDownloadUrl() { return null; }
export function defaultS3KeyForStoredName() { return ''; }
