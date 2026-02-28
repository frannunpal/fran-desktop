# How to Create an App

Want to add your own application to the desktop? Great, it's easier than you think. This document walks you through creating a new app step by step.

## The Complete Flow

Creating an app has three steps:

1. **Register the app** in `src/Shared/Constants/apps.ts`
2. **Create the component** in `src/Presentation/Components/Apps/`
3. **(Optional but recommended) Add tests and stories**

Let's see each in detail.

## Step 1: Register the App

Open `src/Shared/Constants/apps.ts` and add your app to the `APPS` array. Each entry looks like this:

```typescript
{
  id: 'my-app',              // Unique ID
  name: 'My App',           // Display name
  icon: '🎮',               // Emoji icon (used as fallback in case we don't find the real icon, see next)
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
├── MyApp.tsx              # Main component
├── MyApp.module.css       # Styles (optional)
├── MyApp.test.tsx         # Tests (optional but recommended)
└── MyApp.stories.tsx     # Storybook (optional)
```

### Basic Component Structure

```tsx
// src/Presentation/Components/Apps/MyApp/MyApp.tsx
import { useEffect, useState } from 'react';
import { useAppParams } from '../../Hooks/useAppParams';
import styles from './MyApp.module.css';

interface MyAppProps {
  contentData?: {
    // Props you pass when opening the app
    initialValue?: string;
  };
}

export function MyApp({ contentData }: MyAppProps) {
  const { windowId } = useAppParams();
  const [state, setState] = useState(contentData?.initialValue ?? '');

  return (
    <div className={styles.container}>
      <h1>Hello from My App!</h1>
      <p>Current state: {state}</p>
    </div>
  );
}
```

### How to Receive Parameters

When you open an app with `openApp('my-app', { contentData: {...} })`, the data arrives in the component's `contentData` prop.

You can also use the `useAppParams` hook (if it exists) or directly read the props that the Window component passes.

## Step 3: (Optional) Tests

If you want your app to have tests, here's a template:

```tsx
// src/Presentation/Components/Apps/MyApp/MyApp.test.tsx
import { render, screen } from '@testing-library/react';
import { MyApp } from './MyApp';

describe('MyApp', () => {
  it('renders without crashing', () => {
    render(<MyApp />);
    expect(screen.getByText(/hello/i)).toBeInTheDocument();
  });

  it('accepts initial value from contentData', () => {
    render(<MyApp contentData={{ initialValue: 'test' }} />);
    expect(screen.getByText(/test/i)).toBeInTheDocument();
  });
});
```

## Real Example: CalendarApp

Check out `src/Presentation/Components/Apps/` for complete examples with everything (tests, styles, stories).

## How to Open Your App

Once registered, you can open it from anywhere:

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

## Next Step

Got your app created? Then learn [testing.md](./testing.md) to know how to test all this properly.
