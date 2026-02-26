import { useState } from 'react';
import type { MouseEvent } from 'react';
import type { MenuPosition } from '@shared/Interfaces/MenuPosition';

interface UseContextMenuReturn {
  opened: boolean;
  position: MenuPosition;
  open: (e: MouseEvent, offsetY?: number) => void;
  close: () => void;
}

export const useContextMenu = (offsetY = 0): UseContextMenuReturn => {
  const [opened, setOpened] = useState(false);
  const [position, setPosition] = useState<MenuPosition>({ x: 0, y: 0 });

  const open = (e: MouseEvent, customOffsetY?: number) => {
    e.preventDefault();
    setPosition({ x: e.clientX, y: e.clientY + (customOffsetY ?? offsetY) });
    setOpened(true);
  };

  const close = () => setOpened(false);

  return { opened, position, open, close };
};
