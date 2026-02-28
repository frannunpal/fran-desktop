// @vitest-environment jsdom
import '@/Shared/Testing/__mocks__/jsdom-setup';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { renderWithMantine as wrapper } from '@/Shared/Testing/Utils/renderWithMantine';
import type { FileNode } from '@/Shared/Interfaces/FileNode';
import type { FolderNode } from '@/Shared/Interfaces/FolderNode';
import { buildPdfViewerMenuBar } from './buildPdfViewerMenuBar';

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

describe('PdfApp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Display', () => {
    it('should render an iframe', () => {
      // Act
      render(<PdfApp />, { wrapper });

      // Assert
      expect(screen.getByTitle('PDF viewer')).toBeInTheDocument();
    });

    it('should have the default PDF src when no prop provided', () => {
      // Act
      render(<PdfApp />, { wrapper });

      // Assert
      expect(screen.getByTitle('PDF viewer')).toHaveAttribute('src', 'Desktop/CV_2026_English.pdf');
    });

    it('should use the provided src prop', () => {
      // Act
      render(<PdfApp src="Documents/report.pdf" />, { wrapper });

      // Assert
      expect(screen.getByTitle('PDF viewer')).toHaveAttribute('src', 'Documents/report.pdf');
    });

    it('should have an accessible label', () => {
      // Act
      render(<PdfApp />, { wrapper });

      // Assert
      expect(screen.getByLabelText('PDF viewer')).toBeInTheDocument();
    });
  });

  describe('File picker modal', () => {
    it('should not show the picker modal when pickerOpen is false', () => {
      // Act
      render(<PdfApp pickerOpen={false} />, { wrapper });

      // Assert
      expect(screen.queryByRole('dialog', { name: 'Open file' })).not.toBeInTheDocument();
    });

    it('should show the picker modal when pickerOpen is true', () => {
      // Act
      render(<PdfApp pickerOpen={true} onPickerClose={vi.fn()} />, { wrapper });

      // Assert
      expect(screen.getByRole('dialog', { name: 'Open file' })).toBeInTheDocument();
    });

    it('should show the FilePicker inside the modal when open', () => {
      // Act
      render(<PdfApp pickerOpen={true} onPickerClose={vi.fn()} />, { wrapper });

      // Assert
      expect(screen.getByRole('listbox', { name: 'Files' })).toBeInTheDocument();
    });

    it('should call onPickerClose when Cancel is clicked inside the picker', () => {
      // Arrange
      const onPickerClose = vi.fn();
      render(<PdfApp pickerOpen={true} onPickerClose={onPickerClose} />, { wrapper });

      // Act
      fireEvent.click(screen.getByLabelText('Cancel'));

      // Assert
      expect(onPickerClose).toHaveBeenCalledOnce();
    });

    it('should update the displayed PDF and call onPickerClose after a file is selected', () => {
      // Arrange
      const onPickerClose = vi.fn();
      const { rerender } = render(<PdfApp pickerOpen={true} onPickerClose={onPickerClose} />, {
        wrapper,
      });

      // Navigate into Desktop and select report.pdf
      fireEvent.doubleClick(screen.getByLabelText('Open folder Desktop'));
      rerender(<PdfApp pickerOpen={true} onPickerClose={onPickerClose} />);
      fireEvent.click(screen.getByLabelText('Select file report.pdf'));

      // Act
      fireEvent.click(screen.getByLabelText('Open selected file'));

      // Assert
      expect(onPickerClose).toHaveBeenCalledOnce();
      // After closing the picker the new src should be rendered
      rerender(
        <PdfApp src="Desktop/report.pdf" pickerOpen={false} onPickerClose={onPickerClose} />,
      );
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
