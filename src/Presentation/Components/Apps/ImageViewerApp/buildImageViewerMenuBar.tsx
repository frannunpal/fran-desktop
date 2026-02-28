import type { AppMenuElement } from '@/Shared/Interfaces/IAppMenuElement';

export const buildImageViewerMenuBar = (
  onOpenPicker: () => void,
  onExit: () => void,
): AppMenuElement[] => [
  {
    type: 'menu',
    label: 'File',
    items: [
      { type: 'item', label: 'Open', icon: 'FcOpenedFolder', onClick: onOpenPicker },
      { type: 'divider' },
      { type: 'item', label: 'Exit', icon: 'FcLeft', onClick: onExit },
    ],
  },
];
