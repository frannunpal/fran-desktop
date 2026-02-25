import type { FC } from 'react';
import { Text } from '@mantine/core';
import type { DesktopIconEntity } from '@domain/Entities/DesktopIcon';
import classes from './DesktopIcon.module.css';

interface DesktopIconProps {
  icon: DesktopIconEntity;
  onDoubleClick: (appId: string) => void;
}

const DesktopIcon: FC<DesktopIconProps> = ({ icon, onDoubleClick }) => {
  return (
    <div
      className={classes.root}
      style={{ left: icon.x, top: icon.y }}
      onDoubleClick={() => onDoubleClick(icon.appId)}
      role="button"
      aria-label={icon.name}
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onDoubleClick(icon.appId)}
    >
      <span className={classes.iconImage} aria-hidden="true">
        {icon.icon}
      </span>
      <Text size="xs" className={classes.label} truncate>
        {icon.name}
      </Text>
    </div>
  );
};

export default DesktopIcon;
