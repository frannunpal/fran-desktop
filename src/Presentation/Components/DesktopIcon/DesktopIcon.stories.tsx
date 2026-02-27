import type { Meta, StoryObj } from '@storybook/react';
import DesktopIcon from './DesktopIcon';
import { APPS } from '@shared/Constants/apps';
import { PRESET_ICONS } from '@shared/Constants/Icons';

const appIds = APPS.map(a => a.id);
const fileTypes = PRESET_ICONS.map(a => a);

const meta: Meta<typeof DesktopIcon> = {
  title: 'Common components/DesktopIcon',
  component: DesktopIcon,
  argTypes: {
    icon: { control: false },
  },
  decorators: [
    Story => (
      <div
        style={{
          position: 'relative',
          width: 200,
          height: 200,
          background: 'var(--mantine-color-body)',
        }}
      >
        <Story />
      </div>
    ),
  ],
};

export default meta;

// ── App icons (FcIcon resolved via APPS list) ────────────────────────────────

export const AppIcon: StoryObj<{ appId: string }> = {
  argTypes: {
    appId: { control: 'select', options: appIds },
  },
  args: { appId: 'notepad' },
  render: ({ appId }) => {
    const app = APPS.find(a => a.id === appId)!;
    return (
      <DesktopIcon
        icon={{ id: '1', name: app.name, icon: app.icon, x: 20, y: 20, appId }}
        onDoubleClick={() => {}}
        onContextMenu={() => {}}
      />
    );
  },
};

// ── File node (nodeId present → FileIcon) ────────────────────────────────────

export const FileNode: StoryObj<{ fileTypes: string }> = {
  argTypes: {
    fileTypes: { control: 'select', options: fileTypes },
  },
  args: { fileTypes: 'files' },
  render: ({ fileTypes }) => {
    const FileType = PRESET_ICONS.find(a => a === fileTypes)!;
    return (
      <DesktopIcon
        icon={{
          id: '2',
          name: 'FILE',
          icon: FileType,
          x: 20,
          y: 20,
          nodeId: 'node-1',
        }}
        onDoubleClick={() => {}}
        onContextMenu={() => {}}
      />
    );
  },
};

// ── Folder with custom icon (iconName from PRESET_ICONS) ─────────────────────

export const FolderCustomIcon: StoryObj<{ iconName: string; iconColor: string }> = {
  argTypes: {
    iconName: { control: 'select', options: PRESET_ICONS },
    iconColor: { control: 'color' },
  },
  args: { iconName: 'VscFolder', iconColor: '#4A90E2' },
  render: ({ iconName, iconColor }) => (
    <DesktopIcon
      icon={{
        id: '4',
        name: 'Projects',
        icon: '📁',
        x: 20,
        y: 20,
        appId: 'files',
        nodeId: 'node-2',
        iconName,
        iconColor,
      }}
      onDoubleClick={() => {}}
      onContextMenu={() => {}}
    />
  ),
};

// ── Edge cases ───────────────────────────────────────────────────────────────

export const LongName: StoryObj<{ name: string; appId: string }> = {
  argTypes: {
    name: { control: 'text' },
    appId: { control: 'select', options: appIds },
  },
  args: { name: 'Very Long Application Name', appId: 'files' },
  render: ({ name, appId }) => {
    const app = APPS.find(a => a.id === appId)!;
    return (
      <DesktopIcon
        icon={{ id: '5', name, icon: app.icon, x: 20, y: 20, appId }}
        onDoubleClick={() => {}}
        onContextMenu={() => {}}
      />
    );
  },
};
