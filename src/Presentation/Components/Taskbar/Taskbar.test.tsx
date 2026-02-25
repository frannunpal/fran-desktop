// @vitest-environment jsdom
import '@application/__mocks__/jsdom-setup';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import type { ReactNode } from 'react';
import { createLocalStorageMock } from '@application/__mocks__/localStorage.mock';

vi.mock('@presentation/Hooks/useClock', () => ({ useClock: () => '10:30' }));

const localStorageMock = createLocalStorageMock();
vi.stubGlobal('localStorage', localStorageMock);

const { useDesktopStore } = await import('@presentation/Store/desktopStore');
const { default: Taskbar } = await import('./Taskbar');

const wrapper = ({ children }: { children: ReactNode }) => (
  <MantineProvider>{children}</MantineProvider>
);

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
    localStorageMock.clear();
    vi.clearAllMocks();
    useDesktopStore.getState().setThemeMode('light');
    useDesktopStore.setState({ windows: [], icons: [], fsNodes: [] });
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
});
