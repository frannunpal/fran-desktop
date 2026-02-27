import type { FC } from 'react';
import { Text } from '@mantine/core';
import type { DesktopIconProps } from '@/Shared/Interfaces/IComponentProps';
import FileIcon from '@/Presentation/Components/FilesApp/components/FileIcon';
import { APPS } from '@shared/Constants/apps';
import { useFcIcon } from '@/Presentation/Hooks/useFcIcon';
import classes from './DesktopIcon.module.css';

const DesktopIcon: FC<DesktopIconProps> = ({ icon, onDoubleClick, onContextMenu }) => {
  const app = APPS.find(a => a.id === icon.appId);
  const hasCustomIcon = icon.iconName !== undefined;
  const isFileIcon = icon.nodeId !== undefined;
  const isPdf = icon.appId === 'pdf';
  const FcIcon = useFcIcon(app?.fcIcon ?? '');

  const renderIcon = () => {
    if (hasCustomIcon) {
      return (
        <FileIcon
          type="folder"
          name={icon.name}
          folderNode={{
            id: icon.id,
            name: icon.name,
            type: 'folder',
            parentId: null,
            children: [],
            iconName: icon.iconName,
            iconColor: icon.iconColor,
            createdAt: new Date(),
            updatedAt: new Date(),
          }}
          size={32}
        />
      );
    }

    if (isFileIcon || isPdf) {
      return <FileIcon type="file" name={icon.name} size={32} />;
    }

    if (FcIcon) {
      return <FcIcon size={32} />;
    }

    return icon.icon;
  };

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
        {renderIcon()}
      </span>
      <Text size="xs" className={classes.label} truncate>
        {icon.name}
      </Text>
    </div>
  );
};

export default DesktopIcon;
