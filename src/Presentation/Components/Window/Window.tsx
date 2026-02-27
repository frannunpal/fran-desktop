import { type FC, useEffect, useRef, createElement } from 'react';
import { Rnd } from 'react-rnd';
import { motion, useAnimationControls } from 'framer-motion';
import { ActionIcon, Group, Text } from '@mantine/core';
import {
  VscChromeMinimize,
  VscChromeMaximize,
  VscChromeRestore,
  VscChromeClose,
} from 'react-icons/vsc';
import { useShallow } from 'zustand/react/shallow';
import { useDesktopStore } from '@presentation/Store/desktopStore';
import { useWindowButtonRegistry } from '@presentation/Hooks/useWindowButtonRegistry';
import { useFcIcon } from '@presentation/Hooks/useFcIcon';
import type { WindowProps } from '@/Shared/Interfaces/IComponentProps';
import type { WindowEntity } from "@/Shared/Interfaces/WindowEntity";
import {
  windowVariants,
  minimizeVariant,
  restoreVariant,
  maximizeTransition,
  EASE_IN,
} from '@shared/Constants/Animations';
import classes from './Window.module.css';

const TitleIcon: FC<{ win: WindowEntity }> = ({ win }) => {
  const FcIcon = useFcIcon(win.fcIcon ?? '');
  if (FcIcon) return createElement(FcIcon, { size: 14, 'aria-hidden': 'true' });
  if (win.icon) return <span aria-hidden="true">{win.icon}</span>;
  return null;
};

const Window: FC<WindowProps> = ({ window: win, children }) => {
  const {
    focusWindow,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    restoreWindow,
    moveWindow,
    resizeWindow,
  } = useDesktopStore(
    useShallow(state => ({
      focusWindow: state.focusWindow,
      closeWindow: state.closeWindow,
      minimizeWindow: state.minimizeWindow,
      maximizeWindow: state.maximizeWindow,
      restoreWindow: state.restoreWindow,
      moveWindow: state.moveWindow,
      resizeWindow: state.resizeWindow,
    })),
  );

  const windowColor = useDesktopStore(state => state.theme.window);
  const { getRect } = useWindowButtonRegistry();
  const controls = useAnimationControls();
  const prevStateRef = useRef(win.state);

  // On mount: play open animation
  useEffect(() => {
    controls.start('visible');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When restoring from minimized: animate from taskbar button back to window position
  useEffect(() => {
    if (prevStateRef.current === 'minimized' && win.state !== 'minimized') {
      const rect = getRect(win.id);
      if (rect) {
        const winCenterX = win.x + win.width / 2;
        const winCenterY = win.y + win.height / 2;
        const btnCenterX = rect.left + rect.width / 2;
        const btnCenterY = rect.top + rect.height / 2;
        controls.start(restoreVariant(btnCenterX - winCenterX, btnCenterY - winCenterY));
      } else {
        controls.set({ x: 0, y: 0, scale: 1, opacity: 1 });
        controls.start('visible');
      }
    }
    prevStateRef.current = win.state;
  }, [win.state, controls, getRect, win.id, win.x, win.y, win.width, win.height]);

  if (!win.isOpen) return null;

  const isMinimized = win.state === 'minimized';
  const isMaximized = win.state === 'maximized';
  const canMaximize = win.canMaximize !== false;

  const handleMinimize = async () => {
    const rect = getRect(win.id);
    if (rect) {
      const winCenterX = win.x + win.width / 2;
      const winCenterY = win.y + win.height / 2;
      const btnCenterX = rect.left + rect.width / 2;
      const btnCenterY = rect.top + rect.height / 2;
      await controls.start(minimizeVariant(btnCenterX - winCenterX, btnCenterY - winCenterY));
    } else {
      await controls.start({ ...windowVariants.exit, transition: EASE_IN });
    }
    minimizeWindow(win.id);
  };

  const handleClose = async () => {
    await controls.start({ ...windowVariants.exit, transition: EASE_IN });
    closeWindow(win.id);
  };

  return (
    <Rnd
      position={isMaximized ? { x: 0, y: 0 } : { x: win.x, y: win.y }}
      size={
        isMaximized ? { width: '100vw', height: '100vh' } : { width: win.width, height: win.height }
      }
      minWidth={win.minWidth}
      minHeight={win.minHeight}
      style={{
        zIndex: win.zIndex,
        visibility: isMinimized ? 'hidden' : 'visible',
        pointerEvents: isMinimized ? 'none' : 'auto',
      }}
      dragHandleClassName={classes.titleBar}
      disableDragging={isMaximized || isMinimized}
      enableResizing={!isMaximized && !isMinimized}
      onMouseDown={() => focusWindow(win.id)}
      onDragStop={(_e, data) => moveWindow(win.id, data.x, data.y)}
      onResizeStop={(_e, _dir, _ref, _delta, position) => {
        resizeWindow(win.id, _ref.offsetWidth, _ref.offsetHeight);
        moveWindow(win.id, position.x, position.y);
      }}
    >
      <motion.div
        className={classes.root}
        style={{ background: windowColor }}
        variants={windowVariants}
        initial="hidden"
        animate={controls}
        exit="exit"
        layout
        transition={maximizeTransition}
      >
        <div className={classes.titleBar}>
          <TitleIcon win={win} />
          <Text size="sm" fw={500} truncate className={classes.title}>
            {win.title}
          </Text>
          <Group gap={4} wrap="nowrap">
            <ActionIcon size="xs" variant="subtle" aria-label="Minimize" onClick={handleMinimize}>
              <VscChromeMinimize />
            </ActionIcon>
            {canMaximize && (
              <ActionIcon
                size="xs"
                variant="subtle"
                aria-label={isMaximized ? 'Restore' : 'Maximize'}
                onClick={() => (isMaximized ? restoreWindow(win.id) : maximizeWindow(win.id))}
              >
                {isMaximized ? <VscChromeRestore /> : <VscChromeMaximize />}
              </ActionIcon>
            )}
            <ActionIcon
              size="xs"
              variant="subtle"
              color="red"
              aria-label="Close"
              onClick={handleClose}
            >
              <VscChromeClose />
            </ActionIcon>
          </Group>
        </div>
        <div className={classes.content}>{children}</div>
      </motion.div>
    </Rnd>
  );
};

export default Window;
