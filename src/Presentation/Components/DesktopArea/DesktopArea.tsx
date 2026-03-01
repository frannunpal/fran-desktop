import type { FC } from 'react';
import { useSettingsStore } from '@presentation/Store/settingsStore';
import type { DesktopAreaProps } from '@/Shared/Interfaces/IComponentProps';
import defaultWallpaper from '/Images/wallpaper.jpg';
import classes from './DesktopArea.module.css';

const DesktopArea: FC<DesktopAreaProps> = ({ children, onContextMenu }) => {
  const desktop = useSettingsStore(state => state.theme.desktop);
  const wallpaper = useSettingsStore(state => state.wallpaper);

  return (
    <div
      className={classes.root}
      style={{
        backgroundColor: desktop,
        backgroundImage: `url(${wallpaper ?? defaultWallpaper})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      onContextMenu={onContextMenu}
    >
      {children}
    </div>
  );
};

export default DesktopArea;
