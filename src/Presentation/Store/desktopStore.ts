import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { WindowManagerAdapter } from '@infrastructure/Adapters/WindowManagerAdapter';
import { LocalStorageFileSystem } from '@infrastructure/Adapters/LocalStorageFileSystem';
import { DefaultThemeProvider } from '@infrastructure/Adapters/DefaultThemeProvider';
import type { WindowEntity, WindowInput } from '@domain/Entities/Window';
import type { FSNode, FileNode, FolderNode } from '@domain/Entities/FileSystem';
import type { Theme, ThemeMode } from '@application/Ports/IThemeProvider';
import type { DesktopIconEntity, DesktopIconInput } from '@domain/Entities/DesktopIcon';
import { createDesktopIcon } from '@domain/Entities/DesktopIcon';

// ─── Adapters (singleton, not persisted) ────────────────────────────────────
const windowManager = new WindowManagerAdapter();
const fileSystem = new LocalStorageFileSystem();
const themeProvider = new DefaultThemeProvider();

// ─── State shape ─────────────────────────────────────────────────────────────
interface DesktopState {
  // Window slice
  windows: WindowEntity[];
  openWindow: (input: WindowInput) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  moveWindow: (id: string, x: number, y: number) => void;
  resizeWindow: (id: string, width: number, height: number) => void;

  // Desktop icons slice
  icons: DesktopIconEntity[];
  addIcon: (input: DesktopIconInput) => void;
  removeIcon: (id: string) => void;

  // FileSystem slice
  fsNodes: FSNode[];
  createFile: (name: string, content: string, parentId: string | null) => FileNode;
  createFolder: (name: string, parentId: string | null) => FolderNode;
  updateFile: (id: string, content: string) => void;
  deleteNode: (id: string) => void;

  // Theme slice
  theme: Theme;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

// ─── Store ───────────────────────────────────────────────────────────────────
export const useDesktopStore = create<DesktopState>()(
  persist(
    set => ({
      // ── Windows ──────────────────────────────────────────────────────────
      windows: [],

      openWindow: input => {
        const window = windowManager.open(input);
        set(state => ({ windows: [...state.windows, window] }));
      },

      closeWindow: id => {
        windowManager.close(id);
        set(state => ({ windows: state.windows.filter(w => w.id !== id) }));
      },

      minimizeWindow: id => {
        windowManager.minimize(id);
        set(state => ({
          windows: state.windows.map(w => (w.id === id ? { ...w, state: 'minimized' } : w)),
        }));
      },

      maximizeWindow: id => {
        windowManager.maximize(id);
        set(state => ({
          windows: state.windows.map(w => (w.id === id ? { ...w, state: 'maximized' } : w)),
        }));
      },

      restoreWindow: id => {
        windowManager.restore(id);
        set(state => ({
          windows: state.windows.map(w => (w.id === id ? { ...w, state: 'normal' } : w)),
        }));
      },

      focusWindow: id => {
        windowManager.focus(id);
        const updated = windowManager.getById(id);
        if (!updated) return;
        set(state => ({
          windows: state.windows.map(w => (w.id === id ? updated : w)),
        }));
      },

      moveWindow: (id, x, y) => {
        windowManager.move(id, x, y);
        set(state => ({
          windows: state.windows.map(w => (w.id === id ? { ...w, x, y } : w)),
        }));
      },

      resizeWindow: (id, width, height) => {
        windowManager.resize(id, width, height);
        set(state => ({
          windows: state.windows.map(w => (w.id === id ? { ...w, width, height } : w)),
        }));
      },

      // ── Desktop icons ─────────────────────────────────────────────────────
      icons: [],

      addIcon: input => {
        const icon = createDesktopIcon(input);
        set(state => ({ icons: [...state.icons, icon] }));
      },

      removeIcon: id => {
        set(state => ({ icons: state.icons.filter(i => i.id !== id) }));
      },

      // ── FileSystem ────────────────────────────────────────────────────────
      fsNodes: fileSystem.getRootNodes(),

      createFile: (name, content, parentId) => {
        const file = fileSystem.createFile(name, content, parentId);
        set({ fsNodes: fileSystem.getRootNodes() });
        return file;
      },

      createFolder: (name, parentId) => {
        const folder = fileSystem.createFolder(name, parentId);
        set({ fsNodes: fileSystem.getRootNodes() });
        return folder;
      },

      updateFile: (id, content) => {
        fileSystem.updateFile(id, content);
        set({ fsNodes: fileSystem.getRootNodes() });
      },

      deleteNode: id => {
        fileSystem.delete(id);
        set({ fsNodes: fileSystem.getRootNodes() });
      },

      // ── Theme ─────────────────────────────────────────────────────────────
      theme: themeProvider.getTheme(),

      setThemeMode: mode => {
        themeProvider.setMode(mode);
        set({ theme: themeProvider.getTheme() });
      },

      toggleTheme: () => {
        themeProvider.toggle();
        set({ theme: themeProvider.getTheme() });
      },
    }),
    {
      name: 'fran-desktop',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        windows: state.windows,
        icons: state.icons,
        theme: state.theme,
      }),
    },
  ),
);
