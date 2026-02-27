import { type FC, useState } from 'react';
import { Menu } from '@mantine/core';
import { VscNewFolder, VscNewFile, VscFiles, VscClippy, VscTrash } from 'react-icons/vsc';
import { useDesktopStore } from '@presentation/Store/desktopStore';
import CreateItemModal from '@presentation/Components/Shared/CreateItemModal/CreateItemModal';
import ContextMenuAnchor from './ContextMenuAnchor';

interface CreateItemContextMenuProps {
  owner: string;
  parentId: string | null;
  currentPath: string;
}

const CreateItemContextMenu: FC<CreateItemContextMenuProps> = ({
  owner,
  parentId,
  currentPath,
}) => {
  const contextMenu = useDesktopStore(state => state.contextMenu);
  const closeContextMenu = useDesktopStore(state => state.closeContextMenu);
  const createFile = useDesktopStore(state => state.createFile);
  const createFolder = useDesktopStore(state => state.createFolder);
  const deleteNode = useDesktopStore(state => state.deleteNode);
  const fsNodes = useDesktopStore(state => state.fsNodes);

  const [modal, setModal] = useState<{ opened: boolean; mode: 'file' | 'folder' }>({
    opened: false,
    mode: 'folder',
  });

  const isOpen = contextMenu.owner === owner;
  const targetNodeId = contextMenu.targetNodeId;
  const targetNode = targetNodeId ? fsNodes.find(n => n.id === targetNodeId) : undefined;

  const openModal = (mode: 'file' | 'folder') => {
    closeContextMenu();
    setModal({ opened: true, mode });
  };

  const handleConfirm = (name: string, iconName?: string, iconColor?: string) => {
    if (modal.mode === 'folder') {
      createFolder(name, parentId, iconName, iconColor);
    } else {
      createFile(name, '', parentId);
    }
  };

  const handleDelete = () => {
    if (targetNodeId) deleteNode(targetNodeId);
  };

  return (
    <>
      <Menu
        opened={isOpen}
        onClose={closeContextMenu}
        closeOnClickOutside
        closeOnEscape
        closeOnItemClick
        withinPortal
        position="bottom-start"
      >
        <ContextMenuAnchor x={contextMenu.x} y={contextMenu.y} />
        <Menu.Dropdown>
          {targetNode ? (
            <>
              <Menu.Label>{targetNode.name}</Menu.Label>
              <Menu.Item leftSection={<VscFiles size={14} />} disabled>
                Cut
              </Menu.Item>
              <Menu.Item leftSection={<VscClippy size={14} />} disabled>
                Copy
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item leftSection={<VscTrash size={14} />} color="red" onClick={handleDelete}>
                Delete
              </Menu.Item>
            </>
          ) : (
            <>
              <Menu.Item
                leftSection={<VscNewFolder size={14} />}
                onClick={() => openModal('folder')}
              >
                Create folder
              </Menu.Item>
              <Menu.Item leftSection={<VscNewFile size={14} />} onClick={() => openModal('file')}>
                Create new file
              </Menu.Item>
            </>
          )}
        </Menu.Dropdown>
      </Menu>
      <CreateItemModal
        opened={modal.opened}
        mode={modal.mode}
        currentPath={currentPath}
        onClose={() => setModal(m => ({ ...m, opened: false }))}
        onConfirm={handleConfirm}
      />
    </>
  );
};

export default CreateItemContextMenu;
