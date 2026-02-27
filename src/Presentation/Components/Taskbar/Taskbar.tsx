/* eslint-disable react-hooks/static-components */
import { type FC, useState, useRef, useEffect } from 'react';
import { Text, Popover, Notification } from '@mantine/core';
import { useDesktopStore } from '@presentation/Store/desktopStore';
import { useClock } from '@presentation/Hooks/useClock';
import { useFcIcon } from '@presentation/Hooks/useFcIcon';
import { useContextMenu } from '@presentation/Hooks/useContextMenu';
import { useWindowButtonRegistry } from '@presentation/Hooks/useWindowButtonRegistry';
import Launcher from '@presentation/Components/Launcher/Launcher';
import CalendarApp from '@presentation/Components/CalendarApp/CalendarApp';
import TaskbarContextMenu from '@presentation/Components/TaskbarContextMenu/TaskbarContextMenu';
import classes from './Taskbar.module.css';
import type { WindowEntity } from '@/Shared/Interfaces/WindowEntity';

interface WindowButtonIconProps {
  win: WindowEntity;
}

const WindowButtonIcon: FC<WindowButtonIconProps> = ({ win }) => {
  const FcIcon = useFcIcon(win.fcIcon ?? '');
  if (FcIcon) return <FcIcon size={14} />;
  if (win.icon) return <span aria-hidden="true">{win.icon}</span>;
  return null;
};

const NotifButtonIcon: FC<{ open: boolean }> = ({ open }) => {
  const FcIcon = useFcIcon(open ? 'FcCollapse' : 'FcExpand');
  if (FcIcon) return <FcIcon size={18} style={{ display: 'block' }} />;
  return null;
};

const NotificationIcon: FC<{ fcIcon?: string }> = ({ fcIcon }) => {
  const FcIcon = useFcIcon(fcIcon ?? '');
  if (FcIcon) return <FcIcon size={18} style={{ display: 'block' }} />;
  return null;
};

interface WindowButtonProps {
  win: WindowEntity;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const WindowButton: FC<WindowButtonProps> = ({ win, onClick, onContextMenu }) => {
  const ref = useRef<HTMLButtonElement>(null);
  const { register, unregister } = useWindowButtonRegistry();

  useEffect(() => {
    if (ref.current) {
      register(win.id, ref.current.getBoundingClientRect());
    }
    return () => unregister(win.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [win.id]);

  return (
    <button
      ref={ref}
      className={classes.windowButton}
      data-active={win.state !== 'minimized' ? 'true' : 'false'}
      onClick={onClick}
      onContextMenu={onContextMenu}
      aria-label={win.title}
    >
      <WindowButtonIcon win={win} />
      <Text size="xs" truncate>
        {win.title}
      </Text>
    </button>
  );
};

const Taskbar: FC = () => {
  const taskbar = useDesktopStore(state => state.theme.taskbar);
  const themeMode = useDesktopStore(state => state.theme.mode);
  const notifications = useDesktopStore(state => state.notifications);
  const removeNotification = useDesktopStore(state => state.removeNotification);
  const windows = useDesktopStore(state => state.windows);
  const restoreWindow = useDesktopStore(state => state.restoreWindow);
  const minimizeWindow = useDesktopStore(state => state.minimizeWindow);
  const focusWindow = useDesktopStore(state => state.focusWindow);
  const closeWindow = useDesktopStore(state => state.closeWindow);
  const toggleTheme = useDesktopStore(state => state.toggleTheme);
  const time = useClock();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [targetWindowId, setTargetWindowId] = useState<string | null>(null);

  const prevNotifLenRef = useRef(0);
  useEffect(() => {
    if (notifications.length > prevNotifLenRef.current) {
      setNotifOpen(true); // eslint-disable-line react-hooks/set-state-in-effect
    }
    prevNotifLenRef.current = notifications.length;
  }, [notifications.length]);

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
        <Launcher fcIcon="FcElectronics" />
        {openWindows.map(win => (
          <WindowButton
            key={win.id}
            win={win}
            onClick={() => handleClick(win.id, win.state)}
            onContextMenu={e => {
              e.stopPropagation();
              setTargetWindowId(win.id);
              windowMenu.open(e);
            }}
          />
        ))}
        <div className={classes.systemTray}>
          <Popover
            opened={notifOpen}
            onChange={setNotifOpen}
            position="top-end"
            shadow="md"
            withArrow
            keepMounted
          >
            <Popover.Target>
              <button
                className={classes.notifButton}
                onClick={() => setNotifOpen(o => !o)}
                aria-label={notifOpen ? 'Hide notifications' : 'Show notifications'}
              >
                <NotifButtonIcon open={notifOpen} />
              </button>
            </Popover.Target>
            <Popover.Dropdown style={{ background: 'transparent', border: 'none', padding: 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 300 }}>
                {notifications.length === 0 ? (
                  <Notification
                    title="There are no new notifications"
                    onClose={() => setNotifOpen(false)}
                  >
                    For now
                  </Notification>
                ) : (
                  notifications.map(n => (
                    <Notification
                      key={n.id}
                      withBorder
                      icon={<NotificationIcon fcIcon={n.fcIcon} />}
                      title={n.title}
                      onClose={() => {
                        removeNotification(n.id);
                        n.onClose?.();
                      }}
                    >
                      {n.message}
                    </Notification>
                  ))
                )}
              </div>
            </Popover.Dropdown>
          </Popover>
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
