import type { Meta, StoryObj } from '@storybook/react';
import { useEffect } from 'react';
import NotesApp from './NotesApp';
import { buildNotesMenuBar } from './buildNotesMenuBar';
import { useDesktopStore } from '@presentation/Store/desktopStore';
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

/* ── Window definitions ───────────────────────────────────────────────── */

const win = makeWindow({
  id: 'win-notes',
  title: 'Notepad',
  fcIcon: 'FcEditImage',
  width: 700,
  height: 520,
  x: 0,
  y: 0,
});

const smallWin = makeWindow({
  id: 'win-notes-small',
  title: 'Notepad',
  fcIcon: 'FcEditImage',
  width: 360,
  height: 280,
  x: 0,
  y: 0,
});

/* ── Wrapper component ────────────────────────────────────────────────── */

const NotesInWindow = ({
  initialContent,
  pickerOpen = false,
  windowDef = win,
}: {
  initialContent?: string;
  pickerOpen?: boolean;
  windowDef?: typeof win;
}) => {
  useEffect(() => {
    useDesktopStore.setState({
      fsNodes: [notesFolder, fileWelcome, fileTodo],
      windows: [windowDef],
    });
  }, [windowDef]);

  return (
    <AppWithPickerOpen
      win={windowDef}
      menuBar={buildNotesMenuBar(
        () => {},
        () => {},
        () => {},
        () => {},
        () => {},
        false,
      )}
    >
      <NotesApp
        contentData={initialContent ? { initialContent } : undefined}
        windowId={windowDef.id}
        pickerOpen={pickerOpen}
        onPickerClose={() => {}}
        onRegisterActions={() => {}}
      />
    </AppWithPickerOpen>
  );
};

/* ── Stories ──────────────────────────────────────────────────────────── */

export const EmptyEditor: Story = {
  render: () => <NotesInWindow />,
};

export const WithContent: Story = {
  render: () => <NotesInWindow initialContent={fileWelcome.content ?? ''} />,
};

export const WithPickerOpen: Story = {
  render: () => <NotesInWindow initialContent={fileWelcome.content ?? ''} pickerOpen={true} />,
};

export const SmallWindow: Story = {
  render: () => <NotesInWindow initialContent={fileTodo.content ?? ''} windowDef={smallWin} />,
};
