// @vitest-environment jsdom
import '@/Shared/Testing/__mocks__/jsdom-setup';
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
}));

vi.mock('@presentation/Components/Shared/CreateItemModal/CreateItemModal', () => ({
  default: ({ opened }: { opened: boolean }) =>
    opened ? <div role="dialog" /> : null,
}));

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

const mockStore = {
  contextMenu: { x: 100, y: 200, owner: null as string | null, targetNodeId: undefined as string | undefined },
  closeContextMenu: vi.fn(),
  createFile: vi.fn(),
  createFolder: vi.fn(),
  deleteNode: vi.fn(),
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
  });
});
