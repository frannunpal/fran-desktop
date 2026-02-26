/* eslint-disable react-hooks/static-components */
import type { FC } from 'react';
import { useState } from 'react';
import { Text, Popover } from '@mantine/core';
import { useDesktopStore } from '@presentation/Store/desktopStore';
import { useClock } from '@presentation/Hooks/useClock';
import { useFcIcon } from '@presentation/Hooks/useFcIcon';
import { useContextMenu } from '@presentation/Hooks/useContextMenu';
import Launcher from '@presentation/Components/Launcher/Launcher';
import CalendarApp from '@presentation/Components/CalendarApp/CalendarApp';
import TaskbarContextMenu from '@presentation/Components/TaskbarContextMenu/TaskbarContextMenu';
import classes from './Taskbar.module.css';
import { FcElectronics } from 'react-icons/fc';
import type { WindowEntity } from '@domain/Entities/Window';

interface WindowButtonIconProps {
  win: WindowEntity;
}

const WindowButtonIcon: FC<WindowButtonIconProps> = ({ win }) => {
  const FcIcon = useFcIcon(win.fcIcon ?? '');
  if (FcIcon) return <FcIcon size={14} />;
  if (win.icon) return <span aria-hidden="true">{win.icon}</span>;
  return null;
};

const Taskbar: FC = () => {
  const taskbar = useDesktopStore(state => state.theme.taskbar);
  const themeMode = useDesktopStore(state => state.theme.mode);
  const windows = useDesktopStore(state => state.windows);
  const restoreWindow = useDesktopStore(state => state.restoreWindow);
  const minimizeWindow = useDesktopStore(state => state.minimizeWindow);
  const focusWindow = useDesktopStore(state => state.focusWindow);
  const closeWindow = useDesktopStore(state => state.closeWindow);
  const toggleTheme = useDesktopStore(state => state.toggleTheme);
  const time = useClock();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [targetWindowId, setTargetWindowId] = useState<string | null>(null);

  const windowMenu = useContextMenu(-8);
  const panelMenu = useContextMenu(-8);

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
    <>
      <div
        className={classes.root}
        style={{ background: taskbar }}
        role="toolbar"
        aria-label="Taskbar"
        onContextMenu={panelMenu.open}
      >
        <Launcher icon={FcElectronics} />
        {openWindows.map(win => (
          <button
            key={win.id}
            className={classes.windowButton}
            data-active={win.state !== 'minimized' ? 'true' : 'false'}
            onClick={() => handleClick(win.id, win.state)}
            onContextMenu={e => {
              e.stopPropagation();
              setTargetWindowId(win.id);
              windowMenu.open(e);
            }}
            aria-label={win.title}
          >
            <WindowButtonIcon win={win} />
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
          <Popover
            opened={calendarOpen}
            onChange={setCalendarOpen}
            position="top-end"
            shadow="md"
            withArrow
          >
            <Popover.Target>
              <button
                className={classes.clock}
                onClick={() => setCalendarOpen(o => !o)}
                aria-label="clock"
                aria-expanded={calendarOpen}
              >
                <Text size="xs">{time}</Text>
              </button>
            </Popover.Target>
            <Popover.Dropdown>
              <CalendarApp />
            </Popover.Dropdown>
          </Popover>
        </div>
      </div>
      <TaskbarContextMenu
        windowMenuOpened={windowMenu.opened}
        panelMenuOpened={panelMenu.opened}
        menuPosition={windowMenu.opened ? windowMenu.position : panelMenu.position}
        targetWindowId={targetWindowId}
        onCloseWindow={closeWindow}
        onWindowMenuClose={windowMenu.close}
        onPanelMenuClose={panelMenu.close}
      />
    </>
  );
};

export default Taskbar;
