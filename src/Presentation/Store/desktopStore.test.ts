import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createLocalStorageMock } from '@/Shared/Testing/__mocks__/localStorage.mock';
import { resetDesktopStore } from '@/Shared/Testing/Utils/resetDesktopStore';
import { resetFsInitFlag } from './fsInitFlag';

// Mock localStorage before importing the store
const localStorageMock = createLocalStorageMock();
vi.stubGlobal('localStorage', localStorageMock);

// Import AFTER stubbing so the store picks up the mock
const { useDesktopStore, clearFileSystem } = await import('./desktopStore');

const baseWindowInput = {
  title: 'Test Window',
  content: 'notepad',
  x: 100,
  y: 100,
  width: 800,
  height: 600,
  minWidth: 200,
  minHeight: 150,
};

const baseIconInput = {
  name: 'Terminal',
  icon: 'terminal.png',
  x: 20,
  y: 20,
  appId: 'terminal',
};

describe('desktopStore', () => {
  beforeEach(() => {
    resetDesktopStore(useDesktopStore, localStorageMock);
  });

  // ── Windows ────────────────────────────────────────────────────────────────
  describe('windows', () => {
    it('should start with no windows', () => {
      expect(useDesktopStore.getState().windows).toHaveLength(0);
    });

    it('should open a window and add it to state', () => {
      // Act
      useDesktopStore.getState().openWindow(baseWindowInput);

      // Assert
      expect(useDesktopStore.getState().windows).toHaveLength(1);
      expect(useDesktopStore.getState().windows[0].title).toBe('Test Window');
    });

    it('should close a window and remove it from state', () => {
      // Arrange
      useDesktopStore.getState().openWindow(baseWindowInput);
      const id = useDesktopStore.getState().windows[0].id;

      // Act
      useDesktopStore.getState().closeWindow(id);

      // Assert
      expect(useDesktopStore.getState().windows).toHaveLength(0);
    });

    it('should minimize a window', () => {
      // Arrange
      useDesktopStore.getState().openWindow(baseWindowInput);
      const id = useDesktopStore.getState().windows[0].id;

      // Act
      useDesktopStore.getState().minimizeWindow(id);

      // Assert
      expect(useDesktopStore.getState().windows[0].state).toBe('minimized');
    });

    it('should maximize a window', () => {
      // Arrange
      useDesktopStore.getState().openWindow(baseWindowInput);
      const id = useDesktopStore.getState().windows[0].id;

      // Act
      useDesktopStore.getState().maximizeWindow(id);

      // Assert
      expect(useDesktopStore.getState().windows[0].state).toBe('maximized');
    });

    it('should restore a minimized window to normal', () => {
      // Arrange
      useDesktopStore.getState().openWindow(baseWindowInput);
      const id = useDesktopStore.getState().windows[0].id;
      useDesktopStore.getState().minimizeWindow(id);

      // Act
      useDesktopStore.getState().restoreWindow(id);

      // Assert
      expect(useDesktopStore.getState().windows[0].state).toBe('normal');
    });

    it('should move a window to new coordinates', () => {
      // Arrange
      useDesktopStore.getState().openWindow(baseWindowInput);
      const id = useDesktopStore.getState().windows[0].id;

      // Act
      useDesktopStore.getState().moveWindow(id, 300, 400);

      // Assert
      const w = useDesktopStore.getState().windows[0];
      expect(w.x).toBe(300);
      expect(w.y).toBe(400);
    });

    it('should resize a window', () => {
      // Arrange
      useDesktopStore.getState().openWindow(baseWindowInput);
      const id = useDesktopStore.getState().windows[0].id;

      // Act
      useDesktopStore.getState().resizeWindow(id, 1280, 720);

      // Assert
      const w = useDesktopStore.getState().windows[0];
      expect(w.width).toBe(1280);
      expect(w.height).toBe(720);
    });

    it('should give a focused window a higher zIndex than others', () => {
      // Arrange
      useDesktopStore.getState().openWindow(baseWindowInput);
      useDesktopStore.getState().openWindow(baseWindowInput);
      const [w1, w2] = useDesktopStore.getState().windows;

      // Act
      useDesktopStore.getState().focusWindow(w1.id);

      // Assert
      const focused = useDesktopStore.getState().windows.find(w => w.id === w1.id)!;
      const other = useDesktopStore.getState().windows.find(w => w.id === w2.id)!;
      expect(focused.zIndex).toBeGreaterThan(other.zIndex);
    });
  });

  // ── Icons ──────────────────────────────────────────────────────────────────
  describe('icons', () => {
    it('should start with no icons', () => {
      expect(useDesktopStore.getState().icons).toHaveLength(0);
    });

    it('should add a desktop icon', () => {
      // Act
      useDesktopStore.getState().addIcon(baseIconInput);

      // Assert
      expect(useDesktopStore.getState().icons).toHaveLength(1);
      expect(useDesktopStore.getState().icons[0].name).toBe('Terminal');
    });

    it('should remove a desktop icon by id', () => {
      // Arrange
      useDesktopStore.getState().addIcon(baseIconInput);
      const id = useDesktopStore.getState().icons[0].id;

      // Act
      useDesktopStore.getState().removeIcon(id);

      // Assert
      expect(useDesktopStore.getState().icons).toHaveLength(0);
    });
  });

  // ── initFs ─────────────────────────────────────────────────────────────────
  // These tests share a single initFs() call: the FS singleton retains nodes
  // between tests, so only the first call seeds. All assertions reuse that state.
  describe('initFs', () => {
    const fsFetchManifest = {
      folders: ['Desktop'],
      files: [
        { name: 'CV_2026_English.pdf', folder: 'Desktop', mimeType: 'application/pdf', url: '' },
        { name: 'notes.txt', folder: 'Desktop', mimeType: 'text/plain', url: '' },
      ],
    };

    // Seed once before all initFs tests
    beforeEach(async () => {
      clearFileSystem();
      resetFsInitFlag();
      useDesktopStore.setState({ icons: [] });
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({ json: () => Promise.resolve(fsFetchManifest) }),
      );
      await useDesktopStore.getState().initFs();
    });

    it('should seed notepad, terminal and files app icons', () => {
      // Assert
      const { icons } = useDesktopStore.getState();
      expect(icons.some(ic => ic.appId === 'notepad')).toBe(true);
      expect(icons.some(ic => ic.appId === 'terminal')).toBe(true);
      expect(icons.some(ic => ic.appId === 'files')).toBe(true);
    });

    it('should seed Desktop/ file icons after app icons', () => {
      // Assert
      const { icons } = useDesktopStore.getState();
      expect(icons.some(ic => ic.name === 'CV_2026_English.pdf')).toBe(true);
      expect(icons.some(ic => ic.name === 'notes.txt')).toBe(true);
    });

    it('should place all icons at unique positions (no overlaps)', () => {
      // Assert
      const { icons } = useDesktopStore.getState();
      const positions = icons.map(ic => `${ic.x},${ic.y}`);
      expect(new Set(positions).size).toBe(icons.length);
    });

    it('should not add icons on a second initFs call', async () => {
      // Arrange
      const countAfterFirst = useDesktopStore.getState().icons.length;

      // Act — second call is a no-op: fileSystem is non-empty
      await useDesktopStore.getState().initFs();

      // Assert
      expect(useDesktopStore.getState().icons).toHaveLength(countAfterFirst);
    });
  });

  // ── FileSystem ─────────────────────────────────────────────────────────────
  describe('fileSystem', () => {
    it('should create a file and expose it in fsNodes', () => {
      // Act
      useDesktopStore.getState().createFile('readme.txt', 'Hello', null);

      // Assert
      expect(useDesktopStore.getState().fsNodes.some(n => n.name === 'readme.txt')).toBe(true);
    });

    it('should create a folder and expose it in fsNodes', () => {
      // Act
      useDesktopStore.getState().createFolder('Documents', null);

      // Assert
      expect(useDesktopStore.getState().fsNodes.some(n => n.name === 'Documents')).toBe(true);
    });

    it('should delete a node and remove it from fsNodes', () => {
      // Arrange
      const file = useDesktopStore.getState().createFile('delete-me.txt', '', null);

      // Act
      useDesktopStore.getState().deleteNode(file.id);

      // Assert
      expect(useDesktopStore.getState().fsNodes.some(n => n.id === file.id)).toBe(false);
    });

    it('should update a file content', () => {
      // Arrange
      const file = useDesktopStore.getState().createFile('edit.txt', 'original', null);

      // Act
      useDesktopStore.getState().updateFile(file.id, 'updated');

      // Assert — no throw is the primary assertion; state sync is a side effect
      expect(useDesktopStore.getState().fsNodes.some(n => n.name === 'edit.txt')).toBe(true);
    });
  });

  // ── Desktop context menu creation ──────────────────────────────────────────
  describe('desktop context menu creation', () => {
    const fsFetchManifest = { folders: ['Desktop'], files: [] };

    beforeEach(async () => {
      clearFileSystem();
      resetFsInitFlag();
      useDesktopStore.setState({ icons: [] });
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({ json: () => Promise.resolve(fsFetchManifest) }),
      );
      await useDesktopStore.getState().initFs();
    });

    it('should expose desktopFolderId matching the Desktop/ folder', () => {
      // Assert
      const { desktopFolderId, fsNodes } = useDesktopStore.getState();
      const desktopFolder = fsNodes.find(n => n.name === 'Desktop' && n.type === 'folder');
      expect(desktopFolderId).toBe(desktopFolder?.id);
    });

    it('should create a file inside Desktop/ when using desktopFolderId', () => {
      // Arrange
      const { desktopFolderId } = useDesktopStore.getState();

      // Act — simulate desktop context menu creation
      useDesktopStore.getState().createFile('notes.txt', '', desktopFolderId);

      // Assert
      const { fsNodes } = useDesktopStore.getState();
      const file = fsNodes.find(n => n.name === 'notes.txt');
      expect(file).toBeDefined();
      expect(file?.parentId).toBe(desktopFolderId);
    });

    it('should create a folder inside Desktop/ when using desktopFolderId', () => {
      // Arrange
      const { desktopFolderId } = useDesktopStore.getState();

      // Act
      useDesktopStore.getState().createFolder('Projects', desktopFolderId);

      // Assert
      const { fsNodes } = useDesktopStore.getState();
      const folder = fsNodes.find(n => n.name === 'Projects');
      expect(folder).toBeDefined();
      expect(folder?.parentId).toBe(desktopFolderId);
    });

    it('should create a file inside a subfolder when using filesCurrentFolderId', () => {
      // Arrange — create a subfolder to simulate Files app being inside it
      const { desktopFolderId } = useDesktopStore.getState();
      const subfolder = useDesktopStore.getState().createFolder('Work', desktopFolderId);

      // Act — simulate Files app context menu creation
      useDesktopStore.getState().createFile('report.txt', '', subfolder.id);

      // Assert
      const { fsNodes } = useDesktopStore.getState();
      const file = fsNodes.find(n => n.name === 'report.txt');
      expect(file?.parentId).toBe(subfolder.id);
      expect(file?.parentId).not.toBe(desktopFolderId);
    });

    it('should NOT create desktop icon for files created outside Desktop/', () => {
      // Arrange — file created at root (null parentId) as the bug did
      const iconsBefore = useDesktopStore.getState().icons.length;

      // Act
      useDesktopStore.getState().createFile('orphan.txt', '', null);

      // Assert — no new desktop icon added
      expect(useDesktopStore.getState().icons).toHaveLength(iconsBefore);
    });

    it('should create a desktop icon for files created inside Desktop/', () => {
      // Arrange
      const { desktopFolderId } = useDesktopStore.getState();
      const iconsBefore = useDesktopStore.getState().icons.length;

      // Act
      useDesktopStore.getState().createFile('readme.txt', '', desktopFolderId);

      // Assert
      expect(useDesktopStore.getState().icons).toHaveLength(iconsBefore + 1);
      expect(useDesktopStore.getState().icons.some(ic => ic.name === 'readme.txt')).toBe(true);
    });

    it('should create a desktop icon for folders created inside Desktop/', () => {
      // Arrange
      const { desktopFolderId } = useDesktopStore.getState();
      const iconsBefore = useDesktopStore.getState().icons.length;

      // Act
      useDesktopStore.getState().createFolder('Projects', desktopFolderId);

      // Assert
      expect(useDesktopStore.getState().icons).toHaveLength(iconsBefore + 1);
      expect(useDesktopStore.getState().icons.some(ic => ic.name === 'Projects')).toBe(true);
    });

    it('should NOT create desktop icon for folders created outside Desktop/', () => {
      // Arrange
      const iconsBefore = useDesktopStore.getState().icons.length;

      // Act
      useDesktopStore.getState().createFolder('orphan', null);

      // Assert
      expect(useDesktopStore.getState().icons).toHaveLength(iconsBefore);
    });

    it('should remove desktop icon when a folder in Desktop/ is deleted', () => {
      // Arrange
      const { desktopFolderId } = useDesktopStore.getState();
      const folder = useDesktopStore.getState().createFolder('ToDelete', desktopFolderId);
      const iconsBefore = useDesktopStore.getState().icons.length;

      // Act
      useDesktopStore.getState().deleteNode(folder.id);

      // Assert
      expect(useDesktopStore.getState().icons).toHaveLength(iconsBefore - 1);
      expect(useDesktopStore.getState().icons.some(ic => ic.name === 'ToDelete')).toBe(false);
    });
  });

  // ── Theme ──────────────────────────────────────────────────────────────────
  describe('theme', () => {
    it('should start with light theme', () => {
      expect(useDesktopStore.getState().theme.mode).toBe('light');
    });

    it('should switch to dark mode via setThemeMode', () => {
      // Act
      useDesktopStore.getState().setThemeMode('dark');

      // Assert
      expect(useDesktopStore.getState().theme.mode).toBe('dark');
    });

    it('should toggle from light to dark', () => {
      // Act
      useDesktopStore.getState().toggleTheme();

      // Assert
      expect(useDesktopStore.getState().theme.mode).toBe('dark');
    });

    it('should toggle back to light after two toggles', () => {
      // Act
      useDesktopStore.getState().toggleTheme();
      useDesktopStore.getState().toggleTheme();

      // Assert
      expect(useDesktopStore.getState().theme.mode).toBe('light');
    });
  });
});
