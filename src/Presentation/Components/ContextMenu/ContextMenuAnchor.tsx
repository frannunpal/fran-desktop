import type { FC } from 'react';
import { Menu } from '@mantine/core';
import type { MenuPosition } from '@/Shared/Interfaces/IMenuPosition';

const ContextMenuAnchor: FC<MenuPosition> = ({ x, y }) => (
  <Menu.Target>
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        left: x,
        top: y,
        width: 0,
        height: 0,
        pointerEvents: 'none',
      }}
    />
  </Menu.Target>
);

export default ContextMenuAnchor;
