import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import IconColorPicker from './IconColorPicker';

const meta: Meta<typeof IconColorPicker> = {
  title: 'Shared/IconColorPicker',
  component: IconColorPicker,
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof IconColorPicker>;

const DefaultRender = () => {
  const [icon, setIcon] = useState('VscFolder');
  const [color, setColor] = useState('#228be6');
  return (
    <div
      style={{
        width: 340,
        padding: 16,
        background: 'var(--mantine-color-body)',
        borderRadius: 8,
      }}
    >
      <IconColorPicker
        selectedIcon={icon}
        selectedColor={color}
        onIconChange={setIcon}
        onColorChange={setColor}
      />
    </div>
  );
};

export const Default: Story = {
  render: () => <DefaultRender />,
};
