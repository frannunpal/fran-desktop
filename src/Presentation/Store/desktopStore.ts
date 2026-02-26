import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { WindowManagerAdapter } from '@infrastructure/Adapters/WindowManagerAdapter';
import { LocalStorageFileSystem } from '@infrastructure/Adapters/LocalStorageFileSystem';
import { DefaultThemeProvider } from '@infrastructure/Adapters/DefaultThemeProvider';
import { createDesktopIcon } from '@domain/Entities/DesktopIcon';
import type { DesktopState } from '@shared/Interfaces/DesktopState';
import type { ThemeMode } from '@application/Ports/IThemeProvider';
import { APPS } from '@shared/Constants/apps';

// ─── Adapters (singleton, not persisted) ────────────────────────────────────
const windowManager = new WindowManagerAdapter();
const fileSystem = new LocalStorageFileSystem();

const persistedMode = (() => {
  try {
    return (JSON.parse(localStorage.getItem('fran-desktop') ?? '{}')?.state?.theme?.mode ??
      null) as ThemeMode | null;
  } catch {
    return null;
  }
})();
const themeProvider = new DefaultThemeProvider(persistedMode ?? 'light');

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
      themeSetManually: persistedMode !== null,

      setThemeMode: mode => {
        themeProvider.setMode(mode);
        set({ theme: themeProvider.getTheme() });
      },

      toggleTheme: () => {
        themeProvider.toggle();
        set({ theme: themeProvider.getTheme(), themeSetManually: true });
      },
    }),
    {
      name: 'fran-desktop',
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({
        windows: state.windows,
        icons: state.icons,
        theme: state.theme,
        themeSetManually: state.themeSetManually,
      }),
      merge: (persisted, current) => {
        const p = persisted as Partial<DesktopState>;
        return {
          ...current,
          ...p,
          windows: (p.windows ?? []).map(w => {
            const app = APPS.find(a => a.id === w.content);
            return {
              ...w,
              icon: w.icon ?? app?.icon,
              fcIcon: w.fcIcon ?? app?.fcIcon,
              canMaximize: app?.canMaximize,
            };
          }),
        };
      },
    },
  ),
);
