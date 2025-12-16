const allowed = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/gif',
  'text/csv',
  'text/plain'
]);

export function isAllowedMimetype(mimetype) {
  return allowed.has(mimetype);
}

export function maxFileSizeBytes() {
  const mb = Number(process.env.MAX_FILE_SIZE_MB || 20);
  return mb * 1024 * 1024;
}
