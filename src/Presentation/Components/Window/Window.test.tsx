// @vitest-environment jsdom
import '@/Shared/Testing/__mocks__/jsdom-setup';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { createLocalStorageMock } from '@/Shared/Testing/__mocks__/localStorage.mock';
import { makeWindow } from '@/Shared/Testing/Utils/makeWindow';
import { makeWindowInput } from '@/Shared/Testing/Utils/makeWindowInput';
import { renderWithMantine as wrapper } from '@/Shared/Testing/Utils/renderWithMantine';
import { resetDesktopStore } from '@/Shared/Testing/Utils/resetDesktopStore';

vi.mock('react-rnd', () => import('@/Shared/Testing/__mocks__/react-rnd.mock'));
vi.mock('framer-motion', () => import('@/Shared/Testing/__mocks__/framer-motion.mock'));
vi.mock('@presentation/Hooks/useWindowButtonRegistry', () => ({
  useWindowButtonRegistry: () => ({ getRect: () => undefined }),
}));
vi.mock('@presentation/Hooks/useFcIcon', () => ({
  useFcIconElement: (name: string) => (name ? <svg data-testid="fc-icon" /> : null),
}));

const localStorageMock = createLocalStorageMock();
vi.stubGlobal('localStorage', localStorageMock);

const { useDesktopStore, resetWindowManager } = await import('@presentation/Store/desktopStore');
const { default: Window } = await import('./Window');

describe('Window component', () => {
  beforeEach(() => {
    resetDesktopStore(useDesktopStore, localStorageMock, resetWindowManager);
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
    useDesktopStore.getState().openWindow(makeWindowInput());
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
    useDesktopStore.getState().openWindow(makeWindowInput());
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

  it('should show focus overlay when window is not focused (lower zIndex)', () => {
    // Arrange — open two windows; w1 has lower zIndex
    useDesktopStore.getState().openWindow(makeWindowInput()); // zIndex 1
    useDesktopStore.getState().openWindow(makeWindowInput()); // zIndex 2
    const w1 = useDesktopStore.getState().windows[0];

    // Act
    render(<Window window={w1} />, { wrapper });

    // Assert
    expect(screen.getByTestId('focus-overlay')).toBeInTheDocument();
  });

  it('should not show focus overlay when window is focused (highest zIndex)', () => {
    // Arrange — single window is always focused
    useDesktopStore.getState().openWindow(makeWindowInput());
    const win = useDesktopStore.getState().windows[0];

    // Act
    render(<Window window={win} />, { wrapper });

    // Assert
    expect(screen.queryByTestId('focus-overlay')).not.toBeInTheDocument();
  });

  it('should call focusWindow when clicking the focus overlay', () => {
    // Arrange — open two windows; w1 has lower zIndex
    useDesktopStore.getState().openWindow(makeWindowInput()); // zIndex 1
    useDesktopStore.getState().openWindow(makeWindowInput()); // zIndex 2
    const w1 = useDesktopStore.getState().windows[0];
    render(<Window window={w1} />, { wrapper });

    // Act
    fireEvent.mouseDown(screen.getByTestId('focus-overlay'));

    // Assert — w1 should now have highest zIndex
    const focused = useDesktopStore.getState().windows.find(w => w.id === w1.id)!;
    const other = useDesktopStore.getState().windows.find(w => w.id !== w1.id)!;
    expect(focused.zIndex).toBeGreaterThan(other.zIndex);
  });

  it('should call focusWindow exactly once when clicking the focus overlay (no event bubble)', () => {
    // Arrange — open two windows; w1 has lower zIndex
    useDesktopStore.getState().openWindow(makeWindowInput()); // zIndex 1
    useDesktopStore.getState().openWindow(makeWindowInput()); // zIndex 2
    const w1 = useDesktopStore.getState().windows[0];
    const w2 = useDesktopStore.getState().windows[1];
    render(<Window window={w1} />, { wrapper });

    const zIndexBefore = useDesktopStore.getState().windows.find(w => w.id === w2.id)!.zIndex;

    // Act — click overlay; without stopPropagation this would fire focusWindow twice,
    // advancing the counter by 2 and leaving w2 with an unchanged zIndex that appears
    // lower than expected. With stopPropagation, counter advances by exactly 1.
    fireEvent.mouseDown(screen.getByTestId('focus-overlay'));

    // Assert — w2's zIndex must be unchanged (event did not bubble to Rnd.onMouseDown)
    const w2After = useDesktopStore.getState().windows.find(w => w.id === w2.id)!;
    expect(w2After.zIndex).toBe(zIndexBefore);
  });

  it('should focus window on mouse down', () => {
    // Arrange — open through the store so windowManager tracks zIndex
    useDesktopStore.getState().openWindow(makeWindowInput()); // zIndex 1
    useDesktopStore.getState().openWindow(makeWindowInput()); // zIndex 2
    const [w1, w2] = useDesktopStore.getState().windows;
    render(<Window window={w1} />, { wrapper });

    // Act
    fireEvent.mouseDown(screen.getByTestId('rnd-container'));

    // Assert — w1 should now have highest zIndex (3)
    const focused = useDesktopStore.getState().windows.find(w => w.id === w1.id)!;
    const other = useDesktopStore.getState().windows.find(w => w.id === w2.id)!;
    expect(focused.zIndex).toBeGreaterThan(other.zIndex);
  });

  it('alwaysOnTop window should always have higher zIndex than normal windows', () => {
    // Arrange — open a normal window and an alwaysOnTop window
    useDesktopStore.getState().openWindow(makeWindowInput()); // normal
    useDesktopStore.getState().openWindow(makeWindowInput({ alwaysOnTop: true })); // alwaysOnTop
    const [normal, alwaysOnTop] = useDesktopStore.getState().windows;

    // Assert — alwaysOnTop zIndex must exceed the normal window zIndex
    expect(alwaysOnTop.zIndex).toBeGreaterThan(normal.zIndex);
  });

  it('focusing a normal window should not bring it above an alwaysOnTop window', () => {
    // Arrange
    useDesktopStore.getState().openWindow(makeWindowInput({ alwaysOnTop: true })); // alwaysOnTop
    useDesktopStore.getState().openWindow(makeWindowInput()); // normal
    const alwaysOnTopWin = useDesktopStore.getState().windows[0];
    const normalWin = useDesktopStore.getState().windows[1];

    // Act — focus the normal window
    useDesktopStore.getState().focusWindow(normalWin.id);

    // Assert — alwaysOnTop should still be on top
    const updatedNormal = useDesktopStore.getState().windows.find(w => w.id === normalWin.id)!;
    const updatedAlwaysOnTop = useDesktopStore
      .getState()
      .windows.find(w => w.id === alwaysOnTopWin.id)!;
    expect(updatedAlwaysOnTop.zIndex).toBeGreaterThan(updatedNormal.zIndex);
  });

  it('alwaysOnTop window should show focus overlay when another alwaysOnTop window has higher zIndex', () => {
    // Arrange — two alwaysOnTop windows
    useDesktopStore.getState().openWindow(makeWindowInput({ alwaysOnTop: true })); // lower
    useDesktopStore.getState().openWindow(makeWindowInput({ alwaysOnTop: true })); // higher
    const lowerAlwaysOnTop = useDesktopStore.getState().windows[0];

    // Act
    render(<Window window={lowerAlwaysOnTop} />, { wrapper });

    // Assert — lower alwaysOnTop window should show focus overlay
    expect(screen.getByTestId('focus-overlay')).toBeInTheDocument();
  });

  it('normal window should not show focus overlay even when alwaysOnTop window has higher zIndex', () => {
    // Arrange — one normal window (focused in its group) and one alwaysOnTop window above it
    useDesktopStore.getState().openWindow(makeWindowInput()); // normal, zIndex 1
    useDesktopStore.getState().openWindow(makeWindowInput({ alwaysOnTop: true })); // alwaysOnTop, zIndex > 10000
    const normalWin = useDesktopStore.getState().windows[0];

    // Act
    render(<Window window={normalWin} />, { wrapper });

    // Assert — normal window is focused within its group → no overlay
    expect(screen.queryByTestId('focus-overlay')).not.toBeInTheDocument();
  });

  it('should not render menu bar when menuBar prop is absent', () => {
    // Act
    render(<Window window={makeWindow()} />, { wrapper });

    // Assert
    expect(screen.queryByRole('menubar')).not.toBeInTheDocument();
  });

  it('should render menu bar when menuBar prop contains elements', () => {
    // Arrange
    const menuBar = [
      {
        type: 'menu' as const,
        label: 'File',
        items: [{ type: 'item' as const, label: 'New', onClick: vi.fn() }],
      },
    ];

    // Act
    render(<Window window={makeWindow()} menuBar={menuBar} />, { wrapper });

    // Assert
    expect(screen.getByRole('menubar')).toBeInTheDocument();
    expect(screen.getByText('File')).toBeInTheDocument();
  });
});
