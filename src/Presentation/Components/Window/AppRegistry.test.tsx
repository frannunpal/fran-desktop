// @vitest-environment jsdom
import '@/Shared/Testing/__mocks__/jsdom-setup';
import { describe, it, expect, vi } from 'vitest';

// Mock all app modules to isolate the registry logic from their dependencies
vi.mock('@presentation/Components/Apps/CalendarApp/CalendarApp', () => ({
  default: vi.fn(() => null),
}));
vi.mock('@presentation/Components/Apps/FilesApp/FilesApp', () => ({
  default: vi.fn(() => null),
}));
vi.mock('@presentation/Components/Apps/PdfApp/PdfApp', () => ({
  default: vi.fn(() => null),
}));
vi.mock('@presentation/Components/Apps/StorybookApp/StorybookApp', () => ({
  default: vi.fn(() => null),
}));
vi.mock('@presentation/Components/Apps/ImageViewerApp/ImageViewerApp', () => ({
  default: vi.fn(() => null),
}));
vi.mock('@presentation/Components/Apps/NotesApp/NotesApp', () => ({
  default: vi.fn(() => null),
}));
vi.mock('@presentation/Components/Shared/CreateItemApp/CreateItemApp', () => ({
  default: vi.fn(() => null),
}));
vi.mock('@presentation/Components/Shared/AppEmptyState/AppEmptyState', () => ({
  default: vi.fn(() => null),
}));
vi.mock('@presentation/Components/Apps/ImageViewerApp/buildImageViewerMenuBar', () => ({
  buildImageViewerMenuBar: vi.fn(() => []),
}));
vi.mock('@presentation/Components/Apps/PdfApp/buildPdfViewerMenuBar', () => ({
  buildPdfViewerMenuBar: vi.fn(() => []),
}));
vi.mock('@presentation/Components/Apps/NotesApp/buildNotesMenuBar', () => ({
  buildNotesMenuBar: vi.fn(() => []),
}));
vi.mock('@presentation/Store/desktopStore', () => ({
  useDesktopStore: { getState: vi.fn(() => ({ closeWindow: vi.fn() })) },
}));

const { getAppComponent, getMenuBarBuilder } = await import('./AppRegistry');

import CalendarApp from '@presentation/Components/Apps/CalendarApp/CalendarApp';
import FilesApp from '@presentation/Components/Apps/FilesApp/FilesApp';
import PdfApp from '@presentation/Components/Apps/PdfApp/PdfApp';
import StorybookApp from '@presentation/Components/Apps/StorybookApp/StorybookApp';
import ImageViewerApp from '@presentation/Components/Apps/ImageViewerApp/ImageViewerApp';
import NotesApp from '@presentation/Components/Apps/NotesApp/NotesApp';
import CreateItemApp from '@presentation/Components/Shared/CreateItemApp/CreateItemApp';
import AppEmptyState from '@presentation/Components/Shared/AppEmptyState/AppEmptyState';

describe('AppRegistry', () => {
  describe('getAppComponent', () => {
    it('should return CalendarApp for "calendar"', () => {
      expect(getAppComponent('calendar')).toBe(CalendarApp);
    });

    it('should return FilesApp for "files"', () => {
      expect(getAppComponent('files')).toBe(FilesApp);
    });

    it('should return PdfApp for "pdf"', () => {
      expect(getAppComponent('pdf')).toBe(PdfApp);
    });

    it('should return StorybookApp for "storybook"', () => {
      expect(getAppComponent('storybook')).toBe(StorybookApp);
    });

    it('should return ImageViewerApp for "image-viewer"', () => {
      expect(getAppComponent('image-viewer')).toBe(ImageViewerApp);
    });

    it('should return NotesApp for "notepad"', () => {
      expect(getAppComponent('notepad')).toBe(NotesApp);
    });

    it('should return CreateItemApp for "createItem"', () => {
      expect(getAppComponent('createItem')).toBe(CreateItemApp);
    });

    it('should return AppEmptyState for unknown content types', () => {
      expect(getAppComponent('unknown-app')).toBe(AppEmptyState);
    });

    it('should return a component for "terminal"', () => {
      // terminal renders AppEmptyState inline — just ensure it returns a function
      expect(typeof getAppComponent('terminal')).toBe('function');
    });
  });

  describe('getMenuBarBuilder', () => {
    it('should return a function for "pdf"', () => {
      expect(typeof getMenuBarBuilder('pdf')).toBe('function');
    });

    it('should return a function for "image-viewer"', () => {
      expect(typeof getMenuBarBuilder('image-viewer')).toBe('function');
    });

    it('should return a function for "notepad"', () => {
      expect(typeof getMenuBarBuilder('notepad')).toBe('function');
    });

    it('should return undefined for "calendar" (no menu bar)', () => {
      expect(getMenuBarBuilder('calendar')).toBeUndefined();
    });

    it('should return undefined for "files" (no menu bar)', () => {
      expect(getMenuBarBuilder('files')).toBeUndefined();
    });

    it('should return undefined for unknown content types', () => {
      expect(getMenuBarBuilder('unknown-app')).toBeUndefined();
    });
  });
});
