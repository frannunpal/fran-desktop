// @vitest-environment jsdom
import '@/Shared/Testing/__mocks__/jsdom-setup';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { renderWithMantine as wrapper } from '@/Shared/Testing/Utils/renderWithMantine';
import type { FileNode } from '@/Shared/Interfaces/FileNode';
import type { FolderNode } from '@/Shared/Interfaces/FolderNode';
import { buildImageViewerMenuBar } from './buildImageViewerMenuBar';
import { createMockWindowEntity } from '@/Shared/Testing/Utils/makeWindowEntity';

vi.mock('framer-motion', async () => await import('@/Shared/Testing/__mocks__/framer-motion.mock'));

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
  children: ['file-photo'],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const filePhoto: FileNode = {
  id: 'file-photo',
  name: 'photo.jpg',
  type: 'file',
  parentId: 'folder-desktop',
  content: '',
  mimeType: 'image/jpeg',
  url: 'Desktop/photo.jpg',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockStore = {
  fsNodes: [folderDesktop, filePhoto],
};

vi.mock('@presentation/Store/desktopStore', () => ({
  useDesktopStore: (selector: (s: typeof mockStore) => unknown) => selector(mockStore),
}));

const { default: ImageViewerApp } = await import('./ImageViewerApp');

// Helper: render ImageViewerApp con una ventana mock
// notifyReady merges the payload back into win.contentData so tests can read it
const renderImageViewer = (contentData: Record<string, unknown> = {}) => {
  const win = createMockWindowEntity({ contentData });
  const notifyReady = vi.fn((payload?: Record<string, unknown>) => {
    if (payload) win.contentData = { ...(win.contentData ?? {}), ...payload };
  });
  render(<ImageViewerApp window={win} notifyReady={notifyReady} />, { wrapper });
  return { win, notifyReady };
};

describe('ImageViewerApp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Display', () => {
    it('should render a placeholder when no src is provided', () => {
      // Act
      renderImageViewer();

      // Assert
      expect(screen.getByText('No image to display. Please open one.')).toBeInTheDocument();
    });

    it('should render an img element when src is provided in contentData', () => {
      // Act
      renderImageViewer({ src: 'Desktop/photo.jpg' });

      // Assert
      expect(screen.getByRole('img')).toBeInTheDocument();
    });

    it('should set the src attribute on the img', () => {
      // Arrange
      const src = 'Desktop/photo.png';

      // Act
      renderImageViewer({ src });

      // Assert
      expect(screen.getByRole('img')).toHaveAttribute('src', src);
    });

    it('should derive the alt text from the filename', () => {
      // Arrange
      const src = 'Desktop/my-photo.jpg';

      // Act
      renderImageViewer({ src });

      // Assert
      expect(screen.getByRole('img')).toHaveAttribute('alt', 'my-photo.jpg');
    });
  });

  describe('File picker modal', () => {
    it('should not show the picker modal on initial render', () => {
      // Act
      renderImageViewer({ src: 'Desktop/photo.jpg' });

      // Assert
      expect(screen.queryByRole('dialog', { name: 'Open file' })).not.toBeInTheDocument();
    });

    it('should show the picker modal after calling setPickerOpen', () => {
      // Arrange
      const { win } = renderImageViewer({ src: 'Desktop/photo.jpg' });

      // Act — open picker via the contentData callback the app registers
      act(() => (win.contentData?.setPickerOpen as (() => void) | undefined)?.());

      // Assert
      expect(screen.getByRole('dialog', { name: 'Open file' })).toBeInTheDocument();
    });

    it('should show the FilePicker inside the modal when open', () => {
      // Arrange
      const { win } = renderImageViewer();

      // Act
      act(() => (win.contentData?.setPickerOpen as (() => void) | undefined)?.());

      // Assert — FilePicker renders its file grid
      expect(screen.getByRole('listbox', { name: 'Files' })).toBeInTheDocument();
    });

    it('should close the picker when Cancel is clicked', () => {
      // Arrange
      const { win } = renderImageViewer({ src: 'Desktop/photo.jpg' });
      act(() => (win.contentData?.setPickerOpen as (() => void) | undefined)?.());
      expect(screen.getByRole('dialog', { name: 'Open file' })).toBeInTheDocument();

      // Act
      fireEvent.click(screen.getByLabelText('Cancel'));

      // Assert
      expect(screen.queryByRole('dialog', { name: 'Open file' })).not.toBeInTheDocument();
    });

    it('should update the displayed image and close picker after a file is selected', () => {
      // Arrange
      const { win } = renderImageViewer();
      act(() => (win.contentData?.setPickerOpen as (() => void) | undefined)?.());

      // Navigate into Desktop and select photo.jpg
      fireEvent.doubleClick(screen.getByLabelText('Open folder Desktop'));
      fireEvent.click(screen.getByLabelText('Select file photo.jpg'));

      // Act
      fireEvent.click(screen.getByLabelText('Open selected file'));

      // Assert
      expect(screen.queryByRole('dialog', { name: 'Open file' })).not.toBeInTheDocument();
      expect(screen.getByRole('img')).toHaveAttribute('src', 'Desktop/photo.jpg');
    });
  });

  describe('buildImageViewerMenuBar', () => {
    it('should export a menu with File label', () => {
      const menuBar = buildImageViewerMenuBar(vi.fn(), vi.fn());

      expect(menuBar).toHaveLength(1);
      expect(menuBar[0]).toMatchObject({ type: 'menu', label: 'File' });
    });

    it('should include Open and Exit items', () => {
      const onOpen = vi.fn();
      const onExit = vi.fn();
      const menuBar = buildImageViewerMenuBar(onOpen, onExit);
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
