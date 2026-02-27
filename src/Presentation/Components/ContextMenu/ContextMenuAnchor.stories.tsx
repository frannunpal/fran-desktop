import type { Meta, StoryObj } from '@storybook/react';
import type { FC } from 'react';
import { Menu } from '@mantine/core';
import ContextMenuAnchor from './ContextMenuAnchor';

const meta: Meta<typeof ContextMenuAnchor> = {
  title: 'Common components/ContextMenuAnchor',
  component: ContextMenuAnchor,
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof ContextMenuAnchor>;

const Wrapper: FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      width: 400,
      height: 300,
      background: '#f5f5f5',
      borderRadius: 8,
      position: 'relative',
    }}
  >
    <Menu opened position="bottom-start">
      {children}
      <Menu.Dropdown>
        <Menu.Item>Option 1</Menu.Item>
        <Menu.Item>Option 2</Menu.Item>
      </Menu.Dropdown>
    </Menu>
  </div>
);

export const AtPosition: Story = {
  render: () => (
    <Wrapper>
      <ContextMenuAnchor x={50} y={50} />
    </Wrapper>
  ),
};

export const AtCenter: Story = {
  render: () => (
    <Wrapper>
      <ContextMenuAnchor x={150} y={100} />
    </Wrapper>
  ),
};
