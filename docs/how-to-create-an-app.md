# How to Create an App

Want to add your own application to the desktop? Great, it's easier than you think. This document walks you through creating a new app step by step.

## The Complete Flow

Creating an app has five steps:

1. **Register the app** in `src/Shared/Constants/apps.ts`
2. **Create the component** in `src/Presentation/Components/Apps/` using `WindowContentProps`
3. **Register in AppRegistry** to connect your component and menu bar
4. **(Optional but recommended) Add tests and stories**

Let's see each in detail.

## Step 1: Register the App

Open `src/Shared/Constants/apps.ts` and add your app to the `APPS` array. Each entry looks like this:

```typescript
{
  id: 'my-app',              // Unique ID
  name: 'My App',           // Display name
  icon: '🎮',               // Emoji icon (used as fallback)
  fcIcon: 'FcGamepad',      // react-icons/fc icon name
  defaultWidth: 600,        // Default window width
  defaultHeight: 400,       // Default window height
  minWidth: 300,            // Minimum width
  minHeight: 200,           // Minimum height
  canMaximize: true,        // Whether it can be maximized
  alwaysOnTop: false,       // Whether it stays above others
}
```

### Where to Find Icons

The `fcIcon` icons come from `react-icons/fc`. You have hundreds of them. Find one you like at [react-icons](https://react-icons.github.io/react-icons/icons/fc/).

## Step 2: Create the Component

Create a new folder in `src/Presentation/Components/Apps/`. For example, for an app called "MyApp":

```
src/Presentation/Components/Apps/MyApp/
├── MyApp.tsx              # Main component (receives WindowContentProps)
├── MyApp.module.css       # Styles (optional)
├── MyApp.test.tsx         # Tests (optional but recommended)
├── MyApp.stories.tsx      # Storybook (optional)
└── buildMyAppMenuBar.tsx  # Menu bar builder (optional)
```

### Basic Component Structure with WindowContentProps

```tsx
// src/Presentation/Components/Apps/MyApp/MyApp.tsx
import { type FC, useEffect, useState } from 'react';
import type { WindowContentProps } from '@/Shared/Interfaces/IWindowContentProps';
import classes from './MyApp.module.css';

const MyApp: FC<WindowContentProps> = ({ window: win, notifyReady }) => {
  // Read initial data from window.contentData (passed when opening the app)
  const initialData = win?.contentData as { initialValue?: string } | undefined;
  const [state, setState] = useState(initialData?.initialValue ?? '');

  // Use notifyReady to push data back to the window (for menu bar, etc.)
  useEffect(() => {
    notifyReady?.({
      ...(win?.contentData ?? {}),
      // Expose actions or state that the menu bar might need
    });
  }, [win, notifyReady]);

  return (
    <div className={classes.container} data-windowid={win?.id}>
      <h1>Hello from My App!</h1>
      <p>Current state: {state}</p>
    </div>
  );
};

export default MyApp;
```

### WindowContentProps API

| Prop          | Type                                              | Description                                     |
| ------------- | ------------------------------------------------- | ----------------------------------------------- |
| `window`      | `WindowEntity \| undefined`                       | The window entity with metadata and contentData |
| `notifyReady` | `(contentData?: Record<string, unknown>) => void` | Callback to push data back to the window        |

The `window` object contains:

- `window.id` - unique window identifier
- `window.content` - app ID (e.g., 'my-app')
- `window.contentData` - data passed when opening the app
- `window.title`, `window.fcIcon`, etc.

### How to Receive Parameters

When you open an app with `openApp('my-app', { contentData: {...} })`, the data arrives in `window.contentData`:

```tsx
const MyApp: FC<WindowContentProps> = ({ window: win, notifyReady }) => {
  const contentData = win?.contentData as { initialValue?: string } | undefined;
  const initialValue = contentData?.initialValue;
  // ...
};
```

## Step 3: Register in AppRegistry

After creating your component, register it in `src/Presentation/Components/Window/AppRegistry.tsx`:

```tsx
// In AppRegistry.tsx
import MyApp from '@presentation/Components/Apps/MyApp/MyApp';

const registry: Record<string, AppRegistryEntry> = {
  // ...existing apps...

  'my-app': {
    component: MyApp,
    // buildMenuBar: buildMyAppMenuBarFn, // Optional: if you have a menu bar
  },
};
```

If your app needs a menu bar, see the next section.

## Step 4: (Optional) Tests

If you want your app to have tests, here's a template:

```tsx
// src/Presentation/Components/Apps/MyApp/MyApp.test.tsx
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import MyApp from './MyApp';
import { renderWithMantine } from '@/Shared/Testing/Utils/renderWithMantine';

const wrapper = renderWithMantine();

describe('MyApp', () => {
  const mockNotifyReady = vi.fn();
  const mockWindow = {
    id: 'win-1',
    contentData: { initialValue: 'test' },
  } as any;

  beforeEach(() => {
    mockNotifyReady.mockClear();
  });

  it('renders without crashing', () => {
    render(<MyApp window={mockWindow} notifyReady={mockNotifyReady} />, { wrapper });
    expect(screen.getByText(/hello/i)).toBeInTheDocument();
  });

  it('accepts initial value from contentData', () => {
    render(<MyApp window={mockWindow} notifyReady={mockNotifyReady} />, { wrapper });
    expect(screen.getByText(/test/i)).toBeInTheDocument();
  });

  it('calls notifyReady on mount', () => {
    render(<MyApp window={mockWindow} notifyReady={mockNotifyReady} />, { wrapper });
    expect(mockNotifyReady).toHaveBeenCalled();
  });
});
```

## How to Open Your App

Once registered, you can open it from anywhere using the `useOpenApp` hook:

```tsx
const openApp = useOpenApp();

openApp('my-app'); // Open with defaults
openApp('my-app', {
  contentData: { initialValue: 'hello' }, // With data
});
```

## Things You Can Do in Your App

- **Access the store**: `useDesktopStore(state => state.windows)`
- **Manipulate files**: `useDesktopStore(state => state.createFile(...))`
- **Show notifications**: `useNotifications()`
- **Use icons**: `useFcIcon('FcHome')`
- **Communicate with window**: Call `notifyReady` to push actions/state

## How to Add a Menu Bar

Windows can have a menu bar at the top with dropdown menus, switches, sliders, comboboxes, and text inputs. This is powered by the `AppMenuBar` component.

### Step 1: Define the Menu Elements (Pure Function)

Create a file `buildMyAppMenuBar.tsx` with a pure function that returns the menu configuration:

```tsx
// src/Presentation/Components/Apps/MyApp/buildMyAppMenuBar.tsx
import type { AppMenuElement } from '@/Shared/Interfaces/IAppMenuElement';

export const buildMyAppMenuBar = (
  onOpen: () => void,
  onSave: () => void,
  onExit: () => void,
  isDirty: boolean = false,
): AppMenuElement[] => [
  {
    type: 'menu',
    label: 'File',
    icon: 'FcFile',
    items: [
      { type: 'item', label: 'Open', icon: 'FcPlus', onClick: onOpen },
      { type: 'item', label: 'Save', icon: 'FcSave', onClick: onSave, disabled: !isDirty },
      { type: 'divider' },
      { type: 'item', label: 'Exit', icon: 'FcClose', onClick: onExit },
    ],
  },
];
```

### Step 2: Register the Menu Bar Builder in AppRegistry

In `AppRegistry.tsx`, wrap the pure function to access the window's contentData:

```tsx
// In AppRegistry.tsx
import { buildMyAppMenuBar } from '@presentation/Components/Apps/MyApp/buildMyAppMenuBar';

const buildMyAppMenuBarFn: MenuBarBuilder = (window: WindowEntity) => {
  const closeWindow = useDesktopStore.getState().closeWindow;

  // Read data pushed by the app via notifyReady
  const isDirty = window.contentData?.isDirty as boolean | undefined;
  const setPickerOpen = window.contentData?.setPickerOpen as (() => void) | undefined;

  return buildMyAppMenuBar(
    () => setPickerOpen?.(), // Open file picker
    () => {}, // Save action
    () => closeWindow(window.id), // Exit
    isDirty ?? false,
  );
};

const registry: Record<string, AppRegistryEntry> = {
  'my-app': {
    component: MyApp,
    buildMenuBar: buildMyAppMenuBarFn,
  },
};
```

### Step 3: Use notifyReady in Your Component

Push the data the menu bar needs from your component:

```tsx
const MyApp: FC<WindowContentProps> = ({ window: win, notifyReady }) => {
  const [isDirty, setIsDirty] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    notifyReady?.({
      ...(win?.contentData ?? {}),
      isDirty,
      setPickerOpen: () => setPickerOpen(true),
    });
  }, [win, notifyReady, isDirty]);

  // ... rest of component
};
```

### Menu Item Types

| Type                                                 | Description          |
| ---------------------------------------------------- | -------------------- |
| `{ type: 'item', label, icon?, onClick, disabled? }` | Clickable menu item  |
| `{ type: 'divider' }`                                | Horizontal separator |

### Element Types Summary

| Type         | Props                                       |
| ------------ | ------------------------------------------- |
| `menu`       | `label`, `icon?`, `items[]`                 |
| `combobox`   | `label?`, `options[]`, `value`, `onChange`  |
| `switch`     | `label`, `checked`, `onChange`              |
| `slider`     | `label?`, `min`, `max`, `value`, `onChange` |
| `text-input` | `placeholder?`, `value`, `onChange`         |

### Icons

Use `react-icons/fc` icon names (e.g., `'FcFile'`, `'FcPlus'`, `'FcSearch'`). Find more at [react-icons](https://react-icons.github.io/react-icons/icons/fc/).

### Real Example

Check `src/Presentation/Components/Window/Window.stories.tsx` for complete examples with all element types (`WithMenuBar` and `WithMenuBarAllTypes` stories).

## Advanced: notifyReady Pattern

The `notifyReady` callback is the key to communication between your app and the window. Use it to:

1. **Expose actions** to the menu bar (save, open, etc.)
2. **Push state** that affects menu items (isDirty, currentView, etc.)
3. **Expose callbacks** to open modals from outside (file picker, save dialog)

```tsx
useEffect(() => {
  notifyReady?.({
    ...(win?.contentData ?? {}),
    actions: {
      new: handleNew,
      save: handleSave,
      saveAs: handleSaveAs,
    },
    isDirty,
    setPickerOpen: () => setPickerOpen(true),
    // Any other data the window/menu bar needs
  });
}, [win, notifyReady /* dependencies */]);
```

The menu bar builder then reads these values from `window.contentData`.

## Next Step

Got your app created? Then learn [testing.md](./testing.md) to know how to test all this properly.
