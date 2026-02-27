// @vitest-environment jsdom
import '@/Shared/Testing/__mocks__/jsdom-setup';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import type { ReactNode } from 'react';
import type { DesktopIconEntity } from "@/Shared/Interfaces/IDesktopIcon";

const { default: DesktopIcon } = await import('./DesktopIcon');

const wrapper = ({ children }: { children: ReactNode }) => (
  <MantineProvider>{children}</MantineProvider>
);

const makeIcon = (overrides: Partial<DesktopIconEntity> = {}): DesktopIconEntity => ({
  id: 'icon-1',
  name: 'Notepad',
  icon: '📝',
  x: 20,
  y: 20,
  appId: 'notepad',
  ...overrides,
});

const noop = vi.fn();

describe('DesktopIcon component', () => {
  it('should render the icon name', () => {
    // Act
    render(<DesktopIcon icon={makeIcon()} onDoubleClick={noop} onContextMenu={noop} />, { wrapper });

    // Assert
    expect(screen.getByText('Notepad')).toBeInTheDocument();
  });

  it('should render the icon image', () => {
    // Act
    render(<DesktopIcon icon={makeIcon()} onDoubleClick={noop} onContextMenu={noop} />, { wrapper });

    // Assert
    expect(screen.getByText('📝')).toBeInTheDocument();
  });

  it('should call onDoubleClick with appId when double-clicked', () => {
    // Arrange
    const handleDoubleClick = vi.fn();

    // Act
    render(<DesktopIcon icon={makeIcon()} onDoubleClick={handleDoubleClick} onContextMenu={noop} />, { wrapper });
    fireEvent.dblClick(screen.getByRole('button', { name: 'Notepad' }));

    // Assert
    expect(handleDoubleClick).toHaveBeenCalledWith('notepad', undefined);
  });

  it('should call onDoubleClick with appId and nodeId when icon has nodeId', () => {
    // Arrange
    const handleDoubleClick = vi.fn();

    // Act
    render(
      <DesktopIcon icon={makeIcon({ nodeId: 'folder-123' })} onDoubleClick={handleDoubleClick} onContextMenu={noop} />,
      { wrapper },
    );
    fireEvent.dblClick(screen.getByRole('button', { name: 'Notepad' }));

    // Assert
    expect(handleDoubleClick).toHaveBeenCalledWith('notepad', 'folder-123');
  });

  it('should call onDoubleClick when Enter key is pressed', () => {
    // Arrange
    const handleDoubleClick = vi.fn();

    // Act
    render(<DesktopIcon icon={makeIcon()} onDoubleClick={handleDoubleClick} onContextMenu={noop} />, { wrapper });
    fireEvent.keyDown(screen.getByRole('button', { name: 'Notepad' }), { key: 'Enter' });

    // Assert
    expect(handleDoubleClick).toHaveBeenCalledWith('notepad', undefined);
  });

  it('should position itself at the given x/y coordinates', () => {
    // Act
    const { container } = render(
      <DesktopIcon icon={makeIcon({ x: 50, y: 100 })} onDoubleClick={noop} onContextMenu={noop} />,
      { wrapper },
    );
    const root = container.querySelector('[role="button"]') as HTMLElement;

    // Assert
    expect(root.style.left).toBe('50px');
    expect(root.style.top).toBe('100px');
  });

  it('should call onContextMenu with nodeId on right-click when icon has nodeId', () => {
    // Arrange
    const handleContextMenu = vi.fn();

    // Act
    render(
      <DesktopIcon icon={makeIcon({ nodeId: 'node-abc' })} onDoubleClick={noop} onContextMenu={handleContextMenu} />,
      { wrapper },
    );
    fireEvent.contextMenu(screen.getByRole('button', { name: 'Notepad' }));

    // Assert
    expect(handleContextMenu).toHaveBeenCalledWith(expect.any(Object), 'node-abc');
  });

  it('should not trigger onContextMenu on right-click when icon has no nodeId', () => {
    // Arrange
    const handleContextMenu = vi.fn();

    // Act
    render(
      <DesktopIcon icon={makeIcon()} onDoubleClick={noop} onContextMenu={handleContextMenu} />,
      { wrapper },
    );
    fireEvent.contextMenu(screen.getByRole('button', { name: 'Notepad' }));

    // Assert
    expect(handleContextMenu).not.toHaveBeenCalled();
  });
});
