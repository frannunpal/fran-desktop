// @vitest-environment jsdom
import '@/Shared/Testing/__mocks__/jsdom-setup';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { renderWithMantine as wrapper } from '@/Shared/Testing/Utils/renderWithMantine';
import { createLocalStorageMock } from '@/Shared/Testing/__mocks__/localStorage.mock';

const localStorageMock = createLocalStorageMock();
vi.stubGlobal('localStorage', localStorageMock);

const { useSettingsStore } = await import('@presentation/Store/settingsStore');
const { default: AppearanceSettings } = await import('./AppearanceSettings');

describe('AppearanceSettings', () => {
  beforeEach(() => {
    localStorageMock.clear();
    useSettingsStore.setState({
      theme: {
        mode: 'light',
        desktop: '#f0f4f8',
        taskbar: 'rgba(255, 255, 255, 0.9)',
        window: '#ffffff',
        accent: '#339af0',
      },
      themeSetManually: false,
      customThemeColors: null,
    });
  });

  it('renders all theme mode options', () => {
    render(<AppearanceSettings />, { wrapper });

    expect(screen.getByRole('radio', { name: 'Light' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Dark' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'System' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Custom' })).toBeInTheDocument();
  });

  it('selects System by default when themeSetManually is false', () => {
    render(<AppearanceSettings />, { wrapper });

    expect(screen.getByRole('radio', { name: 'System' })).toBeChecked();
  });

  it('selects Light when themeSetManually is true and mode is light', () => {
    useSettingsStore.setState({
      themeSetManually: true,
      theme: { mode: 'light', desktop: '', taskbar: '', window: '', accent: '' },
    });

    render(<AppearanceSettings />, { wrapper });

    expect(screen.getByRole('radio', { name: 'Light' })).toBeChecked();
  });

  it('selects Dark when themeSetManually is true and mode is dark', () => {
    useSettingsStore.setState({
      themeSetManually: true,
      theme: { mode: 'dark', desktop: '', taskbar: '', window: '', accent: '' },
    });

    render(<AppearanceSettings />, { wrapper });

    expect(screen.getByRole('radio', { name: 'Dark' })).toBeChecked();
  });

  it('calls setThemeAutomatic when System is selected', () => {
    useSettingsStore.setState({
      themeSetManually: true,
      theme: { mode: 'light', desktop: '', taskbar: '', window: '', accent: '' },
    });

    render(<AppearanceSettings />, { wrapper });

    fireEvent.click(screen.getByRole('radio', { name: 'System' }));

    expect(useSettingsStore.getState().themeSetManually).toBe(false);
  });

  it('calls setThemeMode when Light is selected', () => {
    useSettingsStore.setState({
      themeSetManually: false,
    });

    render(<AppearanceSettings />, { wrapper });

    fireEvent.click(screen.getByRole('radio', { name: 'Light' }));

    expect(useSettingsStore.getState().theme.mode).toBe('light');
    expect(useSettingsStore.getState().themeSetManually).toBe(true);
  });

  it('calls setThemeMode when Dark is selected', () => {
    useSettingsStore.setState({
      themeSetManually: false,
    });

    render(<AppearanceSettings />, { wrapper });

    fireEvent.click(screen.getByRole('radio', { name: 'Dark' }));

    expect(useSettingsStore.getState().theme.mode).toBe('dark');
    expect(useSettingsStore.getState().themeSetManually).toBe(true);
  });

  it('shows color pickers when Custom is selected', () => {
    useSettingsStore.setState({
      customThemeColors: {
        taskbar: '#339af0',
        window: '#ffffff',
        accent: '#339af0',
      },
    });

    render(<AppearanceSettings />, { wrapper });

    expect(screen.getByText('Taskbar')).toBeInTheDocument();
    expect(screen.getByText('Window')).toBeInTheDocument();
    expect(screen.getByText('Accent')).toBeInTheDocument();
  });

  it('shows color pickers but disabled when System is selected', () => {
    render(<AppearanceSettings />, { wrapper });

    expect(screen.getByText('Taskbar')).toBeInTheDocument();
    expect(screen.getByText('Window')).toBeInTheDocument();
    expect(screen.getByText('Accent')).toBeInTheDocument();

    const colorInputs = screen.getAllByPlaceholderText('Custom color');
    expect(colorInputs[0]).toBeDisabled();
    expect(colorInputs[1]).toBeDisabled();
    expect(colorInputs[2]).toBeDisabled();
  });

  it('initializes customThemeColors when Custom is selected', async () => {
    const setCustomThemeColors = vi.fn();
    useSettingsStore.setState({
      setCustomThemeColors,
      themeSetManually: true,
      theme: { mode: 'light', desktop: '', taskbar: '', window: '', accent: '' },
    });

    render(<AppearanceSettings />, { wrapper });

    fireEvent.click(screen.getByRole('radio', { name: 'Custom' }));

    await vi.waitFor(() => {
      expect(setCustomThemeColors).toHaveBeenCalledWith({
        taskbar: '#339af0',
        window: '#ffffff',
        accent: '#339af0',
      });
    });
  });

  it('updates customThemeColors when color is changed', () => {
    useSettingsStore.setState({
      customThemeColors: {
        taskbar: '#339af0',
        window: '#ffffff',
        accent: '#339af0',
      },
    });

    const setCustomThemeColors = vi.fn();
    useSettingsStore.setState({ setCustomThemeColors });

    render(<AppearanceSettings />, { wrapper });

    const taskbarInputs = screen.getAllByPlaceholderText('Custom color');
    const taskbarInput = taskbarInputs[0];

    fireEvent.change(taskbarInput, { target: { value: '#ff0000' } });

    expect(setCustomThemeColors).toHaveBeenCalledWith({
      taskbar: '#ff0000',
      window: '#ffffff',
      accent: '#339af0',
    });
  });

  it('selects Custom when customThemeColors is set', () => {
    useSettingsStore.setState({
      customThemeColors: {
        taskbar: '#ff0000',
        window: '#00ff00',
        accent: '#0000ff',
      },
    });

    render(<AppearanceSettings />, { wrapper });

    expect(screen.getByRole('radio', { name: 'Custom' })).toBeChecked();
    expect(screen.getByText('Taskbar')).toBeInTheDocument();
  });
});
