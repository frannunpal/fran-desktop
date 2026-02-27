// @vitest-environment jsdom
import '@/Shared/Testing/__mocks__/jsdom-setup';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { WindowEntity } from "@/Shared/Interfaces/WindowEntity";
import { createLocalStorageMock } from '@/Shared/Testing/__mocks__/localStorage.mock';
import { renderWithMantine as wrapper } from '@/Shared/Testing/Utils/renderWithMantine';
import { resetDesktopStore } from '@/Shared/Testing/Utils/resetDesktopStore';

vi.mock('react-rnd', () => import('@/Shared/Testing/__mocks__/react-rnd.mock'));
vi.mock('framer-motion', () => import('@/Shared/Testing/__mocks__/framer-motion.mock'));
vi.mock('@presentation/Hooks/useWindowButtonRegistry', () => ({
  useWindowButtonRegistry: () => ({ getRect: () => undefined }),
}));

const localStorageMock = createLocalStorageMock();
vi.stubGlobal('localStorage', localStorageMock);

const { useDesktopStore } = await import('@presentation/Store/desktopStore');
const { default: Window } = await import('./Window');

const makeWindow = (overrides: Partial<WindowEntity> = {}): WindowEntity => ({
  id: 'win-1',
  title: 'Test Window',
  content: 'notepad',
  x: 100,
  y: 100,
  width: 800,
  height: 600,
  minWidth: 200,
  minHeight: 150,
  isOpen: true,
  state: 'normal',
  zIndex: 1,
  ...overrides,
});

describe('Window component', () => {
  beforeEach(() => {
    resetDesktopStore(useDesktopStore, localStorageMock);
  });

  it('should render the window title', () => {
    // Act
    render(<Window window={makeWindow()} />, { wrapper });

    // Assert
    expect(screen.getByText('Test Window')).toBeInTheDocument();
  });

  it('should render the emoji icon in the titlebar when icon is provided', () => {
    // Act
    render(<Window window={makeWindow({ icon: '📝' })} />, { wrapper });

    // Assert
    expect(screen.getByText('📝')).toBeInTheDocument();
  });

  it('should render minimize, maximize and close buttons', () => {
    // Act
    render(<Window window={makeWindow()} />, { wrapper });

    // Assert
    expect(screen.getByLabelText('Minimize')).toBeInTheDocument();
    expect(screen.getByLabelText('Maximize')).toBeInTheDocument();
    expect(screen.getByLabelText('Close')).toBeInTheDocument();
  });

  it('should render children inside the window', () => {
    // Act
    render(
      <Window window={makeWindow()}>
        <span>app content</span>
      </Window>,
      { wrapper },
    );

    // Assert
    expect(screen.getByText('app content')).toBeInTheDocument();
  });

  it('should not render when isOpen is false', () => {
    // Act
    render(<Window window={makeWindow({ isOpen: false })} />, { wrapper });

    // Assert
    expect(screen.queryByText('Test Window')).not.toBeInTheDocument();
  });

  it('should be hidden (not visible) when state is minimized', () => {
    // Act
    render(<Window window={makeWindow({ state: 'minimized' })} />, { wrapper });

    // Assert — window stays in DOM but the Rnd wrapper is hidden via visibility:hidden
    const rndContainer = screen.getByTestId('rnd-container');
    expect(rndContainer).toHaveStyle({ visibility: 'hidden' });
  });

  it('should show Restore button when maximized', () => {
    // Act
    render(<Window window={makeWindow({ state: 'maximized' })} />, { wrapper });

    // Assert
    expect(screen.getByLabelText('Restore')).toBeInTheDocument();
    expect(screen.queryByLabelText('Maximize')).not.toBeInTheDocument();
  });

  it('should call closeWindow when close button is clicked', async () => {
    // Arrange
    useDesktopStore.getState().openWindow({
      title: 'Test Window',
      content: 'notepad',
      x: 100,
      y: 100,
      width: 800,
      height: 600,
      minWidth: 200,
      minHeight: 150,
    });
    const win = useDesktopStore.getState().windows[0];
    render(<Window window={win} />, { wrapper });

    // Act
    fireEvent.click(screen.getByLabelText('Close'));

    // Assert — animation is mocked (controls.start resolves instantly)
    await vi.waitFor(() => {
      expect(useDesktopStore.getState().windows).toHaveLength(0);
    });
  });

  it('should minimize window when minimize button is clicked', async () => {
    // Arrange
    useDesktopStore.getState().openWindow({
      title: 'Test Window',
      content: 'notepad',
      x: 100,
      y: 100,
      width: 800,
      height: 600,
      minWidth: 200,
      minHeight: 150,
    });
    const win = useDesktopStore.getState().windows[0];
    render(<Window window={win} />, { wrapper });

    // Act
    fireEvent.click(screen.getByLabelText('Minimize'));

    // Assert
    await vi.waitFor(() => {
      expect(useDesktopStore.getState().windows[0].state).toBe('minimized');
    });
  });

  it('should not render maximize button when canMaximize is false', () => {
    // Act
    render(<Window window={makeWindow({ canMaximize: false })} />, { wrapper });

    // Assert
    expect(screen.queryByLabelText('Maximize')).not.toBeInTheDocument();
    expect(screen.getByLabelText('Minimize')).toBeInTheDocument();
    expect(screen.getByLabelText('Close')).toBeInTheDocument();
  });

  it('should render maximize button when canMaximize is true', () => {
    // Act
    render(<Window window={makeWindow({ canMaximize: true })} />, { wrapper });

    // Assert
    expect(screen.getByLabelText('Maximize')).toBeInTheDocument();
  });

  it('should focus window on mouse down', () => {
    // Arrange — open through the store so windowManager tracks zIndex
    const baseInput = {
      title: 'Test Window',
      content: 'notepad' as const,
      x: 100,
      y: 100,
      width: 800,
      height: 600,
      minWidth: 200,
      minHeight: 150,
    };
    useDesktopStore.getState().openWindow(baseInput); // zIndex 1
    useDesktopStore.getState().openWindow(baseInput); // zIndex 2
    const [w1, w2] = useDesktopStore.getState().windows;
    render(<Window window={w1} />, { wrapper });

    // Act
    fireEvent.mouseDown(screen.getByTestId('rnd-container'));

    // Assert — w1 should now have highest zIndex (3)
    const focused = useDesktopStore.getState().windows.find(w => w.id === w1.id)!;
    const other = useDesktopStore.getState().windows.find(w => w.id === w2.id)!;
    expect(focused.zIndex).toBeGreaterThan(other.zIndex);
  });
});
