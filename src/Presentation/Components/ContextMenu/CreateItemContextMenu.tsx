import { type FC, useState } from 'react';
import { Menu, Modal, Button, Text, Group } from '@mantine/core';
import {
  VscNewFolder,
  VscNewFile,
  VscFiles,
  VscClippy,
  VscTrash,
  VscCopy,
  VscCheck,
  VscClose,
} from 'react-icons/vsc';
import { useDesktopStore } from '@presentation/Store/desktopStore';
import ContextMenuAnchor from './ContextMenuAnchor';
import type { FSNode } from '@/Shared/Types/FileSystemTypes';
import { randomWindowPosition } from '@shared/Constants/Animations';

interface CreateItemContextMenuProps {
  owner: string;
  parentId: string | null;
  currentPath: string;
}

interface PendingPaste {
  node: FSNode;
  originalName: string;
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
  const moveNode = useDesktopStore(state => state.moveNode);
  const copyToClipboard = useDesktopStore(state => state.copyToClipboard);
  const cutToClipboard = useDesktopStore(state => state.cutToClipboard);
  const clipboard = useDesktopStore(state => state.clipboard);
  const clearClipboard = useDesktopStore(state => state.clearClipboard);
  const fsNodes = useDesktopStore(state => state.fsNodes);
  const openWindow = useDesktopStore(state => state.openWindow);

  const [replaceConfirm, setReplaceConfirm] = useState<{
    opened: boolean;
    pending: PendingPaste | null;
  }>({
    opened: false,
    pending: null,
  });

  const isOpen = contextMenu.owner === owner;
  const targetNodeId = contextMenu.targetNodeId;
  const targetNode = targetNodeId ? fsNodes.find(n => n.id === targetNodeId) : undefined;

  const openCreateWindow = (mode: 'file' | 'folder') => {
    closeContextMenu();
    const { x, y } = randomWindowPosition();
    openWindow({
      title: mode === 'folder' ? 'Create Folder' : 'Create File',
      content: 'createItem',
      icon: mode === 'folder' ? '📁' : '📄',
      fcIcon: mode === 'folder' ? 'FcNewFolder' : 'FcFile',
      x,
      y,
      width: 400,
      height: 300,
      minWidth: 350,
      minHeight: 250,
      canMaximize: false,
      alwaysOnTop: true,
      contentData: { mode, parentId, currentPath },
    });
  };

  const handleDelete = () => {
    if (targetNodeId) deleteNode(targetNodeId);
    closeContextMenu();
  };

  const handleCut = () => {
    if (targetNode) cutToClipboard([targetNode]);
    closeContextMenu();
  };

  const handleCopy = () => {
    if (targetNode) copyToClipboard([targetNode]);
    closeContextMenu();
  };

  const findExistingNode = (name: string, parentFolderId: string | null): FSNode | undefined => {
    return fsNodes.find(n => n.name === name && n.parentId === parentFolderId);
  };

  const executePaste = (node: FSNode, replaceExisting: boolean) => {
    if (!parentId) return;

    if (clipboard.action === 'cut') {
      moveNode(node.id, parentId);
    } else if (clipboard.action === 'copy') {
      if (node.type === 'folder') {
        const existingFolder = findExistingNode(node.name, parentId);
        if (existingFolder && replaceExisting) {
          deleteNode(existingFolder.id);
        }
        if (!existingFolder || replaceExisting) {
          createFolder(node.name, parentId, node.iconName, node.iconColor);
        }
      } else if (node.type === 'file') {
        const existingFile = findExistingNode(node.name, parentId);
        if (existingFile && replaceExisting) {
          deleteNode(existingFile.id);
        }
        if (!existingFile || replaceExisting) {
          createFile(node.name, node.content, parentId);
        }
      }
    }

    if (clipboard.action === 'cut') {
      clearClipboard();
    }
  };

  const handlePasteClick = () => {
    if (clipboard.content.length === 0 || !parentId) return;

    const node = clipboard.content[0];
    const existingNode = findExistingNode(node.name, parentId);

    if (existingNode) {
      setReplaceConfirm({
        opened: true,
        pending: { node, originalName: node.name },
      });
    } else {
      executePaste(node, false);
      closeContextMenu();
    }
  };

  const handleReplaceConfirm = (replace: boolean) => {
    if (replaceConfirm.pending) {
      executePaste(replaceConfirm.pending.node, replace);
    }
    setReplaceConfirm({ opened: false, pending: null });
    closeContextMenu();
  };

  const hasClipboardContent = clipboard.content.length > 0;
  const canPaste = hasClipboardContent && parentId !== null;

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
              <Menu.Item leftSection={<VscFiles size={14} />} onClick={handleCut}>
                Cut
              </Menu.Item>
              <Menu.Item leftSection={<VscClippy size={14} />} onClick={handleCopy}>
                Copy
              </Menu.Item>
              {canPaste && (
                <Menu.Item leftSection={<VscCopy size={14} />} onClick={handlePasteClick}>
                  Paste {clipboard.content.length > 1 ? `(${clipboard.content.length} items)` : ''}
                </Menu.Item>
              )}
              <Menu.Divider />
              <Menu.Item leftSection={<VscTrash size={14} />} color="red" onClick={handleDelete}>
                Delete
              </Menu.Item>
            </>
          ) : (
            <>
              <Menu.Item
                leftSection={<VscNewFolder size={14} />}
                onClick={() => openCreateWindow('folder')}
              >
                Create folder
              </Menu.Item>
              <Menu.Item
                leftSection={<VscNewFile size={14} />}
                onClick={() => openCreateWindow('file')}
              >
                Create new file
              </Menu.Item>
              {canPaste && (
                <>
                  <Menu.Divider />
                  <Menu.Item leftSection={<VscCopy size={14} />} onClick={handlePasteClick}>
                    Paste{' '}
                    {clipboard.content.length > 1 ? `(${clipboard.content.length} items)` : ''}
                  </Menu.Item>
                </>
              )}
            </>
          )}
        </Menu.Dropdown>
      </Menu>
      <Modal
        opened={replaceConfirm.opened}
        onClose={() => handleReplaceConfirm(false)}
        title={<Text fw={600}>Replace file?</Text>}
        centered
        size="sm"
      >
        <Text size="sm" mb="md">
          A file named "{replaceConfirm.pending?.originalName}" already exists. Do you want to
          replace it?
        </Text>
        <Group justify="flex-end">
          <Button
            variant="default"
            size="sm"
            onClick={() => handleReplaceConfirm(false)}
            leftSection={<VscClose size={14} />}
          >
            No
          </Button>
          <Button
            size="sm"
            onClick={() => handleReplaceConfirm(true)}
            leftSection={<VscCheck size={14} />}
          >
            Yes, replace
          </Button>
        </Group>
      </Modal>
    </>
  );
};

export default CreateItemContextMenu;
