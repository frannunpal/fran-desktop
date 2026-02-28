# Architecture

This project is a virtual desktop in the browser, like those web-based desktop environments you might find on certain web services. The idea is simple: recreate the feeling of a real operating system inside Chrome or Firefox.

## The Tech Stack

Before diving into the details, here's what it's built with:

| Technology        | Why                                                                  |
| ----------------- | -------------------------------------------------------------------- |
| **React 18**      | What I know and works well                                           |
| **TypeScript**    | Window state is complex, types catch bugs before they hit production |
| **react-rnd**     | 170k weekly downloads. Handles all the drag and resize math          |
| **Zustand**       | State management without the boilerplate. We're happy with it        |
| **Mantine**       | Pretty Components Without a Designer                                 |
| **Framer Motion** | Animations that don't kill performance                               |

## Hexagonal Architecture (Ports & Adapters)

Yeah, I used hexagonal architecture. Not because it's strictly necessary for this particular project, but because one day I might want to port this to Vue or even native desktop, and with this structure I can do it without touching the business logic.

```
Domain (pure logic)
  ↓
Application (ports + use cases)
  ↓
Infrastructure (adapters: react-rnd, localStorage)
  ↓
Presentation (React components)
```

### Domain Layer (`src/Domain/`)

Pure business logic lives here. No external dependencies, no React, nothing. Just plain TypeScript.

- **Window.ts**: Factory for creating window entities
- **FileSystem.ts**: Factories for file system nodes (files and folders)
- **DesktopIcon.ts**: Factory for desktop icons

### Application Layer (`src/Application/`)

Contains the use cases. Each use case is an atomic operation:

- **OpenWindow/**: Opens a new window
- **CloseWindow/**: Closes a window
- **MinimizeWindow/**: Minimizes to taskbar
- **MoveWindow/**: Moves the window
- **ResizeWindow/**: Resizes the window
- **CreateDesktopIcon/**: Creates a desktop icon

### Infrastructure Layer (`src/Infrastructure/`)

The adapters that connect the real world with our logic:

- **WindowManagerAdapter.ts**: Implements `IWindowManager`. Manages the entire window lifecycle (open, close, minimize, maximize, focus, move, resize). Also handles the z-index strategy with alwaysOnTop.
- **LocalStorageFileSystem.ts**: Implements `IFileSystem`. Persists the file system to browser localStorage. Supports seeding from a manifest.
- **DefaultThemeProvider.ts**: Implements `IThemeProvider`. Manages light/dark themes.
- **MantineThemeAdapter.ts**: Converts our custom Theme object to the format Mantine expects.

### Presentation Layer (`src/Presentation/`)

This is where all the React stuff lives:

- **Components/**: UI components (Window, Taskbar, DesktopIcon, Apps, etc.)
  - **Taskbar/**: The bottom bar showing open windows and system controls
  - **TaskbarContextMenu/**: Right-click menu for taskbar items (window controls, exit)
  - **Launcher/**: Start menu / app launcher
  - **Window/**: Draggable, resizable window component using react-rnd
  - **DesktopIcon/**: Icons on the desktop that open apps
  - **Apps/**: Built-in applications (Files, Terminal, Settings, etc.)
- **Hooks/**: Custom hooks (useOpenApp, useClock, useSystemTheme...)
- **Store/**: The Zustand store (desktopStore.ts)

### Shared Layer (`src/Shared/`)

Code shared across all layers:

- **Interfaces/**: TypeScript contracts (IWindowManager, IFileSystem, AppEntry, etc.)
  - **IComponentProps.ts**: Props interfaces for all presentation components (TaskbarProps, TaskbarContextMenuProps, WindowProps, etc.)
- **Types/**: Utility types
- **Constants/**: Global constants (APPS, Colors, Icons, Animations)
- **Utils/**: Utility functions
- **Testing/**: Test utilities (mocks, helpers)

## Typical Data Flow

1. User **double clicks** on a desktop icon
2. The `DesktopIcon` component calls `useOpenApp()` with the app ID
3. `useOpenApp` looks up the app in the `APPS` registry (in `src/Shared/Constants/apps.ts`)
4. Generates a random position for the window
5. Calls `openWindow()` on the store (`desktopStore.ts`)
6. The store delegates to `WindowManagerAdapter` (in Application layer)
7. `WindowManagerAdapter` creates the `Window` entity with its unique z-index
8. Adds it to the windows array in the store
9. The `Window` component renders with the specific app's content

## State Management with Zustand

The main store (`desktopStore.ts`) is a Zustand store with persist middleware. Everything is saved to localStorage so when you close the tab and come back, everything is where you left it.

### State slices:

- **windows**: Array of all open windows
- **icons**: Desktop icons
- **fsNodes**: File system nodes
- **clipboard**: Clipboard content (copy/cut)
- **filesCurrentFolderId**: Current folder in Files app
- **contextMenu**: Context menu state
- **theme**: Current theme (light/dark)
- **notifications**: System notifications

## What's Saved to localStorage

| Key                       | What it saves                                  |
| ------------------------- | ---------------------------------------------- |
| `fran-desktop`            | Complete desktop state (windows, icons, theme) |
| `fran-desktop:filesystem` | Virtual file system                            |
| `fran-desktop:version`    | App version (for detecting updates)            |

Everything stays on your machine. No cookies, no servers, no tracking. Total privacy.

## Window Z-Index Strategy

Normal windows have sequential z-index: 1, 2, 3...
"Always on top" windows have an offset of +10000: 10001, 10002...

This guarantees they're always above normal ones, no matter how many normal windows are open.

## Next Step

Now that you know how the architecture works, check out [folder-structure.md](./folder-structure.md) to see how the code is organized on disk.

## Recent Changes

### Commit "TLC for taskbar part 1" (b84c2df)

Added tests and CSS for the Taskbar/Launcher components:

- **Launcher.test.tsx**: Added 3 new tests for panel behavior (close on outside click, close on Escape, stay open on inside click)
- **TaskbarContextMenu.module.css**: New CSS module with `.menuItem` class for menu item layout

### Working Directory Changes (uncommitted)

Enhanced TaskbarContextMenu with window state controls:

- **IComponentProps.ts**: Added `targetWindowState`, `onMinimizeWindow`, `onMaximizeWindow`, `onRestoreWindow` props
- **TaskbarContextMenu.tsx**: Added Minimize, Maximize, and Restore menu options based on window state. Removed "Pin window (coming soon)" placeholder
- **TaskbarContextMenu.stories.tsx**: Updated stories to reflect new props
- **TaskbarContextMenu.test.tsx**: Added 138 new lines of tests for the new functionality
- **Taskbar.tsx**: Minor additions (8 lines)
