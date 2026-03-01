// @vitest-environment jsdom
import '@/Shared/Testing/__mocks__/jsdom-setup';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { renderWithMantine as wrapper } from '@/Shared/Testing/Utils/renderWithMantine';
import type { FileNode } from '@/Shared/Interfaces/FileNode';
import type { FolderNode } from '@/Shared/Interfaces/FolderNode';
import { buildPdfViewerMenuBar } from './buildPdfViewerMenuBar';
import { createMockWindowEntity } from '@/Shared/Testing/Utils/makeWindowEntity';

vi.mock('react-icons/vsc', () => ({
  VscFolder: () => <svg data-testid="icon-folder" />,
  VscFolderOpened: () => <svg />,
  VscFilePdf: () => <svg />,
  VscFile: () => <svg />,
  VscMarkdown: () => <svg />,
  VscFileMedia: () => <svg data-testid="icon-media" />,
  VscFileCode: () => <svg />,
  VscJson: () => <svg />,
}));

const folderDesktop: FolderNode = {
  id: 'folder-desktop',
  name: 'Desktop',
  type: 'folder',
  parentId: null,
  children: ['file-report'],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const filePdf: FileNode = {
  id: 'file-report',
  name: 'report.pdf',
  type: 'file',
  parentId: 'folder-desktop',
  content: '',
  mimeType: 'application/pdf',
  url: 'Desktop/report.pdf',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockStore = {
  fsNodes: [folderDesktop, filePdf],
};

vi.mock('@presentation/Store/desktopStore', () => ({
  useDesktopStore: (selector: (s: typeof mockStore) => unknown) => selector(mockStore),
}));

const { default: PdfApp } = await import('./PdfApp');

// Helper: render PdfApp con una ventana mock
// notifyReady merges the payload back into win.contentData so tests can read it
const renderPdfApp = (contentData: Record<string, unknown> = {}) => {
  const win = createMockWindowEntity({ contentData });
  const notifyReady = vi.fn((payload?: Record<string, unknown>) => {
    if (payload) win.contentData = { ...(win.contentData ?? {}), ...payload };
  });
  render(<PdfApp window={win} notifyReady={notifyReady} />, { wrapper });
  return { win, notifyReady };
};

describe('PdfApp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Display', () => {
    it('should render an iframe', () => {
      // Act
      renderPdfApp();

      // Assert
      expect(screen.getByTitle('PDF viewer')).toBeInTheDocument();
    });

    it('should have the default PDF src when no contentData src provided', () => {
      // Act
      renderPdfApp();

      // Assert
      expect(screen.getByTitle('PDF viewer')).toHaveAttribute('src', 'Desktop/CV_2026_English.pdf');
    });

    it('should use the src from contentData', () => {
      // Act
      renderPdfApp({ src: 'Documents/report.pdf' });

      // Assert
      expect(screen.getByTitle('PDF viewer')).toHaveAttribute('src', 'Documents/report.pdf');
    });

    it('should have an accessible label', () => {
      // Act
      renderPdfApp();

      // Assert
      expect(screen.getByLabelText('PDF viewer')).toBeInTheDocument();
    });
  });

  describe('File picker modal', () => {
    it('should not show the picker modal on initial render', () => {
      // Act
      renderPdfApp();

      // Assert
      expect(screen.queryByRole('dialog', { name: 'Open file' })).not.toBeInTheDocument();
    });

    it('should show the picker modal after calling setPickerOpen', () => {
      // Arrange
      const { win } = renderPdfApp();

      // Act — open picker via the contentData callback the app registers
      act(() => (win.contentData?.setPickerOpen as (() => void) | undefined)?.());

      // Assert
      expect(screen.getByRole('dialog', { name: 'Open file' })).toBeInTheDocument();
    });

    it('should show the FilePicker inside the modal when open', () => {
      // Arrange
      const { win } = renderPdfApp();

      // Act
      act(() => (win.contentData?.setPickerOpen as (() => void) | undefined)?.());

      // Assert — FilePicker renders its file grid
      expect(screen.getByRole('listbox', { name: 'Files' })).toBeInTheDocument();
    });

    it('should close the picker when Cancel is clicked', () => {
      // Arrange
      const { win } = renderPdfApp();
      act(() => (win.contentData?.setPickerOpen as (() => void) | undefined)?.());
      expect(screen.getByRole('dialog', { name: 'Open file' })).toBeInTheDocument();

      // Act
      fireEvent.click(screen.getByLabelText('Cancel'));

      // Assert
      expect(screen.queryByRole('dialog', { name: 'Open file' })).not.toBeInTheDocument();
    });

    it('should update the displayed PDF and close picker after a file is selected', () => {
      // Arrange
      const { win } = renderPdfApp();
      act(() => (win.contentData?.setPickerOpen as (() => void) | undefined)?.());

      // Navigate into Desktop and select report.pdf
      fireEvent.doubleClick(screen.getByLabelText('Open folder Desktop'));
      fireEvent.click(screen.getByLabelText('Select file report.pdf'));

      // Act
      fireEvent.click(screen.getByLabelText('Open selected file'));

      // Assert
      expect(screen.queryByRole('dialog', { name: 'Open file' })).not.toBeInTheDocument();
      expect(screen.getByTitle('PDF viewer')).toHaveAttribute('src', 'Desktop/report.pdf');
    });
  });

  describe('buildPdfViewerMenuBar', () => {
    it('should export a menu with File label', () => {
      const menuBar = buildPdfViewerMenuBar(vi.fn(), vi.fn());

      expect(menuBar).toHaveLength(1);
      expect(menuBar[0]).toMatchObject({ type: 'menu', label: 'File' });
    });

    it('should include Open and Exit items', () => {
      const onOpen = vi.fn();
      const onExit = vi.fn();
      const menuBar = buildPdfViewerMenuBar(onOpen, onExit);
      const items = (
        menuBar[0] as { items: Array<{ type: string; label?: string; onClick?: () => void }> }
      ).items;

      const openItem = items.find(i => i.type === 'item' && i.label === 'Open');
      const exitItem = items.find(i => i.type === 'item' && i.label === 'Exit');

      expect(openItem).toBeDefined();
      expect(exitItem).toBeDefined();

      openItem!.onClick!();
      expect(onOpen).toHaveBeenCalledOnce();

      exitItem!.onClick!();
      expect(onExit).toHaveBeenCalledOnce();
    });
  });
});
