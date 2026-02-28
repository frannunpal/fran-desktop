import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { WindowManagerAdapter } from '@infrastructure/Adapters/WindowManagerAdapter';
import { LocalStorageFileSystem } from '@infrastructure/Adapters/LocalStorageFileSystem';
import { DefaultThemeProvider } from '@infrastructure/Adapters/DefaultThemeProvider';
import { createDesktopIcon } from '@domain/Entities/DesktopIcon';
import type { DesktopState, NotificationItem } from '@/Shared/Interfaces/IDesktopState';
import type { ThemeMode } from '@/Shared/Interfaces/IThemeProvider';
import { APPS } from '@shared/Constants/apps';
import { getAppIdForMime } from '@/Shared/Utils/getAppIdForMime';
import { getFsInitStarted, setFsInitStarted } from './fsInitFlag';
export { resetFsInitFlag } from './fsInitFlag';

// ─── Adapters (singleton, not persisted) ────────────────────────────────────
const windowManager = new WindowManagerAdapter();
const fileSystem = new LocalStorageFileSystem();
export const clearFileSystem = () => fileSystem.clear();
export const resetWindowManager = () => windowManager.reset();

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

type DesktopIconEntity = ReturnType<typeof createDesktopIcon>;
type DesktopIconInput = Omit<Parameters<typeof createDesktopIcon>[0], 'x' | 'y'>;

/**
 * Pure helper: returns a new icons array with one icon appended at the next
 * free grid slot. Does not call `set` directly — call sites decide when to
 * commit to the store, keeping the helper testable and side-effect free.
 */
const appendDesktopIcon = (
  current: DesktopIconEntity[],
  input: DesktopIconInput,
): DesktopIconEntity[] => {
  const pos = nextFreeIconSlot(current);
  return [...current, createDesktopIcon({ ...input, ...pos })];
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
          const DESKTOP_APPS = ['notepad', 'terminal', 'files', 'storybook'];
          DESKTOP_APPS.forEach(appId => {
            const app = APPS.find(a => a.id === appId);
            if (!app) return;
            if (!get().icons.some(ic => ic.appId === appId)) {
              set({
                icons: appendDesktopIcon(get().icons, { name: app.name, icon: app.icon, appId }),
              });
            }
          });

          // Sync Desktop/ files to desktop icons
          const desktopFolderId = getDesktopFolderId();
          if (!desktopFolderId) return;
          const desktopFiles = fileSystem.getChildren(desktopFolderId);
          desktopFiles.forEach(node => {
            if (node.type !== 'file') return;
            if (!get().icons.some(ic => ic.name === node.name)) {
              set({
                icons: appendDesktopIcon(get().icons, {
                  name: node.name,
                  icon: '📄',
                  appId: getAppIdForMime(node.mimeType),
                  nodeId: node.id,
                }),
              });
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
            set({
              icons: appendDesktopIcon(icons, {
                name: file.name,
                icon: '📄',
                appId: getAppIdForMime(file.mimeType),
                nodeId: file.id,
              }),
            });
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
            set({
              icons: appendDesktopIcon(icons, {
                name: folder.name,
                icon: '📁',
                iconName: folder.iconName,
                iconColor: folder.iconColor,
                appId: 'files',
                nodeId: folder.id,
              }),
            });
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

      moveNode: (id, newParentId) => {
        fileSystem.move(id, newParentId);
        set({ fsNodes: fileSystem.getAllNodes() });
      },

      // ── Clipboard ────────────────────────────────────────────────────────────
      clipboard: { content: [], action: null },

      copyToClipboard: nodes => {
        set({ clipboard: { content: nodes, action: 'copy' } });
      },

      cutToClipboard: nodes => {
        set({ clipboard: { content: nodes, action: 'cut' } });
      },

      clearClipboard: () => {
        set({ clipboard: { content: [], action: null } });
      },

      // ── Files app ───────────────────────────────────────────────────────────
      filesCurrentFolderId: null,

      setFilesCurrentFolderId: id => {
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

      // ── Update ──────────────────────────────────────────────────────────────
      mergeSeed: manifest => {
        fileSystem.mergeSeed(manifest);
        set({ fsNodes: fileSystem.getAllNodes(), desktopFolderId: getDesktopFolderId() });
      },

      mergeDesktopApps: appIds => {
        for (const appId of appIds) {
          const app = APPS.find(a => a.id === appId);
          if (!app) continue;
          if (get().icons.some(ic => ic.appId === appId)) continue;
          set({ icons: appendDesktopIcon(get().icons, { name: app.name, icon: app.icon, appId }) });
        }
        const desktopFolderId = getDesktopFolderId();
        if (!desktopFolderId) return;
        for (const node of fileSystem.getChildren(desktopFolderId)) {
          if (node.type !== 'file') continue;
          if (get().icons.some(ic => ic.name === node.name)) continue;
          set({
            icons: appendDesktopIcon(get().icons, {
              name: node.name,
              icon: '📄',
              appId: getAppIdForMime(node.mimeType),
              nodeId: node.id,
            }),
          });
        }
      },

      // ── Notifications ────────────────────────────────────────────────────────
      notifications: [] as NotificationItem[],

      addNotification: item => {
        set(state => ({ notifications: [...state.notifications, item] }));
      },

      removeNotification: id => {
        set(state => ({ notifications: state.notifications.filter(n => n.id !== id) }));
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
