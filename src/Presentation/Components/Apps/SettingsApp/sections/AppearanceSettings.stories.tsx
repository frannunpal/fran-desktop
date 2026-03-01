import type { Meta, StoryObj } from '@storybook/react';
import AppearanceSettings from './AppearanceSettings';
import { useSettingsStore } from '@/Presentation/Store/settingsStore';

const meta: Meta<typeof AppearanceSettings> = {
  title: 'Settings/Appearance',
  component: AppearanceSettings,
};

export default meta;
type Story = StoryObj<typeof AppearanceSettings>;

export const Default: Story = {};

export const DarkMode: Story = {
  decorators: [
    Story => {
      useSettingsStore.setState({
        theme: {
          mode: 'dark',
          desktop: '#1a1b1e',
          taskbar: 'rgba(26, 27, 30, 0.9)',
          window: '#25262b',
          accent: '#4dabf7',
        },
        themeSetManually: true,
      });
      return <Story />;
    },
  ],
};

export const CustomColors: Story = {
  decorators: [
    Story => {
      useSettingsStore.setState({
        theme: {
          mode: 'light',
          desktop: '#f0f4f8',
          taskbar: '#ff6b6b',
          window: '#f8f9fa',
          accent: '#ff922b',
        },
        themeSetManually: true,
        customThemeColors: { taskbar: '#ff6b6b', window: '#f8f9fa', accent: '#ff922b' },
      });
      return <Story />;
    },
  ],
};
