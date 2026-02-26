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
  onCloseWindow: (id: string) => void;
}
