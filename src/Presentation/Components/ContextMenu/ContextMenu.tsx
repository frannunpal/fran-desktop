import type { FC } from 'react';
import { Menu } from '@mantine/core';
import type { DesktopContextMenuProps } from '@shared/Interfaces/ComponentProps';
import { APPS } from '@shared/Constants/apps';

const CONTEXT_MENU_APPS = APPS.filter(a => a.id !== 'settings');

const ContextMenu: FC<DesktopContextMenuProps> = ({
  opened,
  position,
  onClose,
  onOpenApp,
  onToggleTheme,
}) => {
  return (
    <Menu
      opened={opened}
      onClose={onClose}
      closeOnClickOutside
      closeOnEscape
      closeOnItemClick
      withinPortal
    >
      <Menu.Target>
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            left: position.x,
            top: position.y,
            width: 0,
            height: 0,
            pointerEvents: 'none',
          }}
        />
      </Menu.Target>
      <Menu.Dropdown>
        {CONTEXT_MENU_APPS.map(app => (
          <Menu.Item key={app.id} onClick={() => onOpenApp(app.id)}>
            Open {app.name}
          </Menu.Item>
        ))}
        <Menu.Divider />
        <Menu.Item onClick={onToggleTheme}>Toggle Theme</Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
};

export default ContextMenu;
