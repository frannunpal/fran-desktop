// @vitest-environment jsdom
import '@application/__mocks__/jsdom-setup';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createLocalStorageMock } from '@application/__mocks__/localStorage.mock';

const localStorageMock = createLocalStorageMock();
vi.stubGlobal('localStorage', localStorageMock);

const { useDesktopStore } = await import('@presentation/Store/desktopStore');
const { default: DesktopArea } = await import('./DesktopArea');

describe('DesktopArea', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    useDesktopStore.getState().setThemeMode('light');
    useDesktopStore.setState({ windows: [], icons: [], fsNodes: [] });
  });

  it('should render its children', () => {
    // Act
    render(
      <DesktopArea>
        <span>child content</span>
      </DesktopArea>,
    );

    // Assert
    expect(screen.getByText('child content')).toBeInTheDocument();
  });

  it('should apply the wallpaper and desktop color from the store theme in light mode', () => {
    // Arrange
    useDesktopStore.getState().setThemeMode('light');

    // Act
    const { container } = render(<DesktopArea />);
    const root = container.firstChild as HTMLElement;

    // Assert
    expect(root.style.backgroundImage).toBe('url("/wallpaper.jpg")');
    expect(root.style.backgroundColor).toBe('rgb(240, 244, 248)');
  });

  it('should apply the wallpaper and desktop color from the store theme in dark mode', () => {
    // Arrange
    useDesktopStore.getState().setThemeMode('dark');

    // Act
    const { container } = render(<DesktopArea />);
    const root = container.firstChild as HTMLElement;

    // Assert
    expect(root.style.backgroundImage).toBe('url("/wallpaper.jpg")');
    expect(root.style.backgroundColor).toBe('rgb(26, 27, 30)');
  });
});
