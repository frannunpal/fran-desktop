import type { FC } from 'react';
import { Text } from '@mantine/core';
import type { DesktopIconProps } from '@/Shared/Interfaces/IComponentProps';
import FileIcon from '@/Presentation/Components/FilesApp/components/FileIcon';
import classes from './DesktopIcon.module.css';

const DesktopIcon: FC<DesktopIconProps> = ({ icon, onDoubleClick, onContextMenu }) => {
  const hasCustomIcon = icon.iconName !== undefined;

  return (
    <div
      className={classes.root}
      style={{ left: icon.x, top: icon.y }}
      onDoubleClick={() => onDoubleClick(icon.appId, icon.nodeId)}
      onContextMenu={icon.nodeId ? e => onContextMenu(e, icon.nodeId!) : undefined}
      role="button"
      aria-label={icon.name}
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onDoubleClick(icon.appId, icon.nodeId)}
    >
      <span className={classes.iconImage} aria-hidden="true">
        {hasCustomIcon ? (
          <FileIcon
            type="folder"
            name={icon.name}
            folderNode={
              icon.iconName
                ? {
                    id: icon.id,
                    name: icon.name,
                    type: 'folder',
                    parentId: null,
                    children: [],
                    iconName: icon.iconName,
                    iconColor: icon.iconColor,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                  }
                : undefined
            }
            size={32}
          />
        ) : (
          icon.icon
        )}
      </span>
      <Text size="xs" className={classes.label} truncate>
        {icon.name}
      </Text>
    </div>
  );
};

export default DesktopIcon;
