import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import ColorPicker from './ColorPicker';

const meta: Meta<typeof ColorPicker> = {
  title: 'Shared/ColorPicker',
  component: ColorPicker,
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof ColorPicker>;

const ControlledColorPicker = (args: React.ComponentProps<typeof ColorPicker>) => {
  const [value, setValue] = useState(args.value);
  return <ColorPicker {...args} value={value} onChange={setValue} />;
};

export const Default: Story = {
  render: args => <ControlledColorPicker {...args} />,
  args: { value: '#228be6' },
};

export const WithPreselectedColor: Story = {
  render: args => <ControlledColorPicker {...args} />,
  args: { value: '#fa5252' },
};

export const WithError: Story = {
  render: args => <ControlledColorPicker {...args} />,
  args: { value: 'notacolor', error: 'Invalid color value' },
};
