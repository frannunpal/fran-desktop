// @vitest-environment jsdom
import '@/Shared/Testing/__mocks__/jsdom-setup';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createLocalStorageMock } from '@/Shared/Testing/__mocks__/localStorage.mock';
import { resetDesktopStore } from '@/Shared/Testing/Utils/resetDesktopStore';

const localStorageMock = createLocalStorageMock();
vi.stubGlobal('localStorage', localStorageMock);

const { useDesktopStore } = await import('@presentation/Store/desktopStore');
const { useSettingsStore } = await import('@presentation/Store/settingsStore');
const { default: DesktopArea } = await import('./DesktopArea');

describe('DesktopArea', () => {
  beforeEach(() => {
    resetDesktopStore(useDesktopStore, localStorageMock);
    useSettingsStore.getState().setThemeMode('light');
    useSettingsStore.setState({ themeSetManually: false, wallpaper: null });
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
    useSettingsStore.getState().setThemeMode('light');

    // Act
    const { container } = render(<DesktopArea />);
    const root = container.firstChild as HTMLElement;

    // Assert
    expect(root.style.backgroundImage).toBe('url("/Images/wallpaper.jpg")');
    expect(root.style.backgroundColor).toBe('rgb(240, 244, 248)');
  });

  it('should apply the wallpaper and desktop color from the store theme in dark mode', () => {
    // Arrange
    useSettingsStore.getState().setThemeMode('dark');

    // Act
    const { container } = render(<DesktopArea />);
    const root = container.firstChild as HTMLElement;

    // Assert
    expect(root.style.backgroundImage).toBe('url("/Images/wallpaper.jpg")');
    expect(root.style.backgroundColor).toBe('rgb(26, 27, 30)');
  });
});
