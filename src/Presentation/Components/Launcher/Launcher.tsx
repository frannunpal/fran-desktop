import { type FC, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Text } from '@mantine/core';
import { FcDebian } from 'react-icons/fc';
import { useDesktopStore } from '@presentation/Store/desktopStore';
import { APPS } from '@shared/Constants/apps';
import type { LauncherProps } from '@shared/Interfaces/ComponentProps';
import classes from './Launcher.module.css';

const Launcher: FC<LauncherProps> = ({ icon: Icon = FcDebian }) => {
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
        width: app?.defaultWidth ?? 600,
        height: app?.defaultHeight ?? 400,
        minWidth: app?.minWidth ?? 300,
        minHeight: app?.minHeight ?? 200,
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
        <Icon size={22} style={{ display: 'block' }} />
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
