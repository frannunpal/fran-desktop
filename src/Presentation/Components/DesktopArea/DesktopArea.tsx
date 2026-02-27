import type { FC } from 'react';
import { useDesktopStore } from '@presentation/Store/desktopStore';
import type { DesktopAreaProps } from '@/Shared/Interfaces/IComponentProps';
import wallpaper from '/Images/wallpaper.jpg';
import classes from './DesktopArea.module.css';

const DesktopArea: FC<DesktopAreaProps> = ({ children, onContextMenu }) => {
  const desktop = useDesktopStore(state => state.theme.desktop);

  return (
    <div
      className={classes.root}
      style={{
        backgroundColor: desktop,
        backgroundImage: `url(${wallpaper})`,
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
