import { type FC, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Text } from '@mantine/core';
import { useDesktopStore } from '@presentation/Store/desktopStore';
import classes from './Launcher.module.css';

interface AppEntry {
  id: string;
  name: string;
  icon: string;
}

const APPS: AppEntry[] = [
  { id: 'notepad', name: 'Notepad', icon: '📝' },
  { id: 'terminal', name: 'Terminal', icon: '💻' },
  { id: 'files', name: 'Files', icon: '📁' },
  { id: 'settings', name: 'Settings', icon: '⚙️' },
];

const Launcher: FC = () => {
  const [open, setOpen] = useState(false);
  const openWindow = useDesktopStore(state => state.openWindow);
  const taskbar = useDesktopStore(state => state.theme.taskbar);

  const handleOpen = useCallback(
    (appId: string) => {
      const app = APPS.find(a => a.id === appId);
      openWindow({
        title: app?.name ?? appId,
        content: appId,
        x: 150 + Math.random() * 200,
        y: 80 + Math.random() * 100,
        width: 600,
        height: 400,
        minWidth: 300,
        minHeight: 200,
      });
      setOpen(false);
    },
    [openWindow],
  );

  return (
    <>
      <button
        className={classes.trigger}
        onClick={() => setOpen(o => !o)}
        aria-label="Launcher"
        aria-expanded={open}
      >
        ⊞
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className={classes.panel}
            style={{ background: taskbar }}
            role="menu"
            aria-label="App launcher"
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1, transition: { duration: 0.4, ease: 'easeOut' as const } }}
            exit={{ opacity: 0, y: 8, scale: 0.96, transition: { duration: 0.4, ease: 'easeIn' as const } }}
          >
            {APPS.map(app => (
              <button
                key={app.id}
                className={classes.appButton}
                onClick={() => handleOpen(app.id)}
                role="menuitem"
                aria-label={app.name}
              >
                <span className={classes.appIcon} aria-hidden="true">
                  {app.icon}
                </span>
                <Text size="sm">{app.name}</Text>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Launcher;
