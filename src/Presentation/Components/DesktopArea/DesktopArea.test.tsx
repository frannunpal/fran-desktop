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

  it('should apply the desktop background color from the store theme', () => {
    // Arrange
    useDesktopStore.getState().setThemeMode('light');

    // Act
    const { container } = render(<DesktopArea />);
    const root = container.firstChild as HTMLElement;

    // Assert
    expect(root.style.background).toBe('rgb(240, 244, 248)');
  });

  it('should update background when theme switches to dark', () => {
    // Arrange
    useDesktopStore.getState().setThemeMode('dark');

    // Act
    const { container } = render(<DesktopArea />);
    const root = container.firstChild as HTMLElement;

    // Assert
    expect(root.style.background).toBe('rgb(26, 27, 30)');
  });
});
