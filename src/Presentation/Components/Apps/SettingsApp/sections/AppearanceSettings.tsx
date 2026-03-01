import { type FC, useCallback } from 'react';
import { Stack, Text, SegmentedControl } from '@mantine/core';
import { useSettingsStore } from '@presentation/Store/settingsStore';
import type { ThemeMode } from '@/Shared/Interfaces/IThemeProvider';

const AppearanceSettings: FC = () => {
  const themeMode = useSettingsStore(state => state.theme.mode);
  const themeSetManually = useSettingsStore(state => state.themeSetManually);
  const setThemeMode = useSettingsStore(state => state.setThemeMode);
  const setThemeAutomatic = useSettingsStore(state => state.setThemeAutomatic);

  const currentValue: ThemeMode | 'system' = themeSetManually ? themeMode : 'system';

  const handleChange = useCallback(
    (value: string) => {
      if (value === 'system') {
        setThemeAutomatic();
      } else {
        setThemeMode(value as ThemeMode);
      }
    },
    [setThemeMode, setThemeAutomatic],
  );

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
        ]}
        aria-label="Theme mode"
      />
    </Stack>
  );
};

export default AppearanceSettings;
