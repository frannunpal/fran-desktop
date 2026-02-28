# How to Add a Menu Bar and File Picker to an App

So you've got an app and you want to give it a proper menu bar at the top — with a "File > Open" that pops up a file picker inside the window. This is exactly what `ImageViewerApp` does, and this document walks you through the same steps so you can do it in your own app.

## What We're Building

- A **menu bar** rendered at the top of the window (File > Open, File > Exit)
- A **file picker modal** that opens *inside* the window (not in a portal floating outside it)
- A clean separation so the menu bar builder is its own exported function

## The Files Involved

```
YourApp/
├── YourApp.tsx                  # Main component — receives pickerOpen/onPickerClose props
├── buildYourAppMenuBar.tsx      # Pure function that builds the AppMenuElement[] array
└── YourApp.test.tsx             # Tests for both
```

And from shared:

```
src/Presentation/Components/Shared/FilePickerApp/
└── FilePickerApp.tsx            # Exports FilePickerModal — drop it anywhere
```

---

## Step 1: Extract the Menu Bar Builder

The menu bar configuration is a pure function — no hooks, no state. Keep it in its own file so it can be imported both by the component and by `App.tsx` (which passes it to `<Window>`).

```tsx
// src/Presentation/Components/Apps/YourApp/buildYourAppMenuBar.tsx
import type { AppMenuElement } from '@/Shared/Interfaces/IAppMenuElement';

export const buildYourAppMenuBar = (
  onOpenPicker: () => void,
  onExit: () => void,
): AppMenuElement[] => [
  {
    type: 'menu',
    label: 'File',
    items: [
      { type: 'item', label: 'Open', icon: 'FcOpenedFolder', onClick: onOpenPicker },
      { type: 'divider' },
      { type: 'item', label: 'Exit', icon: 'FcLeft', onClick: onExit },
    ],
  },
];
```

That's it. No component, no React, just data.

---

## Step 2: Update Your App Component

Your component needs two new props: `pickerOpen` (controlled from outside) and `onPickerClose` (callback to close it). The internal image/file src is managed with `useState`.

```tsx
// src/Presentation/Components/Apps/YourApp/YourApp.tsx
import { type FC, useState } from 'react';
import { FilePickerModal } from '@presentation/Components/Shared/FilePickerApp/FilePickerApp';
import type { FileNode } from '@/Shared/Interfaces/FileNode';
import classes from './YourApp.module.css';

export interface YourAppProps {
  src?: string;
  windowId?: string;
  pickerOpen?: boolean;
  onPickerClose?: () => void;
}

const YourApp: FC<YourAppProps> = ({
  src: initialSrc,
  windowId,
  pickerOpen = false,
  onPickerClose,
}) => {
  const [src, setSrc] = useState(initialSrc);

  const handleFileSelected = (node: FileNode) => {
    setSrc(node.url ?? node.name);
    onPickerClose?.();
  };

  return (
    <div className={classes.container} data-windowid={windowId}>
      {/* your app content here */}

      <FilePickerModal
        opened={pickerOpen}
        acceptedMimeTypes={['image/*']}  // adjust to your needs
        onConfirm={handleFileSelected}
        onCancel={() => onPickerClose?.()}
      />
    </div>
  );
};

export default YourApp;
```

### Important: `position: relative` on the container

`FilePickerModal` renders as an `position: absolute; inset: 0` overlay — it fills its nearest positioned ancestor. Your container **must** have `position: relative` in its CSS, otherwise the overlay will escape the window.

```css
/* YourApp.module.css */
.container {
  position: relative; /* required for FilePickerModal overlay */
  width: 100%;
  height: 100%;
}
```

---

## Step 3: Wire It Up in App.tsx

The menu bar lives at the `<Window>` level (not inside the app), so `App.tsx` is where the two meet. You need one piece of state to track which window has the picker open — using the window ID instead of a boolean lets you support multiple instances of the same app simultaneously.

```tsx
// src/App.tsx
import YourApp from '@/Presentation/Components/Apps/YourApp/YourApp';
import { buildYourAppMenuBar } from '@/Presentation/Components/Apps/YourApp/buildYourAppMenuBar';

// Inside the App component:
const [pickerOpenId, setPickerOpenId] = useState<string | null>(null);

// Inside the windows.map():
<Window
  key={win.id}
  window={win}
  menuBar={
    win.content === 'your-app'
      ? buildYourAppMenuBar(
          () => setPickerOpenId(win.id),   // File > Open
          () => closeWindow(win.id),        // File > Exit
        )
      : undefined
  }
>
  {win.content === 'your-app' && (
    <YourApp
      src={win.contentData?.src as string | undefined}
      windowId={win.id}
      pickerOpen={pickerOpenId === win.id}
      onPickerClose={() => setPickerOpenId(null)}
    />
  )}
</Window>
```

Why `pickerOpenId === win.id` and not just a boolean? Because if the user has two `YourApp` windows open, each one needs its own picker state. This way only one is open at a time, and they don't interfere.

---

## Step 4: Tests

Test the component and the menu bar builder separately. The component gets a mocked store, the builder is just a pure function.

```tsx
// YourApp.test.tsx
const mockStore = { fsNodes: [/* your test nodes */] };

vi.mock('@presentation/Store/desktopStore', () => ({
  useDesktopStore: (selector) => selector(mockStore),
}));

const { default: YourApp } = await import('./YourApp');

// Component tests
it('should show the picker modal when pickerOpen is true', () => {
  render(<YourApp pickerOpen={true} onPickerClose={vi.fn()} />, { wrapper });
  expect(screen.getByRole('dialog', { name: 'Open file' })).toBeInTheDocument();
});

it('should call onPickerClose when Cancel is clicked', () => {
  const onPickerClose = vi.fn();
  render(<YourApp pickerOpen={true} onPickerClose={onPickerClose} />, { wrapper });
  fireEvent.click(screen.getByLabelText('Cancel'));
  expect(onPickerClose).toHaveBeenCalledOnce();
});

// Menu bar tests (import directly — no mocks needed)
import { buildYourAppMenuBar } from './buildYourAppMenuBar';

it('should export a File menu', () => {
  const menuBar = buildYourAppMenuBar(vi.fn(), vi.fn());
  expect(menuBar[0]).toMatchObject({ type: 'menu', label: 'File' });
});

it('should call onOpenPicker when Open is clicked', () => {
  const onOpen = vi.fn();
  const menuBar = buildYourAppMenuBar(onOpen, vi.fn());
  const items = (menuBar[0] as { items: Array<{ type: string; label?: string; onClick?: () => void }> }).items;
  items.find(i => i.label === 'Open')?.onClick?.();
  expect(onOpen).toHaveBeenCalledOnce();
});
```

See `ImageViewerApp.test.tsx` for the full working example.

---

## Step 5: Storybook (optional but nice)

To show the app with the picker already open in a story, seed the store with some test nodes and wrap everything in `WindowButtonRegistryProvider` + `<Window>`:

```tsx
// YourApp.stories.tsx
import { useEffect } from 'react';
import { useDesktopStore } from '@presentation/Store/desktopStore';
import { WindowButtonRegistryProvider } from '@presentation/Hooks/useWindowButtonRegistry';
import Window from '@presentation/Components/Window/Window';
import { makeWindow } from '@/Shared/Testing/Utils/makeWindow';
import { buildYourAppMenuBar } from './buildYourAppMenuBar';
import YourApp from './YourApp';

const win = makeWindow({ id: 'win-your-app', title: 'Your App', fcIcon: 'FcPicture', width: 700, height: 520 });

const YourAppWithPickerOpen = () => {
  useEffect(() => {
    useDesktopStore.setState({ fsNodes: [/* seed nodes */], windows: [win] });
  }, []);

  return (
    <WindowButtonRegistryProvider>
      <div style={{ position: 'relative', width: 700, height: 520 }}>
        <Window window={win} menuBar={buildYourAppMenuBar(() => {}, () => {})}>
          <YourApp pickerOpen={true} onPickerClose={() => {}} windowId={win.id} />
        </Window>
      </div>
    </WindowButtonRegistryProvider>
  );
};

export const WithPickerOpen: Story = {
  render: () => <YourAppWithPickerOpen />,
};
```

---

## FilePickerModal API Reference

| Prop                | Type                       | Required | Description                                      |
| ------------------- | -------------------------- | -------- | ------------------------------------------------ |
| `opened`            | `boolean`                  | ✓        | Whether the modal is visible                     |
| `acceptedMimeTypes` | `string[]`                 | —        | e.g. `['image/*']`, `['application/pdf']`. Empty = all files |
| `onConfirm`         | `(node: FileNode) => void` | ✓        | Called when the user selects a file and clicks Open |
| `onCancel`          | `() => void`               | ✓        | Called when the user clicks Cancel               |

Wildcards like `image/*` are supported — they'll match any file whose mimeType starts with `image/`.

---

## Real Reference

The complete implementation lives in:

- [`src/Presentation/Components/Apps/ImageViewerApp/ImageViewerApp.tsx`](../src/Presentation/Components/Apps/ImageViewerApp/ImageViewerApp.tsx)
- [`src/Presentation/Components/Apps/ImageViewerApp/buildImageViewerMenuBar.tsx`](../src/Presentation/Components/Apps/ImageViewerApp/buildImageViewerMenuBar.tsx)
- [`src/Presentation/Components/Apps/ImageViewerApp/ImageViewerApp.test.tsx`](../src/Presentation/Components/Apps/ImageViewerApp/ImageViewerApp.test.tsx)
- [`src/Presentation/Components/Shared/FilePickerApp/FilePickerApp.tsx`](../src/Presentation/Components/Shared/FilePickerApp/FilePickerApp.tsx)
