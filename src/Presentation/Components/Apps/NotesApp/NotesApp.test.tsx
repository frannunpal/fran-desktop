// @vitest-environment jsdom
import '@/Shared/Testing/__mocks__/jsdom-setup';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { renderWithMantine as wrapper } from '@/Shared/Testing/Utils/renderWithMantine';
import { buildNotesMenuBar } from './buildNotesMenuBar';
import { createMockWindowEntity } from '@/Shared/Testing/Utils/makeWindowEntity';
import type { NotesAppActions } from './NotesApp';

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

// ── fetch mock ────────────────────────────────────────────────────────────────
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const makeFetchResponse = (text: string) =>
  Promise.resolve({ ok: true, text: () => Promise.resolve(text) });

// ── Helper ────────────────────────────────────────────────────────────────────
// Render NotesApp with a mock WindowEntity and return win (to access contentData.actions)
// notifyReady merges the payload back into win.contentData so tests can read it
const renderNotesApp = (contentData: Record<string, unknown> = {}) => {
  const win = createMockWindowEntity({ contentData });
  const notifyReady = vi.fn((payload?: Record<string, unknown>) => {
    if (payload) win.contentData = { ...(win.contentData ?? {}), ...payload };
  });
  render(<NotesApp window={win} notifyReady={notifyReady} />, { wrapper });
  return { win, notifyReady };
};

// Convenience: get the registered actions from contentData after mount
const getActions = (win: ReturnType<typeof createMockWindowEntity>): NotesAppActions => {
  return win.contentData?.actions as NotesAppActions;
};

// ─────────────────────────────────────────────────────────────────────────────

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
      renderNotesApp();
      expect(screen.getByTestId('editor-content')).toBeInTheDocument();
    });

    it('should render the formatting toolbar', () => {
      renderNotesApp();
      expect(screen.getByRole('toolbar', { name: 'Text formatting' })).toBeInTheDocument();
    });

    it('should render Bold button in the toolbar', () => {
      renderNotesApp();
      expect(screen.getByRole('button', { name: 'Bold' })).toBeInTheDocument();
    });

    it('should render Italic button in the toolbar', () => {
      renderNotesApp();
      expect(screen.getByRole('button', { name: 'Italic' })).toBeInTheDocument();
    });

    it('should render Undo button in the toolbar', () => {
      renderNotesApp();
      expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument();
    });

    it('should render Redo button in the toolbar', () => {
      renderNotesApp();
      expect(screen.getByRole('button', { name: 'Redo' })).toBeInTheDocument();
    });

    it('should not show the dirty indicator when editor is clean', () => {
      renderNotesApp();
      expect(screen.queryByTitle('Unsaved changes')).not.toBeInTheDocument();
    });
  });

  // ── Dirty state ────────────────────────────────────────────────────────────

  describe('Dirty state', () => {
    it('should show the dirty indicator after the editor is updated', () => {
      // Arrange
      renderNotesApp();

      // Act — simulate TipTap onUpdate firing
      act(() => capturedOnUpdate?.());

      // Assert
      expect(screen.getByTitle('Unsaved changes')).toBeInTheDocument();
    });

    it('should expose isDirty in contentData when the editor content changes', () => {
      // Arrange
      const { win } = renderNotesApp();

      // Act
      act(() => capturedOnUpdate?.());

      // Assert — contentData.isDirty is updated
      expect(win.contentData?.isDirty).toBe(true);
    });

    it('should set isDirty to false in contentData after handleNew resets dirty state', () => {
      // Arrange
      const { win } = renderNotesApp();
      act(() => capturedOnUpdate?.());
      expect(win.contentData?.isDirty).toBe(true);

      // Act — trigger new via registered actions
      act(() => getActions(win).new());

      // Assert
      expect(win.contentData?.isDirty).toBe(false);
    });
  });

  // ── Markdown content loading ───────────────────────────────────────────────

  describe('Markdown content loading', () => {
    it('should initialize editor with initialContent from contentData', async () => {
      // Arrange
      const { useEditor } = await import('@tiptap/react');

      // Act
      renderNotesApp({ initialContent: '# Hello World' });

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
      renderNotesApp({ initialContent: '**bold**' });

      // Assert — contentType must be 'markdown', not the default 'json'/'html'
      const callArgs = vi.mocked(useEditor).mock.calls[0][0];
      expect(callArgs?.contentType).toBe('markdown');
    });

    it('should fetch content from url when initialContent is empty and url is provided', async () => {
      // Arrange
      mockFetch.mockReturnValueOnce(makeFetchResponse('# From URL'));

      // Act
      renderNotesApp({ initialContent: '', url: 'Desktop/note.md' });

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
      renderNotesApp({ initialContent: '# Already here', url: 'Desktop/note.md' });

      // Assert — fetch not called because content was provided
      await new Promise(r => setTimeout(r, 20));
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should initialize fileName from initialName in contentData', () => {
      // Arrange
      const { win } = renderNotesApp({ initialName: 'my-note.md', initialContent: '' });

      // Act — open save modal via saveAs to check the fileName used as initialName
      act(() => getActions(win).saveAs());

      // Assert — FileSaveModal opens (save dialog visible)
      expect(screen.getByRole('dialog', { name: 'Save file' })).toBeInTheDocument();
    });
  });

  // ── File picker modal ──────────────────────────────────────────────────────

  describe('File picker modal', () => {
    it('should not show the picker modal on initial render', () => {
      renderNotesApp();
      expect(screen.queryByRole('dialog', { name: 'Open file' })).not.toBeInTheDocument();
    });

    it('should show the picker modal after calling setPickerOpen', () => {
      // Arrange
      const { win } = renderNotesApp();

      // Act
      act(() => (win.contentData?.setPickerOpen as (() => void) | undefined)?.());

      // Assert
      expect(screen.getByRole('dialog', { name: 'Open file' })).toBeInTheDocument();
    });

    it('should close the picker when Cancel is clicked', () => {
      // Arrange
      const { win } = renderNotesApp();
      act(() => (win.contentData?.setPickerOpen as (() => void) | undefined)?.());
      expect(screen.getByRole('dialog', { name: 'Open file' })).toBeInTheDocument();

      // Act
      fireEvent.click(screen.getByLabelText('Cancel'));

      // Assert
      expect(screen.queryByRole('dialog', { name: 'Open file' })).not.toBeInTheDocument();
    });

    it('should fetch content from url when selected file has empty content but a url', async () => {
      // Arrange — use initialContent so the welcome fetch is skipped on mount.
      // Reset mocks explicitly to avoid leftover mockReturnValueOnce from previous tests.
      mockFetch.mockReset();
      mockEditor.commands.setContent.mockClear();
      mockFetch.mockResolvedValue({ ok: false, text: () => Promise.resolve('') });
      const { win } = renderNotesApp({ initialContent: '# Existing', initialName: 'existing.md' });
      act(() => (win.contentData?.setPickerOpen as (() => void) | undefined)?.());
      mockFetch.mockReturnValueOnce(makeFetchResponse('# Loaded from URL'));

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
      const { win } = renderNotesApp({ initialContent: '# Existing', initialName: 'existing.md' });
      act(() => (win.contentData?.setPickerOpen as (() => void) | undefined)?.());
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

  // ── contentData actions ────────────────────────────────────────────────────

  describe('contentData actions', () => {
    it('should register new, save and saveAs handlers in contentData', () => {
      // Arrange & Act
      const { win } = renderNotesApp();

      // Assert
      const actions = getActions(win);
      expect(typeof actions.new).toBe('function');
      expect(typeof actions.save).toBe('function');
      expect(typeof actions.saveAs).toBe('function');
    });

    it('should open the save modal when save is called with no existing fileId', () => {
      // Arrange
      const { win } = renderNotesApp();

      // Act — call save with no fileId (first save ever)
      act(() => getActions(win).save());

      // Assert — FileSaveModal shown
      expect(screen.getByRole('dialog', { name: 'Save file' })).toBeInTheDocument();
    });

    it('should call updateFile immediately when save is called with existing fileId', () => {
      // Arrange
      const { win } = renderNotesApp({ fileId: 'existing-file', initialContent: '# Hi' });

      // Act
      act(() => getActions(win).save());

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
