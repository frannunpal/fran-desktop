import type { FC } from 'react';
import { Menu } from '@mantine/core';
import type { DesktopContextMenuProps } from '@/Shared/Interfaces/IComponentProps';
import { APPS } from '@shared/Constants/apps';
import ContextMenuAnchor from './ContextMenuAnchor';

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
      <ContextMenuAnchor x={position.x} y={position.y} />
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
