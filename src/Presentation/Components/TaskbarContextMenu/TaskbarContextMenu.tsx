import type { FC } from 'react';
import { Menu, Item, Separator } from 'react-contexify';
import type { TaskbarContextMenuProps } from '@shared/Interfaces/ComponentProps';

export const TASKBAR_WINDOW_MENU_ID = 'taskbar-window-menu';
export const TASKBAR_PANEL_MENU_ID = 'taskbar-panel-menu';

const TaskbarContextMenu: FC<TaskbarContextMenuProps> = ({ onCloseWindow }) => {
  return (
    <>
      <Menu id={TASKBAR_WINDOW_MENU_ID}>
        <Item
          onClick={({ props }: { props?: { windowId?: string } }) => {
            if (props?.windowId) onCloseWindow(props.windowId);
          }}
        >
          Close window
        </Item>
        <Separator />
        <Item disabled>Pin window (coming soon)</Item>
      </Menu>

      <Menu id={TASKBAR_PANEL_MENU_ID}>
        <Item disabled>Show panel configuration (coming soon)</Item>
      </Menu>
    </>
  );
};

export default TaskbarContextMenu;
