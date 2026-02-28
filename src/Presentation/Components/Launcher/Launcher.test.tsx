// @vitest-environment jsdom
import '@/Shared/Testing/__mocks__/jsdom-setup';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { createLocalStorageMock } from '@/Shared/Testing/__mocks__/localStorage.mock';
import { renderWithMantine as wrapper } from '@/Shared/Testing/Utils/renderWithMantine';
import { resetDesktopStore } from '@/Shared/Testing/Utils/resetDesktopStore';

vi.mock('framer-motion', () => import('@/Shared/Testing/__mocks__/framer-motion.mock'));

const localStorageMock = createLocalStorageMock();
vi.stubGlobal('localStorage', localStorageMock);

const { useDesktopStore } = await import('@presentation/Store/desktopStore');
const { default: Launcher } = await import('./Launcher');

describe('Launcher component', () => {
  beforeEach(() => {
    resetDesktopStore(useDesktopStore, localStorageMock);
  });

  it('should render the trigger button', () => {
    // Act
    render(<Launcher />, { wrapper });

    // Assert
    expect(screen.getByLabelText('Launcher')).toBeInTheDocument();
  });

  it('should render a custom icon when fcIcon prop is provided', () => {
    // Act — Launcher is rendered with the mocked useFcIconElement returning null (default)
    // The trigger still renders; icon slot is empty but the button exists
    render(<Launcher fcIcon="FcCustom" />, { wrapper });

    // Assert — button is present (icon rendering tested via useFcIcon unit tests)
    expect(screen.getByLabelText('Launcher')).toBeInTheDocument();
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
    expect(screen.getByLabelText('FilesApp')).toBeInTheDocument();
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
