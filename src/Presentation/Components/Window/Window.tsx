import type { FC, ReactNode } from 'react';
import type { Variants } from 'framer-motion';
import { Rnd } from 'react-rnd';
import { motion } from 'framer-motion';
import { ActionIcon, Group, Text } from '@mantine/core';
import { VscChromeMinimize, VscChromeMaximize, VscChromeRestore, VscChromeClose } from 'react-icons/vsc';
import { useShallow } from 'zustand/react/shallow';
import { useDesktopStore } from '@presentation/Store/desktopStore';
import type { WindowEntity } from '@domain/Entities/Window';
import classes from './Window.module.css';

const windowVariants: Variants = {
  hidden: { opacity: 0, scale: 0.92, y: 12 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
  exit: { opacity: 0, scale: 0.92, y: 12, transition: { duration: 0.4, ease: 'easeIn' as const } },
};

interface WindowProps {
  window: WindowEntity;
  children?: ReactNode;
}

const Window: FC<WindowProps> = ({ window: win, children }) => {
  const { focusWindow, closeWindow, minimizeWindow, maximizeWindow, restoreWindow, moveWindow, resizeWindow } =
    useDesktopStore(
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

  if (!win.isOpen || win.state === 'minimized') return null;

  const isMaximized = win.state === 'maximized';

  return (
    <Rnd
      position={isMaximized ? { x: 0, y: 0 } : { x: win.x, y: win.y }}
      size={
        isMaximized
          ? { width: '100vw', height: '100vh' }
          : { width: win.width, height: win.height }
      }
      minWidth={win.minWidth}
      minHeight={win.minHeight}
      style={{ zIndex: win.zIndex }}
      dragHandleClassName={classes.titleBar}
      disableDragging={isMaximized}
      enableResizing={!isMaximized}
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
        animate="visible"
        exit="exit"
      >
        <div className={classes.titleBar}>
          <Text size="sm" fw={500} truncate className={classes.title}>
            {win.title}
          </Text>
          <Group gap={4} wrap="nowrap">
            <ActionIcon
              size="xs"
              variant="subtle"
              aria-label="Minimize"
              onClick={() => minimizeWindow(win.id)}
            >
              <VscChromeMinimize />
            </ActionIcon>
            <ActionIcon
              size="xs"
              variant="subtle"
              aria-label={isMaximized ? 'Restore' : 'Maximize'}
              onClick={() => (isMaximized ? restoreWindow(win.id) : maximizeWindow(win.id))}
            >
              {isMaximized ? <VscChromeRestore /> : <VscChromeMaximize />}
            </ActionIcon>
            <ActionIcon
              size="xs"
              variant="subtle"
              color="red"
              aria-label="Close"
              onClick={() => closeWindow(win.id)}
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
