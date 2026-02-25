// @vitest-environment jsdom
import '@application/__mocks__/jsdom-setup';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('react-contexify', () => import('@application/__mocks__/react-contexify.mock'));

const { default: ContextMenu, DESKTOP_CONTEXT_MENU_ID } = await import('./ContextMenu');

describe('ContextMenu component', () => {
  it('should render all menu items', () => {
    // Act
    render(<ContextMenu onOpenApp={vi.fn()} onToggleTheme={vi.fn()} />);

    // Assert
    expect(screen.getByText('Open Notepad')).toBeInTheDocument();
    expect(screen.getByText('Open Terminal')).toBeInTheDocument();
    expect(screen.getByText('Open Files')).toBeInTheDocument();
    expect(screen.getByText('Toggle Theme')).toBeInTheDocument();
  });

  it('should render with the correct menu id', () => {
    // Act
    render(<ContextMenu onOpenApp={vi.fn()} onToggleTheme={vi.fn()} />);

    // Assert
    expect(
      screen.getByTestId(`context-menu-${DESKTOP_CONTEXT_MENU_ID}`),
    ).toBeInTheDocument();
  });

  it('should call onOpenApp with notepad when Open Notepad is clicked', () => {
    // Arrange
    const handleOpenApp = vi.fn();

    // Act
    render(<ContextMenu onOpenApp={handleOpenApp} onToggleTheme={vi.fn()} />);
    fireEvent.click(screen.getByText('Open Notepad'));

    // Assert
    expect(handleOpenApp).toHaveBeenCalledWith('notepad');
  });

  it('should call onOpenApp with terminal when Open Terminal is clicked', () => {
    // Arrange
    const handleOpenApp = vi.fn();

    // Act
    render(<ContextMenu onOpenApp={handleOpenApp} onToggleTheme={vi.fn()} />);
    fireEvent.click(screen.getByText('Open Terminal'));

    // Assert
    expect(handleOpenApp).toHaveBeenCalledWith('terminal');
  });

  it('should call onToggleTheme when Toggle Theme is clicked', () => {
    // Arrange
    const handleToggleTheme = vi.fn();

    // Act
    render(<ContextMenu onOpenApp={vi.fn()} onToggleTheme={handleToggleTheme} />);
    fireEvent.click(screen.getByText('Toggle Theme'));

    // Assert
    expect(handleToggleTheme).toHaveBeenCalledOnce();
  });
});
