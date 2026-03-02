import type { FC } from 'react';
import type { WindowEntity } from '@/Shared/Interfaces/WindowEntity';
import type { WindowContentProps, MenuBarBuilder } from '@/Shared/Interfaces/IWindowContentProps';

import CalendarApp from '@presentation/Components/Apps/CalendarApp/CalendarApp';
import FilesApp from '@presentation/Components/Apps/FilesApp/FilesApp';
import PdfApp from '@presentation/Components/Apps/PdfApp/PdfApp';
import StorybookApp from '@presentation/Components/Apps/StorybookApp/StorybookApp';
import ImageViewerApp from '@presentation/Components/Apps/ImageViewerApp/ImageViewerApp';
import NotesApp from '@presentation/Components/Apps/NotesApp/NotesApp';
import SettingsApp from '@presentation/Components/Apps/SettingsApp/SettingsApp';
import CreateItemApp from '@presentation/Components/Shared/CreateItemApp/CreateItemApp';
import AppEmptyState from '@presentation/Components/Shared/AppEmptyState/AppEmptyState';

import { buildImageViewerMenuBar } from '@presentation/Components/Apps/ImageViewerApp/buildImageViewerMenuBar';
import { buildPdfViewerMenuBar } from '@presentation/Components/Apps/PdfApp/buildPdfViewerMenuBar';
import { buildNotesMenuBar } from '@presentation/Components/Apps/NotesApp/buildNotesMenuBar';
import { buildSettingsMenuBar } from '@presentation/Components/Apps/SettingsApp/buildSettingsMenuBar';

import { useDesktopStore } from '@presentation/Store/desktopStore';

type AppComponent = FC<WindowContentProps>;

interface AppRegistryEntry {
  component: AppComponent;
  buildMenuBar?: MenuBarBuilder;
}

const buildPdfMenuBar: MenuBarBuilder = (window: WindowEntity) => {
  const closeWindow = useDesktopStore.getState().closeWindow;
  return buildPdfViewerMenuBar(
    () => (window.contentData?.setPickerOpen as (() => void) | undefined)?.(),
    () => closeWindow(window.id),
  );
};

const buildImageViewerMenuBarFn: MenuBarBuilder = (window: WindowEntity) => {
  const closeWindow = useDesktopStore.getState().closeWindow;
  return buildImageViewerMenuBar(
    () => (window.contentData?.setPickerOpen as (() => void) | undefined)?.(),
    () => closeWindow(window.id),
  );
};

const buildNotesMenuBarFn: MenuBarBuilder = (window: WindowEntity) => {
  const closeWindow = useDesktopStore.getState().closeWindow;
  const actions = window.contentData?.actions as
    | { new: () => void; save: () => void; saveAs: () => void }
    | undefined;
  const isDirty = window.contentData?.isDirty as boolean | undefined;
  return buildNotesMenuBar(
    () => actions?.new(),
    () => (window.contentData?.setPickerOpen as (() => void) | undefined)?.(),
    () => actions?.save(),
    () => actions?.saveAs(),
    () => closeWindow(window.id),
    isDirty ?? false,
  );
};

const buildSettingsMenuBarFn: MenuBarBuilder = (window: WindowEntity) => {
  const closeWindow = useDesktopStore.getState().closeWindow;
  const actions = window.contentData?.actions as { discard: () => void } | undefined;
  const isDirty = window.contentData?.isDirty as boolean | undefined;
  return buildSettingsMenuBar(
    () => actions?.discard(),
    () => closeWindow(window.id),
    isDirty ?? false,
  );
};

const registry: Record<string, AppRegistryEntry> = {
  calendar: {
    component: CalendarApp,
  },
  files: {
    component: FilesApp,
  },
  pdf: {
    component: PdfApp,
    buildMenuBar: buildPdfMenuBar,
  },
  storybook: {
    component: StorybookApp,
  },
  'image-viewer': {
    component: ImageViewerApp,
    buildMenuBar: buildImageViewerMenuBarFn,
  },
  notepad: {
    component: NotesApp,
    buildMenuBar: buildNotesMenuBarFn,
  },
  createItem: {
    component: CreateItemApp,
  },
  terminal: {
    component: () => <AppEmptyState />,
  },
  settings: {
    component: SettingsApp,
    buildMenuBar: buildSettingsMenuBarFn,
  },
};

export const getAppComponent = (content: string): AppComponent => {
  return registry[content]?.component ?? AppEmptyState;
};

export const getMenuBarBuilder = (content: string): MenuBarBuilder | undefined => {
  return registry[content]?.buildMenuBar;
};
