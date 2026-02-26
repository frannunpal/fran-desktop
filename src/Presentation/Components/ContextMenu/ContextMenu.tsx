import type { FC } from 'react';
import { Menu, Item, Separator } from 'react-contexify';
import 'react-contexify/dist/ReactContexify.css';
import type { DesktopContextMenuProps } from '@shared/Interfaces/ComponentProps';

export const DESKTOP_CONTEXT_MENU_ID = 'desktop-context-menu';

const ContextMenu: FC<DesktopContextMenuProps> = ({ onOpenApp, onToggleTheme }) => {
  return (
    <Menu id={DESKTOP_CONTEXT_MENU_ID}>
      <Item onClick={() => onOpenApp('notepad')}>Open Notepad</Item>
      <Item onClick={() => onOpenApp('terminal')}>Open Terminal</Item>
      <Item onClick={() => onOpenApp('files')}>Open Files</Item>
      <Separator />
      <Item onClick={onToggleTheme}>Toggle Theme</Item>
    </Menu>
  );
};

export default ContextMenu;
