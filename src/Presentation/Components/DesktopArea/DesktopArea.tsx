import type { FC, ReactNode } from 'react';
import { useDesktopStore } from '@presentation/Store/desktopStore';
import classes from './DesktopArea.module.css';

interface DesktopAreaProps {
  children?: ReactNode;
}

const DesktopArea: FC<DesktopAreaProps> = ({ children }) => {
  const desktop = useDesktopStore(state => state.theme.desktop);

  return (
    <div className={classes.root} style={{ background: desktop }}>
      {children}
    </div>
  );
};

export default DesktopArea;
