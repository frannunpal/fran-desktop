// @vitest-environment jsdom
import '@/Shared/Testing/__mocks__/jsdom-setup';
import type { ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { renderWithMantine as wrapper } from '@/Shared/Testing/Utils/renderWithMantine';

vi.mock('react-icons/vsc', () => ({
  VscNewFolder: () => <svg />,
  VscNewFile: () => <svg />,
  VscFiles: () => <svg />,
  VscClippy: () => <svg />,
  VscTrash: () => <svg data-testid="icon-trash" />,
  VscChevronDown: () => <svg />,
  VscClose: () => <svg />,
  VscCheck: () => <svg />,
  VscFolder: () => <svg />,
  VscCopy: () => <svg />,
}));

vi.mock('@presentation/Components/Shared/CreateItemModal/CreateItemModal', () => ({
  default: ({ opened }: { opened: boolean }) => (opened ? <div role="dialog" /> : null),
}));

vi.mock('@mantine/core', async () => {
  const actual = await vi.importActual('@mantine/core');
  return {
    ...actual,
    Modal: ({
      opened,
      title,
      children,
    }: {
      opened: boolean;
      title?: ReactNode;
      children: ReactNode;
    }) =>
      opened ? (
        <div role="dialog" aria-labelledby={title ? 'modal-title' : undefined}>
          {title && <div id="modal-title">{title}</div>}
          {children}
        </div>
      ) : null,
  };
});

vi.mock('@presentation/Components/ContextMenu/ContextMenuAnchor', () => ({
  default: () => <div />,
}));

const mockFsNodes = [
  {
    id: 'node-1',
    name: 'notes.txt',
    type: 'file' as const,
    parentId: 'folder-desktop',
    content: '',
    mimeType: 'text/plain',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

import type { FSNode } from '@/Shared/Types/FileSystemTypes';

const mockStore: {
  contextMenu: { x: number; y: number; owner: string | null; targetNodeId?: string };
  closeContextMenu: ReturnType<typeof vi.fn>;
  createFile: ReturnType<typeof vi.fn>;
  createFolder: ReturnType<typeof vi.fn>;
  deleteNode: ReturnType<typeof vi.fn>;
  moveNode: ReturnType<typeof vi.fn>;
  copyToClipboard: ReturnType<typeof vi.fn>;
  cutToClipboard: ReturnType<typeof vi.fn>;
  clearClipboard: ReturnType<typeof vi.fn>;
  clipboard: { content: FSNode[]; action: 'copy' | 'cut' | null };
  fsNodes: FSNode[];
} = {
  contextMenu: {
    x: 100,
    y: 200,
    owner: null,
    targetNodeId: undefined,
  },
  closeContextMenu: vi.fn(),
  createFile: vi.fn(),
  createFolder: vi.fn(),
  deleteNode: vi.fn(),
  moveNode: vi.fn(),
  copyToClipboard: vi.fn(),
  cutToClipboard: vi.fn(),
  clearClipboard: vi.fn(),
  clipboard: { content: [], action: null },
  fsNodes: mockFsNodes,
};

vi.mock('@presentation/Store/desktopStore', () => ({
  useDesktopStore: (selector: (s: typeof mockStore) => unknown) => selector(mockStore),
}));

const { default: CreateItemContextMenu } = await import('./CreateItemContextMenu');

describe('CreateItemContextMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStore.contextMenu = { x: 100, y: 200, owner: null, targetNodeId: undefined };
  });

  // ── Creation menu (no targetNodeId) ────────────────────────────────────────
  describe('creation mode (no target node)', () => {
    it('should show Create folder and Create new file when opened without target', () => {
      // Arrange
      mockStore.contextMenu = { x: 0, y: 0, owner: 'desktop', targetNodeId: undefined };

      // Act
      render(
        <CreateItemContextMenu owner="desktop" parentId="folder-desktop" currentPath="/home" />,
        { wrapper },
      );

      // Assert
      expect(screen.getByText('Create folder')).toBeInTheDocument();
      expect(screen.getByText('Create new file')).toBeInTheDocument();
    });

    it('should not show node actions when opened without target', () => {
      // Arrange
      mockStore.contextMenu = { x: 0, y: 0, owner: 'desktop', targetNodeId: undefined };

      // Act
      render(
        <CreateItemContextMenu owner="desktop" parentId="folder-desktop" currentPath="/home" />,
        { wrapper },
      );

      // Assert
      expect(screen.queryByText('Cut')).not.toBeInTheDocument();
      expect(screen.queryByText('Delete')).not.toBeInTheDocument();
    });

    it('should open modal when "Create folder" is clicked', () => {
      // Arrange
      mockStore.contextMenu = { x: 0, y: 0, owner: 'desktop', targetNodeId: undefined };
      render(
        <CreateItemContextMenu owner="desktop" parentId="folder-desktop" currentPath="/home" />,
        { wrapper },
      );

      // Act
      fireEvent.click(screen.getByText('Create folder'));

      // Assert
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('should not render when owner does not match', () => {
      // Arrange
      mockStore.contextMenu = { x: 0, y: 0, owner: 'files', targetNodeId: undefined };

      // Act
      render(
        <CreateItemContextMenu owner="desktop" parentId="folder-desktop" currentPath="/home" />,
        { wrapper },
      );

      // Assert
      expect(screen.queryByText('Create folder')).not.toBeInTheDocument();
    });
  });

  // ── Node actions menu (with targetNodeId) ──────────────────────────────────
  describe('node mode (with target node)', () => {
    it('should show node name as label and Cut/Copy/Delete when target is set', () => {
      // Arrange
      mockStore.contextMenu = { x: 0, y: 0, owner: 'desktop', targetNodeId: 'node-1' };

      // Act
      render(
        <CreateItemContextMenu owner="desktop" parentId="folder-desktop" currentPath="/home" />,
        { wrapper },
      );

      // Assert
      expect(screen.getByText('notes.txt')).toBeInTheDocument();
      expect(screen.getByText('Cut')).toBeInTheDocument();
      expect(screen.getByText('Copy')).toBeInTheDocument();
      expect(screen.getByText('Delete')).toBeInTheDocument();
    });

    it('should not show Create folder/file when target is set', () => {
      // Arrange
      mockStore.contextMenu = { x: 0, y: 0, owner: 'desktop', targetNodeId: 'node-1' };

      // Act
      render(
        <CreateItemContextMenu owner="desktop" parentId="folder-desktop" currentPath="/home" />,
        { wrapper },
      );

      // Assert
      expect(screen.queryByText('Create folder')).not.toBeInTheDocument();
      expect(screen.queryByText('Create new file')).not.toBeInTheDocument();
    });

    it('should call deleteNode with targetNodeId when Delete is clicked', () => {
      // Arrange
      mockStore.contextMenu = { x: 0, y: 0, owner: 'desktop', targetNodeId: 'node-1' };
      render(
        <CreateItemContextMenu owner="desktop" parentId="folder-desktop" currentPath="/home" />,
        { wrapper },
      );

      // Act
      fireEvent.click(screen.getByText('Delete'));

      // Assert
      expect(mockStore.deleteNode).toHaveBeenCalledWith('node-1');
    });

    it('should call cutToClipboard when Cut is clicked', () => {
      // Arrange
      mockStore.contextMenu = { x: 0, y: 0, owner: 'desktop', targetNodeId: 'node-1' };
      render(
        <CreateItemContextMenu owner="desktop" parentId="folder-desktop" currentPath="/home" />,
        { wrapper },
      );

      // Act
      fireEvent.click(screen.getByText('Cut'));

      // Assert
      expect(mockStore.cutToClipboard).toHaveBeenCalled();
    });

    it('should call copyToClipboard when Copy is clicked', () => {
      // Arrange
      mockStore.contextMenu = { x: 0, y: 0, owner: 'desktop', targetNodeId: 'node-1' };
      render(
        <CreateItemContextMenu owner="desktop" parentId="folder-desktop" currentPath="/home" />,
        { wrapper },
      );

      // Act
      fireEvent.click(screen.getByText('Copy'));

      // Assert
      expect(mockStore.copyToClipboard).toHaveBeenCalled();
    });
  });

  // ── Clipboard paste ─────────────────────────────────────────────────────────
  describe('clipboard paste', () => {
    it('should show Paste option when clipboard has content', () => {
      // Arrange
      const copiedNode: FSNode = {
        id: 'copied-node',
        name: 'test.txt',
        type: 'file',
        parentId: 'old',
        content: '',
        mimeType: 'text/plain',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockStore.clipboard = { content: [copiedNode], action: 'copy' };
      mockStore.contextMenu = { x: 0, y: 0, owner: 'desktop', targetNodeId: undefined };

      // Act
      render(
        <CreateItemContextMenu owner="desktop" parentId="folder-desktop" currentPath="/home" />,
        { wrapper },
      );

      // Assert
      expect(screen.getByText('Paste')).toBeInTheDocument();
    });

    it('should not show Paste option when clipboard is empty', () => {
      // Arrange
      mockStore.clipboard = { content: [], action: null };
      mockStore.contextMenu = { x: 0, y: 0, owner: 'desktop', targetNodeId: undefined };

      // Act
      render(
        <CreateItemContextMenu owner="desktop" parentId="folder-desktop" currentPath="/home" />,
        { wrapper },
      );

      // Assert
      expect(screen.queryByText('Paste')).not.toBeInTheDocument();
    });

    it('should create copy of file when pasting from copy action', () => {
      // Arrange
      const copiedFile: FSNode = {
        id: 'copied-node',
        name: 'original.txt',
        type: 'file',
        parentId: 'old',
        content: 'file content',
        mimeType: 'text/plain',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockStore.clipboard = { content: [copiedFile], action: 'copy' };
      mockStore.contextMenu = { x: 0, y: 0, owner: 'desktop', targetNodeId: undefined };

      render(
        <CreateItemContextMenu owner="desktop" parentId="folder-desktop" currentPath="/home" />,
        { wrapper },
      );

      // Act
      fireEvent.click(screen.getByText('Paste'));

      // Assert
      expect(mockStore.createFile).toHaveBeenCalledWith(
        expect.stringContaining('original.txt'),
        'file content',
        'folder-desktop',
      );
    });

    it('should move file when pasting from cut action', () => {
      // Arrange
      const cutFile: FSNode = {
        id: 'cut-node',
        name: 'moved.txt',
        type: 'file',
        parentId: 'old-folder',
        content: '',
        mimeType: 'text/plain',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockStore.clipboard = { content: [cutFile], action: 'cut' };
      mockStore.contextMenu = { x: 0, y: 0, owner: 'desktop', targetNodeId: undefined };

      render(
        <CreateItemContextMenu owner="desktop" parentId="folder-desktop" currentPath="/home" />,
        { wrapper },
      );

      // Act
      fireEvent.click(screen.getByText('Paste'));

      // Assert
      expect(mockStore.moveNode).toHaveBeenCalledWith('cut-node', 'folder-desktop');
      expect(mockStore.clearClipboard).toHaveBeenCalled();
    });

    it('should show replace modal when pasting a file that already exists', () => {
      // Arrange - existing file with same name in target folder
      const existingFile: FSNode = {
        id: 'existing-file',
        name: 'test.txt',
        type: 'file',
        parentId: 'folder-desktop',
        content: 'old content',
        mimeType: 'text/plain',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockStore.fsNodes = [
        existingFile,
        {
          id: 'folder-desktop',
          name: 'Desktop',
          type: 'folder',
          parentId: null,
          children: ['existing-file'],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const copiedFile: FSNode = {
        id: 'copied-node',
        name: 'test.txt',
        type: 'file',
        parentId: 'other-folder',
        content: 'new content',
        mimeType: 'text/plain',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockStore.clipboard = { content: [copiedFile], action: 'copy' };
      mockStore.contextMenu = { x: 0, y: 0, owner: 'desktop', targetNodeId: undefined };

      render(
        <CreateItemContextMenu owner="desktop" parentId="folder-desktop" currentPath="/home" />,
        { wrapper },
      );

      // Act
      fireEvent.click(screen.getByText('Paste'));

      // Assert
      expect(screen.getByText('Replace file?')).toBeInTheDocument();
      expect(
        screen.getByText('A file named "test.txt" already exists. Do you want to replace it?'),
      ).toBeInTheDocument();
    });

    it('should replace existing file when clicking Yes, replace', () => {
      // Arrange
      const existingFile: FSNode = {
        id: 'existing-file',
        name: 'test.txt',
        type: 'file',
        parentId: 'folder-desktop',
        content: 'old content',
        mimeType: 'text/plain',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockStore.fsNodes = [
        existingFile,
        {
          id: 'folder-desktop',
          name: 'Desktop',
          type: 'folder',
          parentId: null,
          children: ['existing-file'],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const copiedFile: FSNode = {
        id: 'copied-node',
        name: 'test.txt',
        type: 'file',
        parentId: 'other-folder',
        content: 'new content',
        mimeType: 'text/plain',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockStore.clipboard = { content: [copiedFile], action: 'copy' };
      mockStore.contextMenu = { x: 0, y: 0, owner: 'desktop', targetNodeId: undefined };

      render(
        <CreateItemContextMenu owner="desktop" parentId="folder-desktop" currentPath="/home" />,
        { wrapper },
      );

      // Act - click Paste to open modal
      fireEvent.click(screen.getByText('Paste'));
      // Click Yes, replace
      fireEvent.click(screen.getByText('Yes, replace'));

      // Assert
      expect(mockStore.deleteNode).toHaveBeenCalledWith('existing-file');
      expect(mockStore.createFile).toHaveBeenCalledWith(
        'test.txt',
        'new content',
        'folder-desktop',
      );
    });

    it('should not replace existing file when clicking No', () => {
      // Arrange
      const existingFile: FSNode = {
        id: 'existing-file',
        name: 'test.txt',
        type: 'file',
        parentId: 'folder-desktop',
        content: 'old content',
        mimeType: 'text/plain',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockStore.fsNodes = [
        existingFile,
        {
          id: 'folder-desktop',
          name: 'Desktop',
          type: 'folder',
          parentId: null,
          children: ['existing-file'],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const copiedFile: FSNode = {
        id: 'copied-node',
        name: 'test.txt',
        type: 'file',
        parentId: 'other-folder',
        content: 'new content',
        mimeType: 'text/plain',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockStore.clipboard = { content: [copiedFile], action: 'copy' };
      mockStore.contextMenu = { x: 0, y: 0, owner: 'desktop', targetNodeId: undefined };

      render(
        <CreateItemContextMenu owner="desktop" parentId="folder-desktop" currentPath="/home" />,
        { wrapper },
      );

      // Act - click Paste to open modal
      fireEvent.click(screen.getByText('Paste'));
      // Click No
      fireEvent.click(screen.getByText('No'));

      // Assert - should not delete or create
      expect(mockStore.deleteNode).not.toHaveBeenCalled();
      expect(mockStore.createFile).not.toHaveBeenCalled();
    });
  });
});
