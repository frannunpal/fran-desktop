import { type FC, useState, useCallback, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Text } from '@mantine/core';
import { useSettingsStore } from '@presentation/Store/settingsStore';
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
  const taskbar = useSettingsStore(state => state.theme.taskbar);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleMouseDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  const handleOpen = useCallback(
    (appId: string) => {
      openApp(appId);
      setOpen(false);
    },
    [openApp],
  );

  return (
    <div ref={rootRef}>
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
    </div>
  );
};

export default Launcher;
