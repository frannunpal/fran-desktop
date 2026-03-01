import type { Meta, StoryObj } from '@storybook/react';
import NotesApp from './NotesApp';
import { makeWindow } from '@/Shared/Testing/Utils/makeWindow';
import AppWithPickerOpen from '@/Shared/Testing/Utils/AppWithPickerOpen';
import type { FolderNode } from '@/Shared/Interfaces/FolderNode';
import type { FileNode } from '@/Shared/Interfaces/FileNode';

const meta: Meta<typeof NotesApp> = {
  title: 'Apps/NotesApp',
  component: NotesApp,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof NotesApp>;

/* ── Shared nodes ─────────────────────────────────────────────────────── */

const notesFolder: FolderNode = {
  id: 'folder-notes',
  name: 'Notes',
  type: 'folder',
  parentId: null,
  children: ['file-welcome', 'file-todo'],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const fileWelcome: FileNode = {
  id: 'file-welcome',
  name: 'welcome.md',
  type: 'file',
  parentId: 'folder-notes',
  content: `# Welcome to NotesApp\n\nThis is a **markdown** editor powered by [TipTap](https://tiptap.dev).\n\n## Features\n\n- Rich text editing\n- *Italic*, **bold**, ~~strikethrough~~\n- \`inline code\` and code blocks\n- Bullet and ordered lists\n- Blockquotes\n\n> Write something great today.\n`,
  mimeType: 'text/markdown',
  url: undefined,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const fileTodo: FileNode = {
  id: 'file-todo',
  name: 'todo.md',
  type: 'file',
  parentId: 'folder-notes',
  content: `# TODO\n\n- [ ] Buy groceries\n- [ ] Write documentation\n- [x] Set up NotesApp\n`,
  mimeType: 'text/markdown',
  url: undefined,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const fsNodes = [notesFolder, fileWelcome, fileTodo];

/* ── Stories ──────────────────────────────────────────────────────────── */

export const EmptyEditor: Story = {
  render: () => (
    <AppWithPickerOpen
      win={makeWindow({
        id: 'win-notes',
        title: 'Notepad',
        content: 'notepad',
        fcIcon: 'FcEditImage',
        width: 700,
        height: 520,
        x: 0,
        y: 0,
      })}
      fsNodes={fsNodes}
    />
  ),
};

export const WithContent: Story = {
  render: () => (
    <AppWithPickerOpen
      win={makeWindow({
        id: 'win-notes-content',
        title: 'Notepad',
        content: 'notepad',
        fcIcon: 'FcEditImage',
        width: 700,
        height: 520,
        x: 0,
        y: 0,
        contentData: { initialContent: fileWelcome.content ?? '' },
      })}
      fsNodes={fsNodes}
    />
  ),
};

export const SmallWindow: Story = {
  render: () => (
    <AppWithPickerOpen
      win={makeWindow({
        id: 'win-notes-small',
        title: 'Notepad',
        content: 'notepad',
        fcIcon: 'FcEditImage',
        width: 360,
        height: 280,
        x: 0,
        y: 0,
        contentData: { initialContent: fileTodo.content ?? '' },
      })}
      fsNodes={fsNodes}
    />
  ),
};
