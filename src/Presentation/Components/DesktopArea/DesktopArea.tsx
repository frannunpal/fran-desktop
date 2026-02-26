import type { FC, ReactNode, MouseEvent } from 'react';
import { useDesktopStore } from '@presentation/Store/desktopStore';
import classes from './DesktopArea.module.css';

interface DesktopAreaProps {
  children?: ReactNode;
  onContextMenu?: (e: MouseEvent<HTMLDivElement>) => void;
}

const DesktopArea: FC<DesktopAreaProps> = ({ children, onContextMenu }) => {
  const desktop = useDesktopStore(state => state.theme.desktop);

  return (
    <div
      className={classes.root}
      style={{ backgroundColor: desktop, backgroundImage: 'url(/wallpaper.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}
      onContextMenu={onContextMenu}
    >
      {children}
    </div>
  );
};

export default DesktopArea;
