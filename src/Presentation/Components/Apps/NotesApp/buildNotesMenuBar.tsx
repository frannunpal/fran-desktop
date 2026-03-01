import type { AppMenuElement } from '@/Shared/Interfaces/IAppMenuElement';

export const buildNotesMenuBar = (
  onNew: () => void,
  onOpen: () => void,
  onSave: () => void,
  onSaveAs: () => void,
  onExit: () => void,
  isDirty: boolean,
): AppMenuElement[] => [
  {
    type: 'menu',
    label: 'File',
    items: [
      { type: 'item', label: 'New', icon: 'FcEditImage', onClick: onNew },
      { type: 'item', label: 'Open', icon: 'FcOpenedFolder', onClick: onOpen },
      { type: 'divider' },
      { type: 'item', label: 'Save', icon: 'FcInspection', onClick: onSave, disabled: !isDirty },
      { type: 'item', label: 'Save As', icon: 'FcDeployment', onClick: onSaveAs },
      { type: 'divider' },
      { type: 'item', label: 'Exit', icon: 'FcLeft', onClick: onExit },
    ],
  },
];
