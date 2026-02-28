# Folder Structure

Here's the complete breakdown of how the project is organized. You should be able to find anything without getting lost.

## Overview

```
src/
├── Application/           # Use cases (business logic)
├── Domain/                # Pure entities (no dependencies)
├── Infrastructure/        # External adapters
├── Presentation/          # UI layer (React)
│   ├── Components/        # React components
│   ├── Hooks/            # Custom hooks
│   ├── Store/            # Zustand store
│   └── Utils/            # Presentation utilities
├── Shared/                # Shared code
│   ├── Constants/         # Global constants
│   ├── Interfaces/        # TypeScript contracts
│   ├── Styles/           # Global CSS
│   ├── Testing/          # Test utilities
│   ├── Types/            # Utility types
│   └── Utils/            # Utility functions
├── App.tsx                # Root component
├── main.tsx               # React entry point
└── index.css              # Global styles
```

## Domain Layer (`src/Domain/`)

Pure business logic. No React, no state management, nothing. Just functions that create entities.

```
Domain/
├── Entities/
│   ├── DesktopIcon.ts      # Factory for DesktopIconEntity
│   ├── FileSystem.ts       # Factories for FileNode and FolderNode
│   └── Window.ts           # Factory for WindowEntity
└── index.ts               # Public exports
```

## Application Layer (`src/Application/`)

Use cases. Each folder is an atomic operation.

```
Application/
└── UseCases/
    ├── CloseWindow/        # Logic for closing windows
    ├── CreateDesktopIcon/ # Logic for creating icons
    ├── MinimizeWindow/     # Logic for minimizing
    ├── MoveWindow/        # Logic for moving
    ├── OpenWindow/        # Logic for opening
    └── ResizeWindow/      # Logic for resizing
```

## Infrastructure Layer (`src/Infrastructure/`)

Adapters that connect to the outside world (localStorage, browser, etc).

```
Infrastructure/
└── Adapters/
    ├── DefaultThemeProvider.ts   # Theme provider
    ├── LocalStorageFileSystem.ts # FS persistence
    ├── MantineThemeAdapter.ts    # Mantine adapter
    └── WindowManagerAdapter.ts   # Window manager
```

## Presentation Layer (`src/Presentation/`)

```
Presentation/
├── Components/
│ ├── Apps/ # Desktop apps
│ │ ├── CalendarApp/ # Calendar app
│ │ ├── FilesApp/ # File explorer
│ │ ├── PdfApp/ # PDF viewer
│ │ └── StorybookApp/ # Storybook viewer
│ ├── ContextMenu/ # Context menu
│ ├── DesktopArea/ # Main desktop area
│ ├── DesktopIcon/ # Desktop icons
│ ├── Launcher/ # Start menu
│ ├── Shared/ # Reusable components
│ │ ├── AppIcon/ # App icon
│ │ ├── CreateItemApp/ # Create files/folders
│ │ └── IconColorPicker/ # Color picker
│ ├── SystemTray/ # System tray
│ ├── Taskbar/ # Taskbar
│ ├── TaskbarContextMenu/ # Taskbar menu
│ └── Window/ # Window component
│
├── Hooks/ # Custom hooks (full list below)
│
├── Store/
│ ├── desktopStore.ts # Main Zustand store
│ └── fsInitFlag.ts # FS init flag
│
└── Utils/
└── (presentation utilities)
```

## Shared Layer (`src/Shared/`)

Code used across multiple layers. Types, interfaces, constants, utilities.

```

Shared/
├── Constants/
│ ├── apps.ts # Available apps registry
│ ├── Animations.ts # Framer Motion variants
│ ├── Colors.ts # Color palette
│ └── Icons.ts # Icon mappings
│
├── Interfaces/
│ ├── AppEntry.ts # App interface
│ ├── DesktopIconEntity.ts # Desktop icon
│ ├── FileNode.ts # File node
│ ├── FolderNode.ts # Folder node
│ ├── FileSystemNode.ts # Base FS node
│ ├── IDesktopState.ts # Complete desktop state
│ ├── IFileSystem.ts # File system interface
│ ├── IWindowManager.ts # Window manager interface
│ ├── IThemeProvider.ts # Theme provider interface
│ ├── WindowEntity.ts # Window entity
│ └── ... (others)
│
├── Styles/
│ └── variables.css # Global CSS variables
│
├── Testing/
│ ├── **mocks**/ # Global mocks
│ │ ├── framer-motion.mock.tsx
│ │ ├── jsdom-setup.ts
│ │ ├── localStorage.mock.ts
│ │ └── react-rnd.mock.tsx
│ └── Utils/
│ ├── makeWindow.ts # Helper for creating windows in tests
│ ├── makeWindowInput.ts # Input for creating windows
│ ├── resetDesktopStore.ts # Store reset for tests
│ └── renderWithMantine.tsx # Render with Mantine provider
│
├── Types/
│ ├── DesktopIconTypes.ts
│ ├── FileSystemTypes.ts
│ └── WindowTypes.ts
│
└── Utils/
├── getFileExtension.ts
└── sortNodes.ts

```

## Where to Find Common Things

| What you're looking for | Where it is |
|-------------------------|-------------|
| How to register a new app | `src/Shared/Constants/apps.ts` |
| The main store | `src/Presentation/Store/desktopStore.ts` |
| Window component | `src/Presentation/Components/Window/Window.tsx` |
| Hook for opening apps | `src/Presentation/Hooks/useOpenApp.ts` |
| Theme (colors) | `src/Infrastructure/Adapters/DefaultThemeProvider.ts` |
| File system | `src/Infrastructure/Adapters/LocalStorageFileSystem.ts` |
| Window types | `src/Shared/Interfaces/WindowEntity.ts` |
| Global styles | `src/index.css` and `src/Shared/Styles/variables.css` |

## Important Root Files

| File | What it's for |
|------|---------------|
| `vite.config.ts` | Vite config |
| `tsconfig.json` | TypeScript config |
| `vitest.config.ts` | Vitest config (tests) |
| `.storybook/` | Storybook config |
| `eslint.config.js` | ESLint config |
| `.prettierrc` | Prettier config |

## Next Step

Now that you know where everything is, check out [hooks.md](./hooks.md) to see all available hooks and what each one does.
```
