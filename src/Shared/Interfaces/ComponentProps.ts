import type { ReactNode, MouseEvent } from 'react';
import type { IconType } from 'react-icons';
import type { WindowEntity } from '@domain/Entities/Window';
import type { DesktopIconEntity } from '@domain/Entities/DesktopIcon';

export interface WindowProps {
  window: WindowEntity;
  children?: ReactNode;
}

export interface DesktopIconProps {
  icon: DesktopIconEntity;
  onDoubleClick: (appId: string) => void;
}

export interface DesktopContextMenuProps {
  opened: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  onOpenApp: (appId: string) => void;
  onToggleTheme: () => void;
}

export interface LauncherProps {
  icon?: IconType;
}

export interface DesktopAreaProps {
  children?: ReactNode;
  onContextMenu?: (e: MouseEvent<HTMLDivElement>) => void;
}

export interface TaskbarContextMenuProps {
  windowMenuOpened: boolean;
  panelMenuOpened: boolean;
  menuPosition: { x: number; y: number };
  targetWindowId: string | null;
  onCloseWindow: (id: string) => void;
  onWindowMenuClose: () => void;
  onPanelMenuClose: () => void;
}
