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
  onCloseWindow: vi.fn(),
  onWindowMenuClose: vi.fn(),
  onPanelMenuClose: vi.fn(),
};

describe('TaskbarContextMenu', () => {
  it('should render window menu items when windowMenuOpened is true', () => {
    // Act
    render(<TaskbarContextMenu {...baseProps} windowMenuOpened={true} targetWindowId="win-1" />, { wrapper });

    // Assert
    expect(screen.getByText('Close window')).toBeInTheDocument();
    expect(screen.getByText('Pin window (coming soon)')).toBeInTheDocument();
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
});
