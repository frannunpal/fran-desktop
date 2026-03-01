// @vitest-environment jsdom
import '@/Shared/Testing/__mocks__/jsdom-setup';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { renderWithMantine as wrapper } from '@/Shared/Testing/Utils/renderWithMantine';
import { createLocalStorageMock } from '@/Shared/Testing/__mocks__/localStorage.mock';

const localStorageMock = createLocalStorageMock();
vi.stubGlobal('localStorage', localStorageMock);

vi.mock('./sections/WallpaperSettings', () => ({
  default: () => <div data-testid="wallpaper-section" />,
}));
vi.mock('./sections/AppearanceSettings', () => ({
  default: () => <div data-testid="appearance-section" />,
}));
vi.mock('./sections/LauncherSettings', () => ({
  default: () => <div data-testid="launcher-section" />,
}));
vi.mock('./sections/FontSettings', () => ({
  default: () => <div data-testid="font-section" />,
}));
vi.mock('@presentation/Components/Shared/AppIcon/AppIcon', () => ({
  default: ({ fcIcon }: { fcIcon: string }) => <span data-testid={`icon-${fcIcon}`} />,
}));

const { default: SettingsApp } = await import('./SettingsApp');

describe('SettingsApp', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('should render all section nav items in the sidebar including All Settings', () => {
    // Act
    render(<SettingsApp />, { wrapper });

    // Assert
    expect(screen.getByRole('button', { name: 'All Settings' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Wallpaper' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Appearance' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Launcher' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Font' })).toBeInTheDocument();
  });

  it('should show the overview grid when no section is active', () => {
    // Act
    render(<SettingsApp />, { wrapper });

    // Assert — overview cards present
    expect(screen.getByRole('button', { name: 'Open Wallpaper settings' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open Appearance settings' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open Launcher settings' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open Font settings' })).toBeInTheDocument();
  });

  it('should show WallpaperSection when Wallpaper nav item is clicked', () => {
    // Arrange
    render(<SettingsApp />, { wrapper });

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Wallpaper' }));

    // Assert
    expect(screen.getByTestId('wallpaper-section')).toBeInTheDocument();
  });

  it('should show AppearanceSection when Appearance nav item is clicked', () => {
    // Arrange
    render(<SettingsApp />, { wrapper });

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Appearance' }));

    // Assert
    expect(screen.getByTestId('appearance-section')).toBeInTheDocument();
  });

  it('should show LauncherSection when Launcher nav item is clicked', () => {
    // Arrange
    render(<SettingsApp />, { wrapper });

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Launcher' }));

    // Assert
    expect(screen.getByTestId('launcher-section')).toBeInTheDocument();
  });

  it('should show FontSection when Font nav item is clicked', () => {
    // Arrange
    render(<SettingsApp />, { wrapper });

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Font' }));

    // Assert
    expect(screen.getByTestId('font-section')).toBeInTheDocument();
  });

  it('should mark active nav item with aria-current="page"', () => {
    // Arrange
    render(<SettingsApp />, { wrapper });

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Font' }));

    // Assert
    expect(screen.getByRole('button', { name: 'Font' })).toHaveAttribute('aria-current', 'page');
  });

  it('should not have aria-current on inactive nav items', () => {
    // Arrange
    render(<SettingsApp />, { wrapper });
    fireEvent.click(screen.getByRole('button', { name: 'Font' }));

    // Assert
    expect(screen.getByRole('button', { name: 'Wallpaper' })).not.toHaveAttribute('aria-current');
  });

  it('should hide overview when a section is active', () => {
    // Arrange
    render(<SettingsApp />, { wrapper });
    fireEvent.click(screen.getByRole('button', { name: 'Launcher' }));

    // Assert — overview cards not present
    expect(
      screen.queryByRole('button', { name: 'Open Wallpaper settings' }),
    ).not.toBeInTheDocument();
  });

  it('should return to overview when All Settings is clicked after navigating to a section', () => {
    // Arrange
    render(<SettingsApp />, { wrapper });
    fireEvent.click(screen.getByRole('button', { name: 'Font' }));
    expect(screen.getByTestId('font-section')).toBeInTheDocument();

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'All Settings' }));

    // Assert
    expect(screen.queryByTestId('font-section')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Open Wallpaper settings' })).toBeInTheDocument();
  });

  it('should mark All Settings as active on initial render', () => {
    // Act
    render(<SettingsApp />, { wrapper });

    // Assert
    expect(screen.getByRole('button', { name: 'All Settings' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('should remove active state from All Settings when a section is selected', () => {
    // Arrange
    render(<SettingsApp />, { wrapper });

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Wallpaper' }));

    // Assert
    expect(screen.getByRole('button', { name: 'All Settings' })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('should navigate to section when overview card is clicked', () => {
    // Arrange
    render(<SettingsApp />, { wrapper });

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Open Appearance settings' }));

    // Assert
    expect(screen.getByTestId('appearance-section')).toBeInTheDocument();
  });
});
