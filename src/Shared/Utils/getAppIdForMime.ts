const IMAGE_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/svg+xml',
  'image/webp',
  'image/bmp',
]);

export const getAppIdForMime = (mimeType: string | undefined): string => {
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType && (IMAGE_MIME_TYPES.has(mimeType) || mimeType.startsWith('image/')))
    return 'image-viewer';
  return 'files';
};
