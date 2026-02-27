import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { Button } from '@mantine/core';
import CreateItemModal from './CreateItemModal';

const meta: Meta<typeof CreateItemModal> = {
  title: 'Shared/CreateItemModal',
  component: CreateItemModal,
  parameters: { layout: 'centered' },
};

export default meta;
type Story = StoryObj<typeof CreateItemModal>;

export const NewFolder: Story = {
  render: () => {
    const [opened, setOpened] = useState(false);
    const [result, setResult] = useState('');
    return (
      <div>
        <Button onClick={() => setOpened(true)}>Create Folder</Button>
        <CreateItemModal
          opened={opened}
          mode="folder"
          currentPath="/home/Desktop"
          onClose={() => setOpened(false)}
          onConfirm={(name, icon, color) => {
            setResult(`Created folder: ${name} (${icon ?? 'default'}, ${color ?? 'default'})`);
            setOpened(false);
          }}
        />
        {result && <p style={{ marginTop: 8 }}>{result}</p>}
      </div>
    );
  },
};

export const NewFile: Story = {
  render: () => {
    const [opened, setOpened] = useState(false);
    const [result, setResult] = useState('');
    return (
      <div>
        <Button onClick={() => setOpened(true)}>Create File</Button>
        <CreateItemModal
          opened={opened}
          mode="file"
          currentPath="/home/Desktop"
          onClose={() => setOpened(false)}
          onConfirm={name => {
            setResult(`Created file: ${name}`);
            setOpened(false);
          }}
        />
        {result && <p style={{ marginTop: 8 }}>{result}</p>}
      </div>
    );
  },
};
