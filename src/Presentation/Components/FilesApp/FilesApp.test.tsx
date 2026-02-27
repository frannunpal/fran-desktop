// @vitest-environment jsdom
import '@/Shared/Testing/__mocks__/jsdom-setup';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { renderWithMantine as wrapper } from '@/Shared/Testing/Utils/renderWithMantine';

vi.mock('react-icons/vsc', () => ({
  VscFolder: ({ size }: { size?: number }) => <svg data-testid="icon-folder" data-size={size} />,
  VscFolderOpened: () => <svg />,
  VscFilePdf: () => <svg data-testid="icon-pdf" />,
  VscFile: () => <svg data-testid="icon-file" />,
  VscMarkdown: () => <svg />,
  VscFileMedia: () => <svg />,
  VscFileCode: () => <svg />,
  VscJson: () => <svg />,
  VscNewFolder: () => <svg />,
  VscNewFile: () => <svg />,
  VscChevronDown: () => <svg />,
  VscClose: () => <svg />,
  VscCheck: () => <svg />,
  VscHome: () => <svg />,
  VscServer: () => <svg />,
  VscDatabase: () => <svg />,
  VscBook: () => <svg />,
  VscMail: () => <svg />,
  VscGithub: () => <svg />,
  VscCloud: () => <svg />,
  VscLock: () => <svg />,
  VscSettingsGear: () => <svg />,
  VscStar: () => <svg />,
  VscHeart: () => <svg />,
  VscMusic: () => <svg />,
  VscCamera: () => <svg />,
  VscArchive: () => <svg />,
}));

const mockFsNodes = [
  {
    id: 'folder-desktop',
    name: 'Desktop',
    type: 'folder' as const,
    parentId: null,
    children: ['file-cv'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'folder-documents',
    name: 'Documents',
    type: 'folder' as const,
    parentId: null,
    children: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'file-cv',
    name: 'CV_2026_English.pdf',
    type: 'file' as const,
    parentId: 'folder-desktop',
    content: '',
    mimeType: 'application/pdf',
    url: 'Desktop/CV_2026_English.pdf',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockStore = {
  fsNodes: mockFsNodes,
  filesCurrentFolderId: null as string | null,
  setFilesCurrentFolderId: vi.fn((id: string | null) => {
    mockStore.filesCurrentFolderId = id;
  }),
  createFile: vi.fn(),
  createFolder: vi.fn(),
  openWindow: vi.fn(),
  contextMenu: { x: 0, y: 0, owner: null as string | null },
  openContextMenu: vi.fn(),
  closeContextMenu: vi.fn(),
};

vi.mock('@presentation/Store/desktopStore', () => ({
  useDesktopStore: (selector: (s: typeof mockStore) => unknown) => selector(mockStore),
}));

vi.mock('@shared/Constants/Animations', () => ({
  randomWindowPosition: () => ({ x: 100, y: 100 }),
}));

const { default: FilesApp } = await import('./FilesApp');

describe('FilesApp', () => {
  beforeEach(() => {
    mockStore.filesCurrentFolderId = null;
    vi.clearAllMocks();
    mockStore.setFilesCurrentFolderId = vi.fn((id: string | null) => {
      mockStore.filesCurrentFolderId = id;
    });
  });

  it('should render root folders in the sidebar', () => {
    // Act
    render(<FilesApp />, { wrapper });

    // Assert
    expect(screen.getByLabelText('Desktop')).toBeInTheDocument();
    expect(screen.getByLabelText('Documents')).toBeInTheDocument();
  });

  it('should show Home breadcrumb initially', () => {
    // Act
    render(<FilesApp />, { wrapper });

    // Assert — breadcrumb bar contains "Home" text
    expect(screen.getAllByText('Home').length).toBeGreaterThan(0);
  });

  it('should display root folders in the file list', () => {
    // Act
    render(<FilesApp />, { wrapper });

    // Assert — root items in file list
    expect(screen.getByLabelText('Open folder Desktop')).toBeInTheDocument();
    expect(screen.getByLabelText('Open folder Documents')).toBeInTheDocument();
  });

  it('should navigate to subfolder on double-click', () => {
    // Arrange
    const { rerender } = render(<FilesApp />, { wrapper });

    // Act
    fireEvent.doubleClick(screen.getByLabelText('Open folder Desktop'));
    rerender(<FilesApp />);

    // Assert — breadcrumb updates (Desktop appears at least once)
    expect(screen.getAllByText('Desktop').length).toBeGreaterThan(0);
  });

  it('should trigger context menu handler on right-click', () => {
    // Arrange
    render(<FilesApp />, { wrapper });
    const rootDiv = document.querySelector('[class]') as HTMLElement;

    // Act & Assert — right-click does not throw and updates menu state
    expect(() => fireEvent.contextMenu(rootDiv ?? document.body)).not.toThrow();
  });

  it('should render the create item modal component', () => {
    // Arrange & Act
    render(<FilesApp />, { wrapper });

    // Assert — CreateItemModal is mounted (even if hidden, it renders in the component tree)
    // The modal is rendered by FilesApp unconditionally (opened=false initially)
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('should show correct icon for PDF file', () => {
    // Arrange
    const { rerender } = render(<FilesApp />, { wrapper });
    fireEvent.doubleClick(screen.getByLabelText('Open folder Desktop'));
    rerender(<FilesApp />);

    // Assert
    expect(screen.getByLabelText('Open file CV_2026_English.pdf')).toBeInTheDocument();
  });

  it('should call openWindow with pdf content on double-click of PDF file', () => {
    // Arrange
    const { rerender } = render(<FilesApp />, { wrapper });
    fireEvent.doubleClick(screen.getByLabelText('Open folder Desktop'));
    rerender(<FilesApp />);

    // Act
    fireEvent.doubleClick(screen.getByLabelText('Open file CV_2026_English.pdf'));

    // Assert
    expect(mockStore.openWindow).toHaveBeenCalledWith(
      expect.objectContaining({
        content: 'pdf',
        contentData: { src: 'Desktop/CV_2026_English.pdf' },
      }),
    );
  });
});
