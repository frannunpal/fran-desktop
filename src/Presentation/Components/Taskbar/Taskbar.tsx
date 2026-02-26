import type { FC } from 'react';
import { Text } from '@mantine/core';
import { useDesktopStore } from '@presentation/Store/desktopStore';
import { useClock } from '@presentation/Hooks/useClock';
import Launcher from '@presentation/Components/Launcher/Launcher';
import classes from './Taskbar.module.css';
import { FcElectronics } from 'react-icons/fc';

const Taskbar: FC = () => {
  const taskbar = useDesktopStore(state => state.theme.taskbar);
  const themeMode = useDesktopStore(state => state.theme.mode);
  const windows = useDesktopStore(state => state.windows);
  const restoreWindow = useDesktopStore(state => state.restoreWindow);
  const minimizeWindow = useDesktopStore(state => state.minimizeWindow);
  const focusWindow = useDesktopStore(state => state.focusWindow);
  const toggleTheme = useDesktopStore(state => state.toggleTheme);
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
    <div
      className={classes.root}
      style={{ background: taskbar }}
      role="toolbar"
      aria-label="Taskbar"
    >
      <Launcher icon={FcElectronics} />
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
      <div className={classes.systemTray}>
        <button
          className={classes.themeToggle}
          onClick={toggleTheme}
          aria-label={themeMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          title={themeMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {themeMode === 'dark' ? '☀️' : '🌙'}
        </button>
        <Text size="xs" className={classes.clock} aria-label="clock">
          {time}
        </Text>
      </div>
    </div>
  );
};

export default Taskbar;
