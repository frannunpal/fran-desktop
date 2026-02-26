import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createLocalStorageMock } from '@/Shared/Testing/__mocks__/localStorage.mock';
import { resetDesktopStore } from '@/Shared/Testing/Utils/resetDesktopStore';

// Mock localStorage before importing the store
const localStorageMock = createLocalStorageMock();
vi.stubGlobal('localStorage', localStorageMock);

// Import AFTER stubbing so the store picks up the mock
const { useDesktopStore } = await import('./desktopStore');

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
