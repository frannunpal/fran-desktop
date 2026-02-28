import type { ReactNode, MouseEvent } from 'react';
import type { WindowEntity } from '@/Shared/Interfaces/WindowEntity';
import type { DesktopIconEntity } from '@/Shared/Interfaces/IDesktopIcon';
import type { MenuPosition } from '@/Shared/Interfaces/IMenuPosition';
import type { AppMenuElement } from '@/Shared/Interfaces/IAppMenuElement';

export interface WindowProps {
  window: WindowEntity;
  menuBar?: AppMenuElement[];
  children?: ReactNode;
}

export interface DesktopIconProps {
  icon: DesktopIconEntity;
  onDoubleClick: (appId: string, nodeId?: string) => void;
  onContextMenu: (e: React.MouseEvent, nodeId: string) => void;
}

export interface DesktopContextMenuProps {
  opened: boolean;
  position: MenuPosition;
  onClose: () => void;
  onOpenApp: (appId: string) => void;
  onToggleTheme: () => void;
}

export interface LauncherProps {
  fcIcon?: string;
}

export interface DesktopAreaProps {
  children?: ReactNode;
  onContextMenu?: (e: MouseEvent<HTMLDivElement>) => void;
}

export interface TaskbarContextMenuProps {
  windowMenuOpened: boolean;
  panelMenuOpened: boolean;
  menuPosition: MenuPosition;
  targetWindowId: string | null;
  targetWindowState: string | null;
  onCloseWindow: (id: string) => void;
  onMinimizeWindow: (id: string) => void;
  onMaximizeWindow: (id: string) => void;
  onRestoreWindow: (id: string) => void;
  onWindowMenuClose: () => void;
  onPanelMenuClose: () => void;
}
