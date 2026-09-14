// Single source of truth for building Google Drive URLs from a file ID or full shareable link.

export function extractDriveFileId(idOrUrl) {
  if (!idOrUrl) return null;
  // If it's already a clean ID (no slashes)
  if (!idOrUrl.includes('/')) return idOrUrl;
  
  // Extract ID from full URL formats:
  // - https://drive.google.com/file/d/FILE_ID/view
  // - https://drive.google.com/open?id=FILE_ID
  const match = idOrUrl.match(/\/d\/([a-zA-Z0-9_-]+)/) || idOrUrl.match(/id=([a-zA-Z0-9_-]+)/);
  return match ? match[1] : idOrUrl;
}

export function getDrivePreviewUrl(idOrUrl) {
  const fileId = extractDriveFileId(idOrUrl);
  if (!fileId) return '#';
  return `https://drive.google.com/file/d/${fileId}/preview`;
}

export function getDriveDownloadUrl(idOrUrl) {
  const fileId = extractDriveFileId(idOrUrl);
  if (!fileId) return '#';
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}