// @vitest-environment jsdom
import '@/Shared/Testing/__mocks__/jsdom-setup';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { renderWithMantine as wrapper } from '@/Shared/Testing/Utils/renderWithMantine';
import ContextMenu from './ContextMenu';

const defaultProps = {
  opened: true,
  position: { x: 100, y: 200 },
  onClose: vi.fn(),
  onOpenApp: vi.fn(),
  onToggleTheme: vi.fn(),
};

describe('ContextMenu component', () => {
  it('should render all menu items when opened', () => {
    // Act
    render(<ContextMenu {...defaultProps} />, { wrapper });

    // Assert
    expect(screen.getByText('Open Notepad')).toBeInTheDocument();
    expect(screen.getByText('Open Terminal')).toBeInTheDocument();
    expect(screen.getByText('Open FilesApp')).toBeInTheDocument();
    expect(screen.getByText('Open PDF Viewer')).toBeInTheDocument();
    expect(screen.getByText('Open Calendar')).toBeInTheDocument();
    expect(screen.getByText('Toggle Theme')).toBeInTheDocument();
  });

  it('should call onOpenApp with notepad when Open Notepad is clicked', () => {
    // Arrange
    const handleOpenApp = vi.fn();

    // Act
    render(<ContextMenu {...defaultProps} onOpenApp={handleOpenApp} />, { wrapper });
    fireEvent.click(screen.getByText('Open Notepad'));

    // Assert
    expect(handleOpenApp).toHaveBeenCalledWith('notepad');
  });

  it('should call onOpenApp with terminal when Open Terminal is clicked', () => {
    // Arrange
    const handleOpenApp = vi.fn();

    // Act
    render(<ContextMenu {...defaultProps} onOpenApp={handleOpenApp} />, { wrapper });
    fireEvent.click(screen.getByText('Open Terminal'));

    // Assert
    expect(handleOpenApp).toHaveBeenCalledWith('terminal');
  });

  it('should call onToggleTheme when Toggle Theme is clicked', () => {
    // Arrange
    const handleToggleTheme = vi.fn();

    // Act
    render(<ContextMenu {...defaultProps} onToggleTheme={handleToggleTheme} />, { wrapper });
    fireEvent.click(screen.getByText('Toggle Theme'));

    // Assert
    expect(handleToggleTheme).toHaveBeenCalledOnce();
  });

  it('should call onClose after clicking a menu item', () => {
    // Arrange
    const handleClose = vi.fn();

    // Act
    render(<ContextMenu {...defaultProps} onClose={handleClose} />, { wrapper });
    fireEvent.click(screen.getByText('Open Notepad'));

    // Assert
    expect(handleClose).toHaveBeenCalledOnce();
  });

  it('should not render menu items when closed', () => {
    // Act
    render(<ContextMenu {...defaultProps} opened={false} />, { wrapper });

    // Assert
    expect(screen.queryByText('Open Notepad')).not.toBeInTheDocument();
  });
});
