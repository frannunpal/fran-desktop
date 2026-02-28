// @vitest-environment jsdom
import '@/Shared/Testing/__mocks__/jsdom-setup';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { renderWithMantine as wrapper } from '@/Shared/Testing/Utils/renderWithMantine';
import TaskbarContextMenu from './TaskbarContextMenu';

const baseProps = {
  windowMenuOpened: false,
  panelMenuOpened: false,
  menuPosition: { x: 100, y: 400 },
  targetWindowId: null,
  targetWindowState: null,
  onCloseWindow: vi.fn(),
  onMinimizeWindow: vi.fn(),
  onMaximizeWindow: vi.fn(),
  onRestoreWindow: vi.fn(),
  onWindowMenuClose: vi.fn(),
  onPanelMenuClose: vi.fn(),
};

describe('TaskbarContextMenu', () => {
  it('should render window menu items when windowMenuOpened is true', () => {
    // Act
    render(
      <TaskbarContextMenu
        {...baseProps}
        windowMenuOpened={true}
        targetWindowId="win-1"
        targetWindowState="normal"
      />,
      { wrapper },
    );

    // Assert
    expect(screen.getByText('Close window')).toBeInTheDocument();
    expect(screen.getByText('Minimize')).toBeInTheDocument();
    expect(screen.getByText('Maximize')).toBeInTheDocument();
  });

  it('should render panel menu items when panelMenuOpened is true', () => {
    // Act
    render(<TaskbarContextMenu {...baseProps} panelMenuOpened={true} />, { wrapper });

    // Assert
    expect(screen.getByText('Show panel configuration (coming soon)')).toBeInTheDocument();
  });

  it('should call onCloseWindow with targetWindowId when Close window is clicked', () => {
    // Arrange
    const handleClose = vi.fn();
    const handleWindowMenuClose = vi.fn();

    // Act
    render(
      <TaskbarContextMenu
        {...baseProps}
        windowMenuOpened={true}
        targetWindowId="win-42"
        targetWindowState="normal"
        onCloseWindow={handleClose}
        onWindowMenuClose={handleWindowMenuClose}
      />,
      { wrapper },
    );
    fireEvent.click(screen.getByText('Close window'));

    // Assert
    expect(handleClose).toHaveBeenCalledWith('win-42');
    expect(handleWindowMenuClose).toHaveBeenCalledOnce();
  });

  it('should not call onCloseWindow when targetWindowId is null', () => {
    // Arrange
    const handleClose = vi.fn();

    // Act
    render(
      <TaskbarContextMenu
        {...baseProps}
        windowMenuOpened={true}
        targetWindowId={null}
        targetWindowState={null}
        onCloseWindow={handleClose}
      />,
      { wrapper },
    );
    fireEvent.click(screen.getByText('Close window'));

    // Assert
    expect(handleClose).not.toHaveBeenCalled();
  });

  it('should not render window menu items when windowMenuOpened is false', () => {
    // Act
    render(<TaskbarContextMenu {...baseProps} windowMenuOpened={false} />, { wrapper });

    // Assert
    expect(screen.queryByText('Close window')).not.toBeInTheDocument();
  });

  it('should call onMinimizeWindow when Minimize is clicked', () => {
    // Arrange
    const handleMinimize = vi.fn();

    // Act
    render(
      <TaskbarContextMenu
        {...baseProps}
        windowMenuOpened={true}
        targetWindowId="win-1"
        targetWindowState="normal"
        onMinimizeWindow={handleMinimize}
      />,
      { wrapper },
    );
    fireEvent.click(screen.getByText('Minimize'));

    // Assert
    expect(handleMinimize).toHaveBeenCalledWith('win-1');
  });

  it('should call onMaximizeWindow when Maximize is clicked', () => {
    // Arrange
    const handleMaximize = vi.fn();

    // Act
    render(
      <TaskbarContextMenu
        {...baseProps}
        windowMenuOpened={true}
        targetWindowId="win-1"
        targetWindowState="normal"
        onMaximizeWindow={handleMaximize}
      />,
      { wrapper },
    );
    fireEvent.click(screen.getByText('Maximize'));

    // Assert
    expect(handleMaximize).toHaveBeenCalledWith('win-1');
  });

  it('should show Restore instead of Maximize when window is minimized', () => {
    // Act
    render(
      <TaskbarContextMenu
        {...baseProps}
        windowMenuOpened={true}
        targetWindowId="win-1"
        targetWindowState="minimized"
      />,
      { wrapper },
    );

    // Assert
    expect(screen.getByText('Restore')).toBeInTheDocument();
    expect(screen.queryByText('Maximize')).not.toBeInTheDocument();
    expect(screen.queryByText('Minimize')).not.toBeInTheDocument();
  });

  it('should call onRestoreWindow when Restore is clicked on a minimized window', () => {
    // Arrange
    const handleRestore = vi.fn();

    // Act
    render(
      <TaskbarContextMenu
        {...baseProps}
        windowMenuOpened={true}
        targetWindowId="win-1"
        targetWindowState="minimized"
        onRestoreWindow={handleRestore}
      />,
      { wrapper },
    );
    fireEvent.click(screen.getByText('Restore'));

    // Assert
    expect(handleRestore).toHaveBeenCalledWith('win-1');
  });

  it('should show Restore instead of Maximize when window is maximized', () => {
    // Act
    render(
      <TaskbarContextMenu
        {...baseProps}
        windowMenuOpened={true}
        targetWindowId="win-1"
        targetWindowState="maximized"
      />,
      { wrapper },
    );

    // Assert
    expect(screen.getByText('Restore')).toBeInTheDocument();
    expect(screen.queryByText('Maximize')).not.toBeInTheDocument();
  });

  it('should call onRestoreWindow when Restore is clicked on a maximized window', () => {
    // Arrange
    const handleRestore = vi.fn();

    // Act
    render(
      <TaskbarContextMenu
        {...baseProps}
        windowMenuOpened={true}
        targetWindowId="win-1"
        targetWindowState="maximized"
        onRestoreWindow={handleRestore}
      />,
      { wrapper },
    );
    fireEvent.click(screen.getByText('Restore'));

    // Assert
    expect(handleRestore).toHaveBeenCalledWith('win-1');
  });
});
