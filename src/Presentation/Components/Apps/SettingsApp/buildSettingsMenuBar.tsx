import type { AppMenuElement } from '@/Shared/Interfaces/IAppMenuElement';
import { createElement } from 'react';
import { FcSynchronize } from 'react-icons/fc';

export const buildSettingsMenuBar = (
  onDiscard: () => void,
  onExit: () => void,
  isDirty: boolean,
): AppMenuElement[] => [
  {
    type: 'menu',
    label: 'File',
    items: [
      {
        type: 'item',
        label: 'Discard Changes',
        icon: 'FcCancel',
        onClick: onDiscard,
        disabled: !isDirty,
      },
      { type: 'divider' },
      { type: 'item', label: 'Exit', icon: 'FcLeft', onClick: onExit },
    ],
    rightSection: isDirty
      ? createElement(
          'span',
          {
            style: {
              color: 'orange',
              fontWeight: 'bold',
              marginLeft: '8px',
              display: 'flex',
              alignItems: 'center',
            },
            title: 'Unsaved changes',
          },
          createElement(FcSynchronize),
        )
      : undefined,
  },
];
