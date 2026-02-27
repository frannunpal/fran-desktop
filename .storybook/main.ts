import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: [],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  viteFinal: async config => {
    // When building for GitHub Pages, storybook lives at /fran-desktop/storybook/
    if (process.env.NODE_ENV === 'production') {
      config.base = '/fran-desktop/storybook/';
    }
    return config;
  },
};

export default config;
