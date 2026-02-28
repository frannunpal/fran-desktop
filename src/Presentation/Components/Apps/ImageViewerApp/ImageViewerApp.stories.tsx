import type { Decorator, Meta, StoryObj } from '@storybook/react';
import ImageViewerApp from './ImageViewerApp';

const meta: Meta<typeof ImageViewerApp> = {
  title: 'Apps/ImageViewerApp',
  component: ImageViewerApp,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    src: {
      control: 'select',
      options: [
        `${import.meta.env.BASE_URL}Images/wallpaper.jpg`,
        `${import.meta.env.BASE_URL}Images/wallpaper2.jpg`,
      ],
    },
  },
};

export default meta;
type Story = StoryObj<typeof ImageViewerApp>;

const windowDecorator = (width: number, height: number) =>
  ((Story: React.ComponentType) => (
    <div
      style={{
        width,
        height,
        border: '1px solid rgba(128,128,128,0.2)',
        borderRadius: 8,
        overflow: 'hidden',
        background: '#1a1a1a',
      }}
    >
      <Story />
    </div>
  )) as Decorator;

export const WithImage: Story = {
  args: { src: `${import.meta.env.BASE_URL}Images/wallpaper.jpg` },
  decorators: [windowDecorator(700, 520)],
};

export const NoImage: Story = {
  args: {},
  decorators: [windowDecorator(700, 520)],
};

export const SmallWindow: Story = {
  args: { src: `${import.meta.env.BASE_URL}Images/wallpaper.jpg` },
  decorators: [windowDecorator(300, 200)],
};
