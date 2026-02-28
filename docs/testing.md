# Testing and You

Tests are important. Yeah, I know nobody likes writing them, but this project has them and they work well. Here's how to test without losing your mind.

## Tools We Use

| Tool                      | What it's for                                     |
| ------------------------- | ------------------------------------------------- |
| **Vitest**                | Test runner (like Jest but faster)                |
| **React Testing Library** | Testing React components                          |
| **Jest DOM**              | Additional matchers (`toBeInTheDocument()`, etc.) |
| **jsdom**                 | Browser simulation for tests                      |

## Test Commands

```bash
# Run tests in watch mode
npm run test

# Run tests once (for CI)
npm run test:run

# Run tests with coverage
npm run test:coverage
```

## Test File Structure

Tests live next to the code they test:

```
src/
├── Presentation/
│   └── Hooks/
│       ├── useOpenApp.ts          # Code
│       └── useOpenApp.test.ts     # Test
├── Shared/
│   └── Constants/
│       ├── apps.ts
│       └── apps.test.ts
└── ...
```

## Types of Tests

### 1. Hook Tests

Hooks are tested with a combination of `vitest` and store mocks.

```typescript
// src/Presentation/Hooks/useClock.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useClock } from './useClock';

describe('useClock', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('returns formatted time', () => {
    const { result } = renderHook(() => useClock());

    // Mock Date
    vi.setSystemTime(new Date('2024-01-01T14:35:00'));

    expect(result.current).toBe('14:35');
  });
});
```

### 2. Component Tests

React components are tested with React Testing Library.

```tsx
// src/Presentation/Components/Apps/CalendarApp/CalendarApp.test.tsx
import { render, screen } from '@testing-library/react';
import { CalendarApp } from './CalendarApp';

describe('CalendarApp', () => {
  it('renders the calendar title', () => {
    render(<CalendarApp />);
    expect(screen.getByText(/calendar/i)).toBeInTheDocument();
  });
});
```

### 3. Store Tests

The Zustand store is tested directly.

```typescript
// src/Presentation/Store/desktopStore.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { desktopStore } from './desktopStore';
import { resetDesktopStore } from '../../Shared/Testing/Utils/resetDesktopStore';

describe('desktopStore', () => {
  beforeEach(() => {
    resetDesktopStore();
  });

  it('opens a window', () => {
    const state = desktopStore.getState();
    state.openWindow({
      title: 'Test',
      content: 'test',
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    });

    expect(desktopStore.getState().windows).toHaveLength(1);
  });
});
```

## Testing Utilities

The project has helpers in `src/Shared/Testing/`:

### resetDesktopStore.ts

Resets the store before each test. Essential for independent tests.

```typescript
import { resetDesktopStore } from '../../Shared/Testing/Utils/resetDesktopStore';

beforeEach(() => {
  resetDesktopStore();
});
```

### renderWithMantine.tsx

Wrapper that renders the component with the Mantine Provider.

```tsx
import { renderWithMantine } from '../../Shared/Testing/Utils/renderWithMantine';

renderWithMantine(<MyComponent />);
```

### makeWindow.ts / makeWindowInput.ts

Helpers for creating windows in tests.

```typescript
import { makeWindowInput } from '../../Shared/Testing/Utils/makeWindowInput';

const windowInput = makeWindowInput({
  title: 'Test',
  content: 'test',
});
```

### Mocks

In `src/Shared/Testing/__mocks__/` there are mocks for:

- **localStorage.mock.ts**: localStorage mock
- **react-rnd.mock.tsx**: react-rnd mock
- **framer-motion.mock.tsx**: framer-motion mock

## AAA Pattern

This project follows the AAA (Arrange, Act, Assert) pattern in all tests:

```typescript
it('does something', () => {
  // Arrange: prepare state
  const store = getInitialState();

  // Act: perform action
  const result = store.openWindow({...});

  // Assert: verify result
  expect(result.windows).toHaveLength(1);
});
```

## Domain/Application Layer Tests

These have no external dependencies, so they're easier:

```typescript
// Domain test
import { describe, it, expect } from 'vitest';
import { createWindow } from '../../Domain/Entities/Window';

describe('Window', () => {
  it('creates a window with default values', () => {
    const window = createWindow({ title: 'Test', content: 'test' });

    expect(window.title).toBe('Test');
    expect(window.isOpen).toBe(true);
    expect(window.state).toBe('normal');
  });
});
```

## Practical Tips

### Don't test implementation, test behavior

```typescript
// Bad: testing how it does it
expect(container.querySelector('.button').classList.contains('active'));

// Good: testing what it does
expect(screen.getByRole('button')).toBeDisabled();
```

### Use screen instead of container

```typescript
// Old way (deprecated)
const { container } = render(<Component />);
container.querySelector('button');

// New way (better)
render(<Component />);
screen.getByRole('button');
```

### Mock what you can't control

If a component depends on something external (localStorage, window.resize, etc), mock it:

```typescript
import { vi } from 'vitest';

// localStorage mock
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });
```

## Coverage

Run `npm run test:coverage` to see what percentage of the code is tested. The goal is to keep it as high as possible, but prioritize tests for business logic.

## Next Step

You know how to test! Check the main [README](../README.md) or look at [architecture.md](./architecture.md) if you want to remember the overall vision of the project.
