import type { FC } from 'react';
import { Menu } from '@mantine/core';
import type { TaskbarContextMenuProps } from '@shared/Interfaces/ComponentProps';
import ContextMenuAnchor from '@presentation/Components/ContextMenu/ContextMenuAnchor';

const TaskbarContextMenu: FC<TaskbarContextMenuProps> = ({
  windowMenuOpened,
  panelMenuOpened,
  menuPosition,
  targetWindowId,
  onCloseWindow,
  onWindowMenuClose,
  onPanelMenuClose,
}) => {
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
          <Menu.Item
            onClick={() => {
              if (targetWindowId) onCloseWindow(targetWindowId);
            }}
          >
            Close window
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item disabled>Pin window (coming soon)</Menu.Item>
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
