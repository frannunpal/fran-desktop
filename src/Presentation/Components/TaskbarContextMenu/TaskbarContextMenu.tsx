import type { FC } from 'react';
import { Menu } from '@mantine/core';
import type { TaskbarContextMenuProps } from '@/Shared/Interfaces/IComponentProps';
import ContextMenuAnchor from '@presentation/Components/ContextMenu/ContextMenuAnchor';
import { useFcIconElement } from '@/Presentation/Hooks/useFcIcon';

import styles from './TaskbarContextMenu.module.css';

const TaskbarContextMenu: FC<TaskbarContextMenuProps> = ({
  windowMenuOpened,
  panelMenuOpened,
  menuPosition,
  targetWindowId,
  targetWindowState,
  onCloseWindow,
  onMinimizeWindow,
  onMaximizeWindow,
  onRestoreWindow,
  onWindowMenuClose,
  onPanelMenuClose,
}) => {
  const ICON_PROPS = { size: 14, style: { display: 'block' } };
  const DeleteRow: FC = () => useFcIconElement('FcCancel', ICON_PROPS);
  const MinimizeRow: FC = () => useFcIconElement('FcMinus', ICON_PROPS);
  const MaximizeRow: FC = () => useFcIconElement('FcTemplate', ICON_PROPS);
  const RestoreRow: FC = () => useFcIconElement('FcUndo', ICON_PROPS);

  const isMinimized = targetWindowState === 'minimized';
  const isMaximized = targetWindowState === 'maximized';

  return (
    <>
      <Menu
        opened={windowMenuOpened}
        onClose={onWindowMenuClose}
        closeOnClickOutside
        closeOnEscape
        closeOnItemClick
        withinPortal
      >
        <ContextMenuAnchor x={menuPosition.x} y={menuPosition.y} />
        <Menu.Dropdown>
          {!isMinimized && (
            <Menu.Item
              onClick={() => {
                if (targetWindowId) onMinimizeWindow(targetWindowId);
              }}
            >
              <div className={styles.menuItem}>
                <MinimizeRow /> Minimize
              </div>
            </Menu.Item>
          )}
          {isMinimized || isMaximized ? (
            <Menu.Item
              onClick={() => {
                if (targetWindowId) onRestoreWindow(targetWindowId);
              }}
            >
              <div className={styles.menuItem}>
                <RestoreRow /> Restore
              </div>
            </Menu.Item>
          ) : (
            <Menu.Item
              onClick={() => {
                if (targetWindowId) onMaximizeWindow(targetWindowId);
              }}
            >
              <div className={styles.menuItem}>
                <MaximizeRow /> Maximize
              </div>
            </Menu.Item>
          )}
          <Menu.Divider />
          <Menu.Item
            onClick={() => {
              if (targetWindowId) onCloseWindow(targetWindowId);
            }}
          >
            <div className={styles.menuItem}>
              <DeleteRow /> Close window
            </div>
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>

      <Menu
        opened={panelMenuOpened}
        onClose={onPanelMenuClose}
        closeOnClickOutside
        closeOnEscape
        closeOnItemClick
        withinPortal
      >
        <ContextMenuAnchor x={menuPosition.x} y={menuPosition.y} />
        <Menu.Dropdown>
          <Menu.Item disabled>Show panel configuration (coming soon)</Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </>
  );
};

export default TaskbarContextMenu;
