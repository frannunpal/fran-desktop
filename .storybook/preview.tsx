import type { Preview } from '@storybook/react';
import { MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';

const preview: Preview = {
  decorators: [
    Story => (
      <MantineProvider>
        <Story />
      </MantineProvider>
    ),
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