// @vitest-environment jsdom
import '@/Shared/Testing/__mocks__/jsdom-setup';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { createLocalStorageMock } from '@/Shared/Testing/__mocks__/localStorage.mock';
import { renderWithMantine as wrapper } from '@/Shared/Testing/Utils/renderWithMantine';
import { resetDesktopStore } from '@/Shared/Testing/Utils/resetDesktopStore';

vi.mock('@presentation/Hooks/useClock', () => ({ useClock: () => '10:30' }));
vi.mock('@presentation/Components/Launcher/Launcher', () => ({
  default: () => <button aria-label="Launcher">⊞</button>,
}));
vi.mock('@presentation/Hooks/useWindowButtonRegistry', () => ({
  useWindowButtonRegistry: () => ({ register: vi.fn(), unregister: vi.fn(), getRect: () => undefined }),
}));

const localStorageMock = createLocalStorageMock();
vi.stubGlobal('localStorage', localStorageMock);

const { useDesktopStore } = await import('@presentation/Store/desktopStore');
const { default: Taskbar } = await import('./Taskbar');

const baseInput = {
  title: 'Notepad',
  content: 'notepad' as const,
  x: 100,
  y: 100,
  width: 600,
  height: 400,
  minWidth: 200,
  minHeight: 150,
};

describe('Taskbar component', () => {
  beforeEach(() => {
    resetDesktopStore(useDesktopStore, localStorageMock);
  });

  it('should render the clock', () => {
    // Act
    render(<Taskbar />, { wrapper });

    // Assert
    expect(screen.getByLabelText('clock')).toHaveTextContent('10:30');
  });

  it('should render a button for each open window', () => {
    // Arrange
    useDesktopStore.getState().openWindow(baseInput);
    useDesktopStore.getState().openWindow({ ...baseInput, title: 'Terminal' });

    // Act
    render(<Taskbar />, { wrapper });

    // Assert
    expect(screen.getByLabelText('Notepad')).toBeInTheDocument();
    expect(screen.getByLabelText('Terminal')).toBeInTheDocument();
  });

  it('should restore a minimized window when its button is clicked', () => {
    // Arrange
    useDesktopStore.getState().openWindow(baseInput);
    const win = useDesktopStore.getState().windows[0];
    useDesktopStore.getState().minimizeWindow(win.id);
    render(<Taskbar />, { wrapper });

    // Act
    fireEvent.click(screen.getByLabelText('Notepad'));

    // Assert
    expect(useDesktopStore.getState().windows[0].state).toBe('normal');
  });

  it('should minimize a normal window when its button is clicked', () => {
    // Arrange
    useDesktopStore.getState().openWindow(baseInput);
    render(<Taskbar />, { wrapper });

    // Act
    fireEvent.click(screen.getByLabelText('Notepad'));

    // Assert
    expect(useDesktopStore.getState().windows[0].state).toBe('minimized');
  });

  it('should mark the active window button with data-active=true', () => {
    // Arrange
    useDesktopStore.getState().openWindow(baseInput);

    // Act
    render(<Taskbar />, { wrapper });

    // Assert
    expect(screen.getByLabelText('Notepad')).toHaveAttribute('data-active', 'true');
  });

  it('should mark a minimized window button with data-active=false', () => {
    // Arrange
    useDesktopStore.getState().openWindow(baseInput);
    const win = useDesktopStore.getState().windows[0];
    useDesktopStore.getState().minimizeWindow(win.id);

    // Act
    render(<Taskbar />, { wrapper });

    // Assert
    expect(screen.getByLabelText('Notepad')).toHaveAttribute('data-active', 'false');
  });

  it('should render the theme toggle button with moon icon in light mode', () => {
    // Arrange
    useDesktopStore.getState().setThemeMode('light');

    // Act
    render(<Taskbar />, { wrapper });

    // Assert
    expect(screen.getByLabelText('Switch to dark mode')).toBeInTheDocument();
    expect(screen.getByLabelText('Switch to dark mode')).toHaveTextContent('🌙');
  });

  it('should render the theme toggle button with sun icon in dark mode', () => {
    // Arrange
    useDesktopStore.getState().setThemeMode('dark');

    // Act
    render(<Taskbar />, { wrapper });

    // Assert
    expect(screen.getByLabelText('Switch to light mode')).toBeInTheDocument();
    expect(screen.getByLabelText('Switch to light mode')).toHaveTextContent('☀️');
  });

  it('should toggle theme when the theme button is clicked', () => {
    // Arrange
    useDesktopStore.getState().setThemeMode('light');
    render(<Taskbar />, { wrapper });

    // Act
    fireEvent.click(screen.getByLabelText('Switch to dark mode'));

    // Assert
    expect(useDesktopStore.getState().theme.mode).toBe('dark');
  });
});
