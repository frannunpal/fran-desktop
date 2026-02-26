// @vitest-environment jsdom
import '@application/__mocks__/jsdom-setup';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import type { ReactNode } from 'react';
import { createLocalStorageMock } from '@application/__mocks__/localStorage.mock';

vi.mock('framer-motion', () => import('@application/__mocks__/framer-motion.mock'));

const localStorageMock = createLocalStorageMock();
vi.stubGlobal('localStorage', localStorageMock);

const { useDesktopStore } = await import('@presentation/Store/desktopStore');
const { default: Launcher } = await import('./Launcher');

const wrapper = ({ children }: { children: ReactNode }) => (
  <MantineProvider>{children}</MantineProvider>
);

describe('Launcher component', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    useDesktopStore.getState().setThemeMode('light');
    useDesktopStore.setState({ windows: [], icons: [], fsNodes: [] });
  });

  it('should render the trigger button', () => {
    // Act
    render(<Launcher />, { wrapper });

    // Assert
    expect(screen.getByLabelText('Launcher')).toBeInTheDocument();
  });

  it('should render a custom icon when icon prop is provided', () => {
    // Arrange
    const CustomIcon = () => <svg data-testid="custom-icon" />;

    // Act
    render(<Launcher icon={CustomIcon} />, { wrapper });

    // Assert
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('should not show the app panel by default', () => {
    // Act
    render(<Launcher />, { wrapper });

    // Assert
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('should show the app panel when trigger is clicked', () => {
    // Act
    render(<Launcher />, { wrapper });
    fireEvent.click(screen.getByLabelText('Launcher'));

    // Assert
    expect(screen.getByRole('menu', { name: 'App launcher' })).toBeInTheDocument();
  });

  it('should list all available apps when open', () => {
    // Act
    render(<Launcher />, { wrapper });
    fireEvent.click(screen.getByLabelText('Launcher'));

    // Assert
    expect(screen.getByLabelText('Notepad')).toBeInTheDocument();
    expect(screen.getByLabelText('Terminal')).toBeInTheDocument();
    expect(screen.getByLabelText('Files')).toBeInTheDocument();
    expect(screen.getByLabelText('Settings')).toBeInTheDocument();
  });

  it('should open a window and close the panel when an app is clicked', () => {
    // Arrange
    render(<Launcher />, { wrapper });
    fireEvent.click(screen.getByLabelText('Launcher'));

    // Act
    fireEvent.click(screen.getByLabelText('Notepad'));

    // Assert — window was opened
    expect(useDesktopStore.getState().windows).toHaveLength(1);
    expect(useDesktopStore.getState().windows[0].title).toBe('Notepad');
    // Assert — panel closed
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('should toggle the panel closed when trigger is clicked again', () => {
    // Arrange
    render(<Launcher />, { wrapper });
    fireEvent.click(screen.getByLabelText('Launcher'));
    expect(screen.getByRole('menu')).toBeInTheDocument();

    // Act
    fireEvent.click(screen.getByLabelText('Launcher'));

    // Assert
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('should set aria-expanded on the trigger reflecting panel state', () => {
    // Act
    render(<Launcher />, { wrapper });
    const trigger = screen.getByLabelText('Launcher');

    // Assert — closed by default
    expect(trigger).toHaveAttribute('aria-expanded', 'false');

    // Act — open
    fireEvent.click(trigger);

    // Assert — open
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });
});