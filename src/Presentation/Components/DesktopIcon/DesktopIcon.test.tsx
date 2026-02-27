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

describe('DesktopIcon component', () => {
  it('should render the icon name', () => {
    // Act
    render(<DesktopIcon icon={makeIcon()} onDoubleClick={vi.fn()} />, { wrapper });

    // Assert
    expect(screen.getByText('Notepad')).toBeInTheDocument();
  });

  it('should render the icon image', () => {
    // Act
    render(<DesktopIcon icon={makeIcon()} onDoubleClick={vi.fn()} />, { wrapper });

    // Assert
    expect(screen.getByText('📝')).toBeInTheDocument();
  });

  it('should call onDoubleClick with appId when double-clicked', () => {
    // Arrange
    const handleDoubleClick = vi.fn();

    // Act
    render(<DesktopIcon icon={makeIcon()} onDoubleClick={handleDoubleClick} />, { wrapper });
    fireEvent.dblClick(screen.getByRole('button', { name: 'Notepad' }));

    // Assert
    expect(handleDoubleClick).toHaveBeenCalledWith('notepad');
  });

  it('should call onDoubleClick when Enter key is pressed', () => {
    // Arrange
    const handleDoubleClick = vi.fn();

    // Act
    render(<DesktopIcon icon={makeIcon()} onDoubleClick={handleDoubleClick} />, { wrapper });
    fireEvent.keyDown(screen.getByRole('button', { name: 'Notepad' }), { key: 'Enter' });

    // Assert
    expect(handleDoubleClick).toHaveBeenCalledWith('notepad');
  });

  it('should position itself at the given x/y coordinates', () => {
    // Act
    const { container } = render(
      <DesktopIcon icon={makeIcon({ x: 50, y: 100 })} onDoubleClick={vi.fn()} />,
      { wrapper },
    );
    const root = container.querySelector('[role="button"]') as HTMLElement;

    // Assert
    expect(root.style.left).toBe('50px');
    expect(root.style.top).toBe('100px');
  });
});
