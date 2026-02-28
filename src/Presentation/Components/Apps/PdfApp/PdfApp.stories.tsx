import type { Meta, StoryObj } from '@storybook/react';
import { useEffect } from 'react';
import PdfApp from './PdfApp';
import { buildPdfViewerMenuBar } from './buildPdfViewerMenuBar';
import { useDesktopStore } from '@presentation/Store/desktopStore';
import { makeWindow } from '@/Shared/Testing/Utils/makeWindow';
import AppWithPickerOpen from '@/Shared/Testing/Utils/AppWithPickerOpen';
import type { FolderNode } from '@/Shared/Interfaces/FolderNode';
import type { FileNode } from '@/Shared/Interfaces/FileNode';

const meta: Meta<typeof PdfApp> = {
  title: 'Apps/PdfApp',
  component: PdfApp,
  parameters: { layout: 'fullscreen' },
};

export default meta;
type Story = StoryObj<typeof PdfApp>;

/* ── Shared nodes ─────────────────────────────────────────────────────── */

const documentsFolder: FolderNode = {
  id: 'folder-documents',
  name: 'Documents',
  type: 'folder',
  parentId: null,
  children: ['file-cv'],
  createdAt: new Date(),
  updatedAt: new Date(),
};
const cvPdf: FileNode = {
  id: 'file-cv',
  name: 'CV_2026_English.pdf',
  type: 'file',
  parentId: 'folder-documents',
  content: '',
  mimeType: 'application/pdf',
  url: `${import.meta.env.BASE_URL}Desktop/CV_2026_English.pdf`,
  createdAt: new Date(),
  updatedAt: new Date(),
};

/* ── Window wrapper ───────────────────────────────────────────────────── */

const win = makeWindow({
  id: 'win-pdf-viewer',
  title: 'PDF Viewer',
  fcIcon: 'FcDocument',
  width: 780,
  height: 580,
  x: 0,
  y: 0,
});

const PdfInWindow = ({ pickerOpen = false }: { pickerOpen?: boolean }) => {
  useEffect(() => {
    useDesktopStore.setState({
      fsNodes: [documentsFolder, cvPdf],
      windows: [win],
    });
  }, []);

  return (
    <AppWithPickerOpen
      win={win}
      menuBar={buildPdfViewerMenuBar(
        () => {},
        () => {},
      )}
    >
      <PdfApp
        src={`${import.meta.env.BASE_URL}Desktop/CV_2026_English.pdf`}
        windowId={win.id}
        pickerOpen={pickerOpen}
        onPickerClose={() => {}}
      />
    </AppWithPickerOpen>
  );
};

/* ── Stories ──────────────────────────────────────────────────────────── */

export const Default: Story = {
  render: () => <PdfInWindow />,
};

export const WithPickerOpen: Story = {
  render: () => <PdfInWindow pickerOpen={true} />,
};
