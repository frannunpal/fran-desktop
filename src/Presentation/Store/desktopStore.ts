import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { WindowManagerAdapter } from '@infrastructure/Adapters/WindowManagerAdapter';
import { LocalStorageFileSystem } from '@infrastructure/Adapters/LocalStorageFileSystem';
import { DefaultThemeProvider } from '@infrastructure/Adapters/DefaultThemeProvider';
import { createDesktopIcon } from '@domain/Entities/DesktopIcon';
import type { DesktopState } from '@/Shared/Interfaces/IDesktopState';
import type { ThemeMode } from '@/Shared/Interfaces/IThemeProvider';
import { APPS } from '@shared/Constants/apps';
import { getFsInitStarted, setFsInitStarted } from './fsInitFlag';
export { resetFsInitFlag } from './fsInitFlag';

// ─── Adapters (singleton, not persisted) ────────────────────────────────────
const windowManager = new WindowManagerAdapter();
const fileSystem = new LocalStorageFileSystem();
export const clearFileSystem = () => fileSystem.clear();

const persistedMode = (() => {
  try {
    return (JSON.parse(localStorage.getItem('fran-desktop') ?? '{}')?.state?.theme?.mode ??
      null) as ThemeMode | null;
  } catch {
    return null;
  }
})();
const themeProvider = new DefaultThemeProvider(persistedMode ?? 'light');

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getDesktopFolderId = (): string | null => {
  const roots = fileSystem.getRootNodes();
  return roots.find(n => n.type === 'folder' && n.name === 'Desktop')?.id ?? null;
};

const ICON_COL_W = 80;
const ICON_ROW_H = 80;
const ICON_MARGIN = 20;

const nextFreeIconSlot = (icons: { x: number; y: number }[]): { x: number; y: number } => {
  const occupied = new Set(icons.map(ic => `${ic.x},${ic.y}`));
  for (let col = 0; ; col++) {
    const x = ICON_MARGIN + col * ICON_COL_W;
    for (let row = 0; row < 8; row++) {
      const y = ICON_MARGIN + row * ICON_ROW_H;
      if (!occupied.has(`${x},${y}`)) return { x, y };
    }
  }
};

// ─── Store ───────────────────────────────────────────────────────────────────
export const useDesktopStore = create<DesktopState>()(
  persist(
    (set, get) => ({
      // ── Windows ────────────────────────────────────────────────────────────
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

      // ── Desktop icons ───────────────────────────────────────────────────────
      icons: [],

      addIcon: input => {
        const icon = createDesktopIcon(input);
        set(state => ({ icons: [...state.icons, icon] }));
      },

      removeIcon: id => {
        set(state => ({ icons: state.icons.filter(i => i.id !== id) }));
      },

      // ── FileSystem ──────────────────────────────────────────────────────────
      fsNodes: fileSystem.getAllNodes(),
      desktopFolderId: getDesktopFolderId(),

      initFs: async () => {
        if (getFsInitStarted() || !fileSystem.isEmpty()) return;
        setFsInitStarted(true);
        try {
          const manifest = await fetch(`${import.meta.env.BASE_URL}fs-manifest.json`).then(r =>
            r.json(),
          );
          fileSystem.seed(manifest);
          set({ fsNodes: fileSystem.getAllNodes(), desktopFolderId: getDesktopFolderId() });

          // Seed app icons first so file icons don't overlap them
          const DESKTOP_APPS = ['notepad', 'terminal', 'files'];
          DESKTOP_APPS.forEach(appId => {
            const app = APPS.find(a => a.id === appId);
            if (!app) return;
            const alreadyAdded = get().icons.some(ic => ic.appId === appId);
            if (!alreadyAdded) {
              const pos = nextFreeIconSlot(get().icons);
              set(state => ({
                icons: [...state.icons, createDesktopIcon({ name: app.name, icon: app.icon, ...pos, appId })],
              }));
            }
          });

          // Sync Desktop/ files to desktop icons
          const desktopFolderId = getDesktopFolderId();
          if (!desktopFolderId) return;
          const desktopFiles = fileSystem.getChildren(desktopFolderId);
          desktopFiles.forEach(node => {
            if (node.type !== 'file') return;
            const alreadyOnDesktop = get().icons.some(ic => ic.name === node.name);
            if (!alreadyOnDesktop) {
              const pos = nextFreeIconSlot(get().icons);
              const icon = createDesktopIcon({
                name: node.name,
                icon: '📄',
                ...pos,
                appId: node.mimeType === 'application/pdf' ? 'pdf' : 'files',
                nodeId: node.id,
              });
              set(state => ({ icons: [...state.icons, icon] }));
            }
          });
        } catch {
          setFsInitStarted(false); // allow retry on network error
        }
      },

      createFile: (name, content, parentId) => {
        const file = fileSystem.createFile(name, content, parentId);
        set({ fsNodes: fileSystem.getAllNodes() });

        // Sync to desktop if file is in Desktop folder
        const desktopFolderId = getDesktopFolderId();
        if (parentId && parentId === desktopFolderId) {
          const { icons } = get();
          if (!icons.some(ic => ic.name === file.name)) {
            const pos = nextFreeIconSlot(icons);
            const icon = createDesktopIcon({
              name: file.name,
              icon: '📄',
              ...pos,
              appId: file.mimeType === 'application/pdf' ? 'pdf' : 'files',
              nodeId: file.id,
            });
            set(state => ({ icons: [...state.icons, icon] }));
          }
        }

        return file;
      },

      createFolder: (name, parentId, iconName, iconColor) => {
        const folder = fileSystem.createFolder(name, parentId, iconName, iconColor);
        set({ fsNodes: fileSystem.getAllNodes() });

        // Sync to desktop if folder is in Desktop/
        const desktopFolderId = getDesktopFolderId();
        if (parentId && parentId === desktopFolderId) {
          const { icons } = get();
          if (!icons.some(ic => ic.name === folder.name)) {
            const pos = nextFreeIconSlot(icons);
            const icon = createDesktopIcon({
              name: folder.name,
              icon: '📁',
              ...pos,
              appId: 'files',
              nodeId: folder.id,
            });
            set(state => ({ icons: [...state.icons, icon] }));
          }
        }

        return folder;
      },

      updateFile: (id, content) => {
        fileSystem.updateFile(id, content);
        set({ fsNodes: fileSystem.getAllNodes() });
      },

      deleteNode: id => {
        const node = fileSystem.getNode(id);
        fileSystem.delete(id);
        set({ fsNodes: fileSystem.getAllNodes() });

        // Remove desktop icon if deleted node was in Desktop/
        if (node?.type === 'file' || node?.type === 'folder') {
          const desktopFolderId = getDesktopFolderId();
          if (node.parentId && node.parentId === desktopFolderId) {
            set(state => ({
              icons: state.icons.filter(ic => ic.name !== node.name),
            }));
          }
        }
      },

      // ── Files app ───────────────────────────────────────────────────────────
      filesCurrentFolderId: null,

      setFilesCurrentFolderId: (id) => {
        set({ filesCurrentFolderId: id });
      },

      // ── Context menu ────────────────────────────────────────────────────────
      contextMenu: { x: 0, y: 0, owner: null },

      openContextMenu: (x, y, owner, targetNodeId) => {
        set({ contextMenu: { x, y, owner, targetNodeId } });
      },

      closeContextMenu: () => {
        set({ contextMenu: { x: 0, y: 0, owner: null, targetNodeId: undefined } });
      },

      // ── Theme ───────────────────────────────────────────────────────────────
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
