# Hooks

Here's all the custom hooks in the project. Each one does a specific thing and they're meant to be reused across components.

## Available Hooks

### useOpenApp

The most important hook if you want to open an app. Returns a function that takes the app ID and optional additional data.

```typescript
const openApp = useOpenApp();

// Open with simple ID
openApp('notepad');

// Open with custom data
openApp('notepad', { contentData: { initialText: 'Hello!' } });
```

Looks up the app in the `APPS` registry, generates a random position for the window, and calls `openWindow` on the store.

**Location**: `src/Presentation/Hooks/useOpenApp.ts`

---

### useClock

Returns the current time formatted as HH:MM. Updates every second.

```typescript
const time = useClock(); // "14:35"
```

Useful for showing the clock in the taskbar.

**Location**: `src/Presentation/Hooks/useClock.ts`

---

### useSystemTheme

Automatically detects the OS theme (light/dark) and returns the current theme. Also allows changing it manually.

```typescript
const { theme, toggleTheme, setThemeMode } = useSystemTheme();
```

Listens to the browser's `prefers-color-scheme` event. If the user manually changes the theme, it saves that preference and stops following the system.

**Location**: `src/Presentation/Hooks/useSystemTheme.ts`

---

### useNotifications

Manages system notifications. Returns the notifications array and functions to add/remove.

```typescript
const { notifications, addNotification, removeNotification } = useNotifications();
```

Notifications appear somewhere in the UI and can be closed manually or automatically.

**Location**: `src/Presentation/Hooks/useNotifications.ts`

---

### useFcIcon

Dynamically loads an icon from `react-icons/fc` by name. Uses lazy loading to not load icons that aren't used.

```typescript
const IconComponent = useFcIcon('FcHome');
// Returns the component, use it like: <IconComponent size={24} />
```

**Location**: `src/Presentation/Hooks/useFcIcon.ts`

---

### useFcIconElement

Same as `useFcIcon` but returns the already rendered element instead of the component.

```tsx
const iconElement = useFcIconElement('FcHome', { size: 24 });
```

**Location**: Another export in `useFcIcon`.

---

### useContextMenu

Manages local context menus (right click). Returns the state and functions to open/close.

```typescript
const { opened, position, open, close } = useContextMenu();

const handleRightClick = (e: MouseEvent) => {
  e.preventDefault();
  open(e);
};
```

**Location**: `src/Presentation/Hooks/useContextMenu.ts`

---

### useAppVersion

When the app compiles, it generates a version.json, this hook compares the current app version.json with the one saved in localStorage. If there's changes, it merges the file system and shows a notification allowing the user to update the whole app.

```typescript
useAppVersion(); // Used in the root component, doesn't return anything useful
```

**Location**: `src/Presentation/Hooks/useAppVersion.ts`

---

### useWindowButtonRegistry

It's a Context Provider that stores the position of taskbar buttons. This enables smooth "flying" animations from the window to the button when minimizing.

```tsx
// In the Window component:
<WindowButtonRegistryProvider windowId={id}>
  <Window ... />
</WindowButtonRegistryProvider>
```

**Location**: `src/Presentation/Hooks/useWindowButtonRegistry.tsx`

---

## notifyReady (Not a Hook, But Important)

While not a hook, `notifyReady` is a callback passed to app components via `WindowContentProps`. Use it to communicate from your app to the window/menu bar:

```tsx
const MyApp: FC<WindowContentProps> = ({ window: win, notifyReady }) => {
  useEffect(() => {
    notifyReady?.({
      actions: { save: handleSave, open: handleOpen },
      isDirty,
      setPickerOpen: () => setPickerOpen(true),
    });
  }, [win, notifyReady, isDirty]);

  return <div>...</div>;
};
```

The menu bar builder reads these values from `window.contentData` to enable/disable items, call actions, etc.

---

## Example: How to Use a Hook

```tsx
import { useOpenApp } from '../Hooks/useOpenApp';

function MyComponent() {
  const openApp = useOpenApp();

  return <button onClick={() => openApp('calendar')}>Open Calendar</button>;
}
```

## Creating a New Hook

If you need to create a new hook:

1. Create the file in `src/Presentation/Hooks/myNewHook.ts`
2. Follow project conventions:
   - Name with `use` prefix (required in React)
   - Export the function directly
   - Add tests in `*.test.ts` or `*.test.tsx`
3. Document what it does in a comment (even if brief)

```typescript
// src/Presentation/Hooks/useMyNewHook.ts
import { useState, useCallback } from 'react';

export function useMyNewHook() {
  const [state, setState] = useState(null);

  const action = useCallback(() => {
    // does something
  }, []);

  return { state, action };
}
```

## Next Step

Know how to use the hooks? Now learn [how-to-create-an-app.md](./how-to-create-an-app.md) to create your own desktop app.
