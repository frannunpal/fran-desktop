import type { Preview } from '@storybook/react';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import { useEffect } from 'react';
import { useSettingsStore } from '../src/Presentation/Store/settingsStore';

const preview: Preview = {
  globalTypes: {
    colorScheme: {
      description: 'Color scheme',
      toolbar: {
        title: 'Color scheme',
        icon: 'circlehollow',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    colorScheme: 'dark',
  },
  decorators: [
    (Story, context) => {
      const colorScheme = (context.globals.colorScheme ?? 'dark') as 'light' | 'dark';

      useEffect(() => {
        useSettingsStore.getState().setThemeMode(colorScheme);
      }, [colorScheme]);

      return (
        <MantineProvider forceColorScheme={colorScheme}>
          <Story />
        </MantineProvider>
      );
    },
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
