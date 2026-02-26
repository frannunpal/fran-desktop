import type { FC } from 'react';
import { Menu, Item, Separator } from 'react-contexify';
import 'react-contexify/dist/ReactContexify.css';
import type { DesktopContextMenuProps } from '@shared/Interfaces/ComponentProps';
import { APPS } from '@shared/Constants/apps';

export const DESKTOP_CONTEXT_MENU_ID = 'desktop-context-menu';

const CONTEXT_MENU_APPS = APPS.filter(a => a.id !== 'settings');

const ContextMenu: FC<DesktopContextMenuProps> = ({ onOpenApp, onToggleTheme }) => {
  return (
    <Menu id={DESKTOP_CONTEXT_MENU_ID}>
      {CONTEXT_MENU_APPS.map(app => (
        <Item key={app.id} onClick={() => onOpenApp(app.id)}>Open {app.name}</Item>
      ))}
      <Separator />
      <Item onClick={onToggleTheme}>Toggle Theme</Item>
    </Menu>
  );
};

export default ContextMenu;
