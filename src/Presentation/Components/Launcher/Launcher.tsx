import { type FC, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Text } from '@mantine/core';
import { useDesktopStore } from '@presentation/Store/desktopStore';
import { APPS } from '@shared/Constants/apps';
import type { LauncherProps } from '@/Shared/Interfaces/IComponentProps';
import { panelVariants } from '@shared/Constants/Animations';
import { useFcIconElement } from '@presentation/Hooks/useFcIcon';
import { useOpenApp } from '@presentation/Hooks/useOpenApp';
import AppIcon from '@presentation/Components/Shared/AppIcon/AppIcon';
import classes from './Launcher.module.css';

const Launcher: FC<LauncherProps> = ({ fcIcon = 'FcDebian' }) => {
  const icon = useFcIconElement(fcIcon, { size: 22, style: { display: 'block' } });
  const [open, setOpen] = useState(false);
  const openApp = useOpenApp();
  const taskbar = useDesktopStore(state => state.theme.taskbar);

  const handleOpen = useCallback(
    (appId: string) => {
      openApp(appId);
      setOpen(false);
    },
    [openApp],
  );

  return (
    <>
      <button
        className={classes.trigger}
        onClick={() => setOpen(o => !o)}
        aria-label="Launcher"
        aria-expanded={open}
      >
        {icon}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className={classes.panel}
            style={{ background: taskbar }}
            role="menu"
            aria-label="App launcher"
            initial={panelVariants.initial}
            animate={panelVariants.animate}
            exit={panelVariants.exit}
          >
            {[...APPS]
              .sort((a, b) => a.name.localeCompare(b.name))
              .map(app => (
                <button
                  key={app.id}
                  className={classes.appButton}
                  onClick={() => handleOpen(app.id)}
                  role="menuitem"
                  aria-label={app.name}
                >
                  <span className={classes.appIcon}>
                    <AppIcon fcIcon={app.fcIcon} fallback={app.icon} />
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
