import { type FC, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Text } from '@mantine/core';
import { FcDebian } from 'react-icons/fc';
import { useDesktopStore } from '@presentation/Store/desktopStore';
import { APPS, DEFAULT_WINDOW_DIMENSIONS } from '@shared/Constants/apps';
import type { LauncherProps } from '@shared/Interfaces/ComponentProps';
import { panelVariants, randomWindowPosition } from '@shared/Constants/Animations';
import { useFcIcon } from '@presentation/Hooks/useFcIcon';
import classes from './Launcher.module.css';

interface AppIconProps {
  fcIcon?: string;
  fallback: string;
}

const AppIcon: FC<AppIconProps> = ({ fcIcon, fallback }) => {
  const FcIcon = useFcIcon(fcIcon ?? '');
  // eslint-disable-next-line react-hooks/static-components
  if (FcIcon) return <FcIcon size={20} />;
  return <span aria-hidden="true">{fallback}</span>;
};

const Launcher: FC<LauncherProps> = ({ icon: Icon = FcDebian }) => {
  const [open, setOpen] = useState(false);
  const openWindow = useDesktopStore(state => state.openWindow);
  const taskbar = useDesktopStore(state => state.theme.taskbar);

  const handleOpen = useCallback(
    (appId: string) => {
      const app = APPS.find(a => a.id === appId);
      const { x, y } = randomWindowPosition();
      openWindow({
        title: app?.name ?? appId,
        content: appId,
        icon: app?.icon,
        fcIcon: app?.fcIcon,
        canMaximize: app?.canMaximize,
        x,
        y,
        width: app?.defaultWidth ?? DEFAULT_WINDOW_DIMENSIONS.defaultWidth,
        height: app?.defaultHeight ?? DEFAULT_WINDOW_DIMENSIONS.defaultHeight,
        minWidth: app?.minWidth ?? DEFAULT_WINDOW_DIMENSIONS.minWidth,
        minHeight: app?.minHeight ?? DEFAULT_WINDOW_DIMENSIONS.minHeight,
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
