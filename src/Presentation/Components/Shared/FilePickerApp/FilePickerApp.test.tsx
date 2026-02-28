// @vitest-environment jsdom
import '@/Shared/Testing/__mocks__/jsdom-setup';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { renderWithMantine as wrapper } from '@/Shared/Testing/Utils/renderWithMantine';
import type { FileNode } from '@/Shared/Interfaces/FileNode';
import type { FolderNode } from '@/Shared/Interfaces/FolderNode';

vi.mock('react-icons/vsc', () => ({
  VscFolder: () => <svg data-testid="icon-folder" />,
  VscFolderOpened: () => <svg />,
  VscFilePdf: () => <svg data-testid="icon-pdf" />,
  VscFile: () => <svg data-testid="icon-file" />,
  VscMarkdown: () => <svg />,
  VscFileMedia: () => <svg data-testid="icon-media" />,
  VscFileCode: () => <svg />,
  VscJson: () => <svg />,
}));

/* ── Fixtures ─────────────────────────────────────────────────── */

const folderDesktop: FolderNode = {
  id: 'folder-desktop',
  name: 'Desktop',
  type: 'folder',
  parentId: null,
  children: ['file-photo', 'file-cv'],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const folderDocuments: FolderNode = {
  id: 'folder-documents',
  name: 'Documents',
  type: 'folder',
  parentId: null,
  children: [],
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

const fileCv: FileNode = {
  id: 'file-cv',
  name: 'CV.pdf',
  type: 'file',
  parentId: 'folder-desktop',
  content: '',
  mimeType: 'application/pdf',
  url: 'Desktop/CV.pdf',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockFsNodes = [folderDesktop, folderDocuments, filePhoto, fileCv];

/* ── Store mock ────────────────────────────────────────────────── */

const mockStore = {
  fsNodes: mockFsNodes,
};

vi.mock('@presentation/Store/desktopStore', () => ({
  useDesktopStore: (selector: (s: typeof mockStore) => unknown) => selector(mockStore),
}));

const { default: FilePickerApp } = await import('./FilePickerApp');

/* ── Tests ─────────────────────────────────────────────────────── */

describe('FilePickerApp', () => {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();

  beforeEach(() => {
    mockStore.fsNodes = mockFsNodes;
    vi.clearAllMocks();
  });

  describe('Initial render', () => {
    it('should render the breadcrumb with Home', () => {
      // Act
      render(<FilePickerApp onConfirm={onConfirm} onCancel={onCancel} />, { wrapper });

      // Assert
      expect(screen.getAllByText('Home').length).toBeGreaterThan(0);
    });

    it('should render root folders in the sidebar', () => {
      // Act
      render(<FilePickerApp onConfirm={onConfirm} onCancel={onCancel} />, { wrapper });

      // Assert
      expect(screen.getByLabelText('Desktop')).toBeInTheDocument();
      expect(screen.getByLabelText('Documents')).toBeInTheDocument();
    });

    it('should render root folders in the file grid', () => {
      // Act
      render(<FilePickerApp onConfirm={onConfirm} onCancel={onCancel} />, { wrapper });

      // Assert
      expect(screen.getByLabelText('Open folder Desktop')).toBeInTheDocument();
      expect(screen.getByLabelText('Open folder Documents')).toBeInTheDocument();
    });

    it('should render Open button as disabled when no file is selected', () => {
      // Act
      render(<FilePickerApp onConfirm={onConfirm} onCancel={onCancel} />, { wrapper });

      // Assert
      expect(screen.getByLabelText('Open selected file')).toBeDisabled();
    });

    it('should render Cancel button', () => {
      // Act
      render(<FilePickerApp onConfirm={onConfirm} onCancel={onCancel} />, { wrapper });

      // Assert
      expect(screen.getByLabelText('Cancel')).toBeInTheDocument();
    });

    it('should show "No file selected" label initially', () => {
      // Act
      render(<FilePickerApp onConfirm={onConfirm} onCancel={onCancel} />, { wrapper });

      // Assert
      expect(screen.getByText('No file selected')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should navigate into a folder on double-click', () => {
      // Arrange
      const { rerender } = render(<FilePickerApp onConfirm={onConfirm} onCancel={onCancel} />, {
        wrapper,
      });

      // Act
      fireEvent.doubleClick(screen.getByLabelText('Open folder Desktop'));
      rerender(<FilePickerApp onConfirm={onConfirm} onCancel={onCancel} />);

      // Assert — Desktop folder contents appear
      expect(screen.getByLabelText('Select file photo.jpg')).toBeInTheDocument();
    });

    it('should update breadcrumb when navigating into a folder', () => {
      // Arrange
      const { rerender } = render(<FilePickerApp onConfirm={onConfirm} onCancel={onCancel} />, {
        wrapper,
      });

      // Act
      fireEvent.doubleClick(screen.getByLabelText('Open folder Desktop'));
      rerender(<FilePickerApp onConfirm={onConfirm} onCancel={onCancel} />);

      // Assert
      expect(screen.getAllByText('Desktop').length).toBeGreaterThan(0);
    });

    it('should navigate back to Home via breadcrumb', () => {
      // Arrange
      const { rerender } = render(<FilePickerApp onConfirm={onConfirm} onCancel={onCancel} />, {
        wrapper,
      });
      fireEvent.doubleClick(screen.getByLabelText('Open folder Desktop'));
      rerender(<FilePickerApp onConfirm={onConfirm} onCancel={onCancel} />);

      // Act — click "Home" breadcrumb anchor (the <a> tag, not the sidebar button)
      const homeAnchor = screen.getAllByText('Home').find(el => el.tagName === 'A')!;
      fireEvent.click(homeAnchor);
      rerender(<FilePickerApp onConfirm={onConfirm} onCancel={onCancel} />);

      // Assert — back to root
      expect(screen.getByLabelText('Open folder Desktop')).toBeInTheDocument();
    });

    it('should navigate via sidebar click', () => {
      // Arrange
      const { rerender } = render(<FilePickerApp onConfirm={onConfirm} onCancel={onCancel} />, {
        wrapper,
      });

      // Act — click Desktop in sidebar
      fireEvent.click(screen.getByLabelText('Desktop'));
      rerender(<FilePickerApp onConfirm={onConfirm} onCancel={onCancel} />);

      // Assert
      expect(screen.getByLabelText('Select file photo.jpg')).toBeInTheDocument();
    });

    it('should clear selection when navigating into a different folder', () => {
      // Arrange
      const { rerender } = render(<FilePickerApp onConfirm={onConfirm} onCancel={onCancel} />, {
        wrapper,
      });
      fireEvent.click(screen.getByLabelText('Desktop'));
      rerender(<FilePickerApp onConfirm={onConfirm} onCancel={onCancel} />);
      fireEvent.click(screen.getByLabelText('Select file photo.jpg'));
      rerender(<FilePickerApp onConfirm={onConfirm} onCancel={onCancel} />);
      // Verify selection is shown in the action bar
      expect(screen.getByLabelText('Open selected file')).not.toBeDisabled();

      // Act — navigate away via sidebar Home
      fireEvent.click(screen.getByLabelText('Home'));
      rerender(<FilePickerApp onConfirm={onConfirm} onCancel={onCancel} />);

      // Assert — selection reset
      expect(screen.getByText('No file selected')).toBeInTheDocument();
    });
  });

  describe('File selection', () => {
    it('should select a file on single click', () => {
      // Arrange
      const { rerender } = render(<FilePickerApp onConfirm={onConfirm} onCancel={onCancel} />, {
        wrapper,
      });
      fireEvent.doubleClick(screen.getByLabelText('Open folder Desktop'));
      rerender(<FilePickerApp onConfirm={onConfirm} onCancel={onCancel} />);

      // Act
      fireEvent.click(screen.getByLabelText('Select file photo.jpg'));

      // Assert — action bar shows filename and Open button is enabled
      expect(screen.getByLabelText('Open selected file')).not.toBeDisabled();
    });

    it('should mark selected item with aria-selected=true', () => {
      // Arrange
      const { rerender } = render(<FilePickerApp onConfirm={onConfirm} onCancel={onCancel} />, {
        wrapper,
      });
      fireEvent.doubleClick(screen.getByLabelText('Open folder Desktop'));
      rerender(<FilePickerApp onConfirm={onConfirm} onCancel={onCancel} />);

      // Act
      fireEvent.click(screen.getByLabelText('Select file photo.jpg'));

      // Assert
      expect(screen.getByLabelText('Select file photo.jpg')).toHaveAttribute(
        'aria-selected',
        'true',
      );
    });

    it('should not mark folder items with aria-selected', () => {
      // Act
      render(<FilePickerApp onConfirm={onConfirm} onCancel={onCancel} />, { wrapper });

      // Assert — folders don't have aria-selected
      expect(screen.getByLabelText('Open folder Desktop')).not.toHaveAttribute('aria-selected');
    });
  });

  describe('Confirm action', () => {
    it('should call onConfirm with the selected node on Open click', () => {
      // Arrange
      const { rerender } = render(<FilePickerApp onConfirm={onConfirm} onCancel={onCancel} />, {
        wrapper,
      });
      fireEvent.doubleClick(screen.getByLabelText('Open folder Desktop'));
      rerender(<FilePickerApp onConfirm={onConfirm} onCancel={onCancel} />);
      fireEvent.click(screen.getByLabelText('Select file photo.jpg'));

      // Act
      fireEvent.click(screen.getByLabelText('Open selected file'));

      // Assert
      expect(onConfirm).toHaveBeenCalledOnce();
      expect(onConfirm).toHaveBeenCalledWith(expect.objectContaining({ id: 'file-photo' }));
    });

    it('should call onConfirm immediately on double-click of a file', () => {
      // Arrange
      const { rerender } = render(<FilePickerApp onConfirm={onConfirm} onCancel={onCancel} />, {
        wrapper,
      });
      fireEvent.doubleClick(screen.getByLabelText('Open folder Desktop'));
      rerender(<FilePickerApp onConfirm={onConfirm} onCancel={onCancel} />);

      // Act
      fireEvent.doubleClick(screen.getByLabelText('Select file photo.jpg'));

      // Assert
      expect(onConfirm).toHaveBeenCalledOnce();
      expect(onConfirm).toHaveBeenCalledWith(expect.objectContaining({ id: 'file-photo' }));
    });
  });

  describe('Cancel action', () => {
    it('should call onCancel when Cancel button is clicked', () => {
      // Act
      render(<FilePickerApp onConfirm={onConfirm} onCancel={onCancel} />, { wrapper });
      fireEvent.click(screen.getByLabelText('Cancel'));

      // Assert
      expect(onCancel).toHaveBeenCalledOnce();
    });
  });

  describe('MIME type filtering', () => {
    it('should show all files when no acceptedMimeTypes is provided', () => {
      // Arrange
      const { rerender } = render(<FilePickerApp onConfirm={onConfirm} onCancel={onCancel} />, {
        wrapper,
      });
      fireEvent.doubleClick(screen.getByLabelText('Open folder Desktop'));
      rerender(<FilePickerApp onConfirm={onConfirm} onCancel={onCancel} />);

      // Assert
      expect(screen.getByLabelText('Select file photo.jpg')).toBeInTheDocument();
      expect(screen.getByLabelText('Select file CV.pdf')).toBeInTheDocument();
    });

    it('should show only image files when acceptedMimeTypes=["image/*"]', () => {
      // Arrange
      const { rerender } = render(
        <FilePickerApp acceptedMimeTypes={['image/*']} onConfirm={onConfirm} onCancel={onCancel} />,
        { wrapper },
      );
      fireEvent.doubleClick(screen.getByLabelText('Open folder Desktop'));
      rerender(
        <FilePickerApp acceptedMimeTypes={['image/*']} onConfirm={onConfirm} onCancel={onCancel} />,
      );

      // Assert — only image file visible
      expect(screen.getByLabelText('Select file photo.jpg')).toBeInTheDocument();
      expect(screen.queryByLabelText('Select file CV.pdf')).not.toBeInTheDocument();
    });

    it('should show only pdf files when acceptedMimeTypes=["application/pdf"]', () => {
      // Arrange
      const { rerender } = render(
        <FilePickerApp
          acceptedMimeTypes={['application/pdf']}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />,
        { wrapper },
      );
      fireEvent.doubleClick(screen.getByLabelText('Open folder Desktop'));
      rerender(
        <FilePickerApp
          acceptedMimeTypes={['application/pdf']}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />,
      );

      // Assert
      expect(screen.getByLabelText('Select file CV.pdf')).toBeInTheDocument();
      expect(screen.queryByLabelText('Select file photo.jpg')).not.toBeInTheDocument();
    });

    it('should always show folders regardless of acceptedMimeTypes', () => {
      // Act
      render(
        <FilePickerApp
          acceptedMimeTypes={['application/pdf']}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />,
        { wrapper },
      );

      // Assert — root folders always visible
      expect(screen.getByLabelText('Open folder Desktop')).toBeInTheDocument();
      expect(screen.getByLabelText('Open folder Documents')).toBeInTheDocument();
    });

    it('should show "No matching files" when no files match the filter', () => {
      // Arrange
      mockStore.fsNodes = [folderDesktop, { ...filePhoto, parentId: 'folder-desktop' }];
      const { rerender } = render(
        <FilePickerApp
          acceptedMimeTypes={['application/pdf']}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />,
        { wrapper },
      );
      fireEvent.doubleClick(screen.getByLabelText('Open folder Desktop'));
      rerender(
        <FilePickerApp
          acceptedMimeTypes={['application/pdf']}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />,
      );

      // Assert
      expect(screen.getByText('No matching files')).toBeInTheDocument();
    });

    it('should show "This folder is empty" when folder has no children', () => {
      // Arrange
      const { rerender } = render(<FilePickerApp onConfirm={onConfirm} onCancel={onCancel} />, {
        wrapper,
      });
      fireEvent.doubleClick(screen.getByLabelText('Open folder Documents'));
      rerender(<FilePickerApp onConfirm={onConfirm} onCancel={onCancel} />);

      // Assert
      expect(screen.getByText('This folder is empty')).toBeInTheDocument();
    });

    it('should accept exact mime type match', () => {
      // Arrange
      const { rerender } = render(
        <FilePickerApp
          acceptedMimeTypes={['image/jpeg']}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />,
        { wrapper },
      );
      fireEvent.doubleClick(screen.getByLabelText('Open folder Desktop'));
      rerender(
        <FilePickerApp
          acceptedMimeTypes={['image/jpeg']}
          onConfirm={onConfirm}
          onCancel={onCancel}
        />,
      );

      // Assert — only jpeg visible
      expect(screen.getByLabelText('Select file photo.jpg')).toBeInTheDocument();
      expect(screen.queryByLabelText('Select file CV.pdf')).not.toBeInTheDocument();
    });
  });
});
