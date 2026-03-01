export const IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/svg+xml',
  'image/webp',
  'image/bmp',
]);

export const TEXT_MIME_TYPES = new Set(['text/plain', 'text/markdown', 'text/x-markdown']);

export const getAppIdForMime = (mimeType: string | undefined): string => {
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType && (IMAGE_MIME_TYPES.has(mimeType) || mimeType.startsWith('image/')))
    return 'image-viewer';
  if (mimeType && (TEXT_MIME_TYPES.has(mimeType) || mimeType.startsWith('text/'))) return 'notepad';
  return 'files';
};
