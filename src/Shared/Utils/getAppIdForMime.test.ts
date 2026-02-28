import { describe, it, expect } from 'vitest';
import { getAppIdForMime } from './getAppIdForMime';

describe('getAppIdForMime', () => {
  it('should return "pdf" for application/pdf', () => {
    expect(getAppIdForMime('application/pdf')).toBe('pdf');
  });

  it.each([
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/svg+xml',
    'image/webp',
    'image/bmp',
    'image/avif',
  ])('should return "image-viewer" for %s', mimeType => {
    expect(getAppIdForMime(mimeType)).toBe('image-viewer');
  });

  it('should return "files" for unknown mimeType', () => {
    expect(getAppIdForMime('text/plain')).toBe('files');
  });

  it('should return "files" for undefined', () => {
    expect(getAppIdForMime(undefined)).toBe('files');
  });
});
