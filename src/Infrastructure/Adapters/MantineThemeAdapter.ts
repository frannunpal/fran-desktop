import type { MantineThemeOverride } from '@mantine/core';
import type { Theme } from '@application/Ports/IThemeProvider';

export const toMantineTheme = (theme: Theme): MantineThemeOverride => ({
  primaryColor: 'blue',
  other: {
    desktop: theme.desktop,
    taskbar: theme.taskbar,
    window: theme.window,
    accent: theme.accent,
  },
});
