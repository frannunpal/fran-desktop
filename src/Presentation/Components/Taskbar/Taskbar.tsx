import type { FC } from 'react';
import { Text } from '@mantine/core';
import { useDesktopStore } from '@presentation/Store/desktopStore';
import { useClock } from '@presentation/Hooks/useClock';
import Launcher from '@presentation/Components/Launcher/Launcher';
import classes from './Taskbar.module.css';

const Taskbar: FC = () => {
  const taskbar = useDesktopStore(state => state.theme.taskbar);
  const windows = useDesktopStore(state => state.windows);
  const restoreWindow = useDesktopStore(state => state.restoreWindow);
  const minimizeWindow = useDesktopStore(state => state.minimizeWindow);
  const focusWindow = useDesktopStore(state => state.focusWindow);
  const time = useClock();

  const openWindows = windows.filter(w => w.isOpen);

  const handleClick = (id: string, state: string) => {
    if (state === 'minimized') {
      restoreWindow(id);
      focusWindow(id);
    } else {
      minimizeWindow(id);
    }
  };

  return (
    <div className={classes.root} style={{ background: taskbar }} role="toolbar" aria-label="Taskbar">
      <Launcher />
      {openWindows.map(win => (
        <button
          key={win.id}
          className={classes.windowButton}
          data-active={win.state !== 'minimized' ? 'true' : 'false'}
          onClick={() => handleClick(win.id, win.state)}
          aria-label={win.title}
        >
          <Text size="xs" truncate>
            {win.title}
          </Text>
        </button>
      ))}
      <Text size="xs" className={classes.clock} aria-label="clock">
        {time}
      </Text>
    </div>
  );
};

export default Taskbar;
