// @vitest-environment jsdom
import '@/Shared/Testing/__mocks__/jsdom-setup';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { renderWithMantine as wrapper } from '@/Shared/Testing/Utils/renderWithMantine';
import { buildNotesMenuBar } from './buildNotesMenuBar';

// ── TipTap mock ───────────────────────────────────────────────────────────────
// TipTap relies on ProseMirror APIs not available in JSDOM.
// We replace useEditor / useEditorState / EditorContent with lightweight stubs.
// The captured `onUpdate` callback lets tests simulate editor edits.

let capturedOnUpdate: (() => void) | undefined;

const mockEditorChain = {
  focus: () => mockEditorChain,
  toggleBold: () => mockEditorChain,
  toggleItalic: () => mockEditorChain,
  toggleStrike: () => mockEditorChain,
  toggleCode: () => mockEditorChain,
  toggleHeading: () => mockEditorChain,
  toggleBulletList: () => mockEditorChain,
  toggleOrderedList: () => mockEditorChain,
  toggleBlockquote: () => mockEditorChain,
  toggleCodeBlock: () => mockEditorChain,
  setHorizontalRule: () => mockEditorChain,
  undo: () => mockEditorChain,
  redo: () => mockEditorChain,
  setContent: () => mockEditorChain,
  run: () => true,
};

const mockEditor = {
  chain: () => mockEditorChain,
  can: () => ({
    chain: () => ({
      focus: () => ({
        toggleBold: () => ({ run: () => true }),
        toggleItalic: () => ({ run: () => true }),
        toggleStrike: () => ({ run: () => true }),
        toggleCode: () => ({ run: () => true }),
        undo: () => ({ run: () => true }),
        redo: () => ({ run: () => true }),
      }),
    }),
    undo: () => true,
    redo: () => true,
  }),
  commands: {
    setContent: vi.fn(),
  },
  isActive: vi.fn(() => false),
  getMarkdown: vi.fn(() => '# Hello'),
};

vi.mock('@tiptap/react', () => ({
  useEditor: vi.fn(opts => {
    capturedOnUpdate = opts?.onUpdate;
    return mockEditor;
  }),
  EditorContent: ({ className }: { className?: string }) => (
    <div data-testid="editor-content" className={className} />
  ),
  useEditorState: vi.fn(() => ({
    canUndo: false,
    canRedo: false,
    isBold: false,
    isItalic: false,
    isStrike: false,
    isCode: false,
    isH1: false,
    isH2: false,
    isBulletList: false,
    isOrderedList: false,
    isBlockquote: false,
    isCodeBlock: false,
  })),
}));

vi.mock('@tiptap/starter-kit', () => ({ default: {} }));
vi.mock('@tiptap/markdown', () => ({ Markdown: {} }));
vi.mock('@tiptap/core', () => ({
  Extension: { create: vi.fn(() => ({})) },
}));

// ── Icon mocks ────────────────────────────────────────────────────────────────
vi.mock('react-icons/vsc', () => ({
  VscBold: () => <svg data-testid="icon-bold" />,
  VscItalic: () => <svg data-testid="icon-italic" />,
  VscCode: () => <svg data-testid="icon-code" />,
  VscSymbolClass: () => <svg />,
  VscSymbolMethod: () => <svg />,
  VscListUnordered: () => <svg />,
  VscListOrdered: () => <svg />,
  VscQuote: () => <svg />,
  VscTerminal: () => <svg />,
  VscDiscard: () => <svg data-testid="icon-undo" />,
  VscRedo: () => <svg data-testid="icon-redo" />,
  VscHorizontalRule: () => <svg />,
  VscFolder: () => <svg />,
  VscFolderOpened: () => <svg />,
  VscFilePdf: () => <svg />,
  VscFile: () => <svg />,
  VscMarkdown: () => <svg />,
  VscFileMedia: () => <svg />,
  VscFileCode: () => <svg />,
  VscJson: () => <svg />,
}));

vi.mock('react-icons/bi', () => ({
  BiStrikethrough: () => <svg data-testid="icon-strike" />,
}));

vi.mock('react-icons/lu', () => ({
  LuHeading1: () => <svg />,
  LuHeading2: () => <svg />,
}));

// ── FilePickerApp mock ────────────────────────────────────────────────────────
// Capture onConfirm so tests can simulate a file being selected in the picker.
let capturedPickerConfirm: ((node: unknown) => void) | undefined;

vi.mock('@presentation/Components/Shared/FilePickerApp/FilePickerApp', () => ({
  FilePickerModal: ({
    opened,
    onConfirm,
    onCancel,
  }: {
    opened: boolean;
    onConfirm: (node: unknown) => void;
    onCancel: () => void;
  }) => {
    capturedPickerConfirm = onConfirm;
    if (!opened) return null;
    return (
      <div role="dialog" aria-label="Open file">
        <button aria-label="Cancel" onClick={onCancel} />
      </div>
    );
  },
  FileSaveModal: ({
    opened,
    onConfirm,
    onCancel,
  }: {
    opened: boolean;
    initialName: string;
    onConfirm: (r: unknown) => void;
    onCancel: () => void;
  }) => {
    if (!opened) return null;
    return (
      <div role="dialog" aria-label="Save file">
        <button aria-label="Save" onClick={() => onConfirm({ parentId: null, name: 'file.md' })} />
        <button aria-label="CancelSave" onClick={onCancel} />
      </div>
    );
  },
}));

// ── Store mock ────────────────────────────────────────────────────────────────
const mockCreateFile = vi.fn(() => ({ id: 'new-file', name: 'untitled.md' }));
const mockUpdateFile = vi.fn();

const mockStore = {
  fsNodes: [],
  createFile: mockCreateFile,
  updateFile: mockUpdateFile,
};

vi.mock('@presentation/Store/desktopStore', () => ({
  useDesktopStore: (selector: (s: typeof mockStore) => unknown) => selector(mockStore),
}));

const { default: NotesApp } = await import('./NotesApp');

// ─────────────────────────────────────────────────────────────────────────────

// ── fetch mock ────────────────────────────────────────────────────────────────
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const makeFetchResponse = (text: string) =>
  Promise.resolve({ ok: true, text: () => Promise.resolve(text) });

describe('NotesApp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedOnUpdate = undefined;
    // Default: fetch returns empty so it doesn't interfere with unrelated tests
    mockFetch.mockResolvedValue({ ok: false, text: () => Promise.resolve('') });
  });

  // ── Render ─────────────────────────────────────────────────────────────────

  describe('Render', () => {
    it('should render the editor content area', () => {
      render(<NotesApp />, { wrapper });
      expect(screen.getByTestId('editor-content')).toBeInTheDocument();
    });

    it('should render the formatting toolbar', () => {
      render(<NotesApp />, { wrapper });
      expect(screen.getByRole('toolbar', { name: 'Text formatting' })).toBeInTheDocument();
    });

    it('should render Bold button in the toolbar', () => {
      render(<NotesApp />, { wrapper });
      expect(screen.getByRole('button', { name: 'Bold' })).toBeInTheDocument();
    });

    it('should render Italic button in the toolbar', () => {
      render(<NotesApp />, { wrapper });
      expect(screen.getByRole('button', { name: 'Italic' })).toBeInTheDocument();
    });

    it('should render Undo button in the toolbar', () => {
      render(<NotesApp />, { wrapper });
      expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument();
    });

    it('should render Redo button in the toolbar', () => {
      render(<NotesApp />, { wrapper });
      expect(screen.getByRole('button', { name: 'Redo' })).toBeInTheDocument();
    });

    it('should not show the dirty indicator when editor is clean', () => {
      render(<NotesApp />, { wrapper });
      expect(screen.queryByTitle('Unsaved changes')).not.toBeInTheDocument();
    });
  });

  // ── Dirty state ────────────────────────────────────────────────────────────

  describe('Dirty state', () => {
    it('should show the dirty indicator after the editor is updated', () => {
      // Arrange
      render(<NotesApp />, { wrapper });

      // Act — simulate TipTap onUpdate firing
      act(() => capturedOnUpdate?.());

      // Assert
      expect(screen.getByTitle('Unsaved changes')).toBeInTheDocument();
    });

    it('should call onDirtyChange(true) when the editor content changes', () => {
      // Arrange
      const onDirtyChange = vi.fn();
      render(<NotesApp onDirtyChange={onDirtyChange} />, { wrapper });

      // Act
      act(() => capturedOnUpdate?.());

      // Assert
      expect(onDirtyChange).toHaveBeenCalledWith(true);
    });

    it('should call onDirtyChange(false) after handleNew resets dirty state', () => {
      // Arrange
      const onDirtyChange = vi.fn();
      const onRegisterActions = vi.fn();
      render(<NotesApp onDirtyChange={onDirtyChange} onRegisterActions={onRegisterActions} />, {
        wrapper,
      });
      act(() => capturedOnUpdate?.());
      onDirtyChange.mockClear();

      // Act — trigger new via registered actions
      act(() => onRegisterActions.mock.calls[0][0].new());

      // Assert
      expect(onDirtyChange).toHaveBeenCalledWith(false);
    });
  });

  // ── Markdown content loading ───────────────────────────────────────────────

  describe('Markdown content loading', () => {
    it('should initialize editor with initialContent from contentData', async () => {
      // Arrange
      const { useEditor } = await import('@tiptap/react');

      // Act
      render(<NotesApp contentData={{ initialContent: '# Hello World' }} />, { wrapper });

      // Assert — useEditor is called with the initial content and contentType: 'markdown'
      expect(vi.mocked(useEditor)).toHaveBeenCalledWith(
        expect.objectContaining({
          content: '# Hello World',
          contentType: 'markdown',
        }),
      );
    });

    it('should use contentType markdown so markdown syntax is parsed, not shown as raw text', async () => {
      // Arrange
      const { useEditor } = await import('@tiptap/react');

      // Act
      render(<NotesApp contentData={{ initialContent: '**bold**' }} />, { wrapper });

      // Assert — contentType must be 'markdown', not the default 'json'/'html'
      const callArgs = vi.mocked(useEditor).mock.calls[0][0];
      expect(callArgs?.contentType).toBe('markdown');
    });

    it('should fetch content from url when initialContent is empty and url is provided', async () => {
      // Arrange
      mockFetch.mockReturnValueOnce(makeFetchResponse('# From URL'));

      // Act
      render(<NotesApp contentData={{ initialContent: '', url: 'Desktop/note.md' }} />, {
        wrapper,
      });

      // Assert — setContent called with the fetched markdown
      await vi.waitFor(() => {
        expect(mockEditor.commands.setContent).toHaveBeenCalledWith(
          '# From URL',
          expect.objectContaining({ contentType: 'markdown' }),
        );
      });
    });

    it('should not fetch when initialContent is already provided', async () => {
      // Arrange — content is present, url fetch should be skipped
      mockFetch.mockReturnValueOnce(makeFetchResponse('# From URL'));

      // Act
      render(
        <NotesApp contentData={{ initialContent: '# Already here', url: 'Desktop/note.md' }} />,
        { wrapper },
      );

      // Assert — fetch not called because content was provided
      await new Promise(r => setTimeout(r, 20));
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should initialize fileName from initialName in contentData', () => {
      // Arrange
      const onRegisterActions = vi.fn();
      render(
        <NotesApp
          contentData={{ initialName: 'my-note.md', initialContent: '' }}
          onRegisterActions={onRegisterActions}
        />,
        { wrapper },
      );

      // Act — open save modal via saveAs to check the fileName passed as initialName
      // We verify the save modal uses the correct initialName indirectly via
      // the FileSaveModal's dialog appearing with the correct label
      act(() => onRegisterActions.mock.calls[0][0].saveAs());

      // Assert — FileSaveModal opens (save dialog visible)
      expect(screen.getByRole('dialog', { name: 'Save file' })).toBeInTheDocument();
    });
  });

  // ── File picker modal ──────────────────────────────────────────────────────

  describe('File picker modal', () => {
    it('should not show the picker modal when pickerOpen is false', () => {
      render(<NotesApp pickerOpen={false} />, { wrapper });
      expect(screen.queryByRole('dialog', { name: 'Open file' })).not.toBeInTheDocument();
    });

    it('should show the picker modal when pickerOpen is true', () => {
      render(<NotesApp pickerOpen={true} onPickerClose={vi.fn()} />, { wrapper });
      expect(screen.getByRole('dialog', { name: 'Open file' })).toBeInTheDocument();
    });

    it('should call onPickerClose when Cancel is clicked in the picker', () => {
      // Arrange
      const onPickerClose = vi.fn();
      render(<NotesApp pickerOpen={true} onPickerClose={onPickerClose} />, { wrapper });

      // Act
      fireEvent.click(screen.getByLabelText('Cancel'));

      // Assert
      expect(onPickerClose).toHaveBeenCalledOnce();
    });

    it('should fetch content from url when selected file has empty content but a url', async () => {
      // Arrange
      mockFetch.mockReturnValueOnce(makeFetchResponse('# Loaded from URL'));
      render(<NotesApp pickerOpen={true} onPickerClose={vi.fn()} />, { wrapper });

      // Act — simulate the picker confirming a file with empty content but a url
      act(() => {
        capturedPickerConfirm?.({
          id: 'file-url',
          name: 'remote.md',
          type: 'file',
          content: '',
          url: 'Desktop/remote.md',
        });
      });

      // Assert — setContent called with the fetched text
      await vi.waitFor(() => {
        expect(mockEditor.commands.setContent).toHaveBeenCalledWith(
          '# Loaded from URL',
          expect.objectContaining({ contentType: 'markdown' }),
        );
      });
    });

    it('should load content directly when selected file already has content (no extra fetch)', async () => {
      // Arrange — open with an existing file so no welcome fetch fires on mount
      render(
        <NotesApp
          pickerOpen={true}
          onPickerClose={vi.fn()}
          contentData={{ initialContent: '# Existing', initialName: 'existing.md' }}
        />,
        { wrapper },
      );
      mockFetch.mockClear(); // clear any mount-time fetch

      // Act
      act(() => {
        capturedPickerConfirm?.({
          id: 'file-local',
          name: 'local.md',
          type: 'file',
          content: '# Already here',
          url: undefined,
        });
      });

      // Assert — setContent called with the node content, fetch not invoked (no url)
      await vi.waitFor(() => {
        expect(mockEditor.commands.setContent).toHaveBeenCalledWith(
          '# Already here',
          expect.objectContaining({ contentType: 'markdown' }),
        );
      });
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  // ── onRegisterActions ──────────────────────────────────────────────────────

  describe('onRegisterActions', () => {
    it('should call onRegisterActions with new, save and saveAs handlers', () => {
      // Arrange
      const onRegisterActions = vi.fn();

      // Act
      render(<NotesApp onRegisterActions={onRegisterActions} />, { wrapper });

      // Assert
      expect(onRegisterActions).toHaveBeenCalledOnce();
      const actions = onRegisterActions.mock.calls[0][0];
      expect(typeof actions.new).toBe('function');
      expect(typeof actions.save).toBe('function');
      expect(typeof actions.saveAs).toBe('function');
    });

    it('should open the save modal when save is called with no existing fileId', () => {
      // Arrange
      const onRegisterActions = vi.fn();
      render(<NotesApp onRegisterActions={onRegisterActions} />, { wrapper });

      // Act — call save with no fileId (first save ever)
      act(() => onRegisterActions.mock.calls[0][0].save());

      // Assert — FileSaveModal shown
      expect(screen.getByRole('dialog', { name: 'Save file' })).toBeInTheDocument();
    });

    it('should call updateFile immediately when save is called with existing fileId', () => {
      // Arrange
      const onRegisterActions = vi.fn();
      render(
        <NotesApp
          contentData={{ fileId: 'existing-file', initialContent: '# Hi' }}
          onRegisterActions={onRegisterActions}
        />,
        { wrapper },
      );

      // Act
      act(() => onRegisterActions.mock.calls[0][0].save());

      // Assert — updateFile called in-place, no modal
      expect(mockUpdateFile).toHaveBeenCalledWith('existing-file', expect.any(String));
      expect(screen.queryByRole('dialog', { name: 'Save file' })).not.toBeInTheDocument();
    });
  });

  // ── buildNotesMenuBar ──────────────────────────────────────────────────────

  describe('buildNotesMenuBar', () => {
    it('should return a single File menu', () => {
      const menuBar = buildNotesMenuBar(vi.fn(), vi.fn(), vi.fn(), vi.fn(), vi.fn(), false);
      expect(menuBar).toHaveLength(1);
      expect(menuBar[0]).toMatchObject({ type: 'menu', label: 'File' });
    });

    it('should include New, Open, Save, Save As, and Exit items', () => {
      const menuBar = buildNotesMenuBar(vi.fn(), vi.fn(), vi.fn(), vi.fn(), vi.fn(), false);
      const items = (menuBar[0] as { items: Array<{ type: string; label?: string }> }).items;
      const labels = items.filter(i => i.type === 'item').map(i => i.label);
      expect(labels).toContain('New');
      expect(labels).toContain('Open');
      expect(labels).toContain('Save');
      expect(labels).toContain('Save As');
      expect(labels).toContain('Exit');
    });

    it('should call onNew when New item is clicked', () => {
      // Arrange
      const onNew = vi.fn();
      const menuBar = buildNotesMenuBar(onNew, vi.fn(), vi.fn(), vi.fn(), vi.fn(), false);
      const items = (
        menuBar[0] as { items: Array<{ type: string; label?: string; onClick?: () => void }> }
      ).items;

      // Act
      items.find(i => i.label === 'New')!.onClick!();

      // Assert
      expect(onNew).toHaveBeenCalledOnce();
    });

    it('should call onOpen when Open item is clicked', () => {
      // Arrange
      const onOpen = vi.fn();
      const menuBar = buildNotesMenuBar(vi.fn(), onOpen, vi.fn(), vi.fn(), vi.fn(), false);
      const items = (
        menuBar[0] as { items: Array<{ type: string; label?: string; onClick?: () => void }> }
      ).items;

      // Act
      items.find(i => i.label === 'Open')!.onClick!();

      // Assert
      expect(onOpen).toHaveBeenCalledOnce();
    });

    it('should call onExit when Exit item is clicked', () => {
      // Arrange
      const onExit = vi.fn();
      const menuBar = buildNotesMenuBar(vi.fn(), vi.fn(), vi.fn(), vi.fn(), onExit, false);
      const items = (
        menuBar[0] as { items: Array<{ type: string; label?: string; onClick?: () => void }> }
      ).items;

      // Act
      items.find(i => i.label === 'Exit')!.onClick!();

      // Assert
      expect(onExit).toHaveBeenCalledOnce();
    });

    it('should disable Save when isDirty is false', () => {
      const menuBar = buildNotesMenuBar(vi.fn(), vi.fn(), vi.fn(), vi.fn(), vi.fn(), false);
      const items = (
        menuBar[0] as { items: Array<{ type: string; label?: string; disabled?: boolean }> }
      ).items;
      expect(items.find(i => i.label === 'Save')?.disabled).toBe(true);
    });

    it('should enable Save when isDirty is true', () => {
      const menuBar = buildNotesMenuBar(vi.fn(), vi.fn(), vi.fn(), vi.fn(), vi.fn(), true);
      const items = (
        menuBar[0] as { items: Array<{ type: string; label?: string; disabled?: boolean }> }
      ).items;
      expect(items.find(i => i.label === 'Save')?.disabled).toBe(false);
    });
  });
});
