import { type FC, useCallback } from 'react';
import { Stack, Text, SegmentedControl, Box } from '@mantine/core';
import { useSettingsStore } from '@presentation/Store/settingsStore';
import ColorPicker from '@presentation/Components/Shared/ColorPicker/ColorPicker';
import type { ThemeMode } from '@/Shared/Interfaces/IThemeProvider';

type ThemeValue = ThemeMode | 'system' | 'custom';

const AppearanceSettings: FC = () => {
  const themeMode = useSettingsStore(state => state.theme.mode);
  const themeSetManually = useSettingsStore(state => state.themeSetManually);
  const customThemeColors = useSettingsStore(state => state.customThemeColors);
  const setThemeMode = useSettingsStore(state => state.setThemeMode);
  const setThemeAutomatic = useSettingsStore(state => state.setThemeAutomatic);
  const setCustomThemeColors = useSettingsStore(state => state.setCustomThemeColors);

  const currentValue: ThemeValue = customThemeColors
    ? 'custom'
    : themeSetManually
      ? themeMode
      : 'system';

  const handleChange = useCallback(
    (value: string) => {
      if (value === 'system') {
        setThemeAutomatic();
        setCustomThemeColors(null);
      } else if (value === 'custom') {
        setCustomThemeColors({
          taskbar: '#339af0',
          window: '#ffffff',
          accent: '#339af0',
        });
      } else {
        setThemeMode(value as ThemeMode);
        setCustomThemeColors(null);
      }
    },
    [setThemeMode, setThemeAutomatic, setCustomThemeColors],
  );

  const handleColorChange = useCallback(
    (key: 'taskbar' | 'window' | 'accent') => (color: string) => {
      if (customThemeColors) {
        setCustomThemeColors({ ...customThemeColors, [key]: color });
      }
    },
    [customThemeColors, setCustomThemeColors],
  );

  const isCustom = currentValue === 'custom';

  return (
    <Stack gap="md" p="md">
      <Text fw={600} size="lg">
        Appearance
      </Text>
      <Text size="sm" c="dimmed">
        Choose whether the desktop uses a light or dark theme, or follows the system preference.
      </Text>
      <SegmentedControl
        value={currentValue}
        onChange={handleChange}
        data={[
          { label: 'Light', value: 'light' },
          { label: 'Dark', value: 'dark' },
          { label: 'System', value: 'system' },
          { label: 'Custom', value: 'custom' },
        ]}
        aria-label="Theme mode"
      />
      <Stack gap="sm" mt="md">
        <Box>
          <Text size="sm" fw={500} mb="xs" c={isCustom ? 'dark' : undefined}>
            Taskbar
          </Text>
          <ColorPicker
            value={customThemeColors?.taskbar ?? '#339af0'}
            onChange={handleColorChange('taskbar')}
            disabled={!isCustom}
          />
        </Box>
        <Box>
          <Text size="sm" fw={500} mb="xs" c={isCustom ? 'dark' : undefined}>
            Window
          </Text>
          <ColorPicker
            value={customThemeColors?.window ?? '#ffffff'}
            onChange={handleColorChange('window')}
            disabled={!isCustom}
          />
        </Box>
        <Box>
          <Text size="sm" fw={500} mb="xs" c={isCustom ? 'dark' : undefined}>
            Accent
          </Text>
          <ColorPicker
            value={customThemeColors?.accent ?? '#339af0'}
            onChange={handleColorChange('accent')}
            disabled={!isCustom}
          />
        </Box>
      </Stack>
    </Stack>
  );
};

export default AppearanceSettings;
