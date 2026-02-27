import { type FC, useState, createElement } from 'react';
import {
  Text,
  TextInput,
  Button,
  Group,
  Collapse,
  UnstyledButton,
  ActionIcon,
} from '@mantine/core';
import * as VscIcons from 'react-icons/vsc';
import { useDesktopStore } from '@presentation/Store/desktopStore';
import IconColorPicker from '../IconColorPicker/IconColorPicker';
import classes from './CreateItemApp.module.css';

export interface CreateItemAppProps {
  windowId?: string;
  mode?: 'file' | 'folder';
  parentId?: string | null;
  currentPath?: string;
}

const DEFAULT_ICON = 'VscFolder';
const DEFAULT_COLOR = '#228be6';
const DEFAULT_FILE_NAME = 'New File';
const DEFAULT_FOLDER_NAME = 'New Folder';

const CreateItemApp: FC<CreateItemAppProps> = ({
  windowId,
  mode = 'folder',
  parentId = null,
  currentPath = '/home',
}) => {
  const [name, setName] = useState(mode === 'folder' ? DEFAULT_FOLDER_NAME : DEFAULT_FILE_NAME);
  const [iconName, setIconName] = useState(DEFAULT_ICON);
  const [iconColor, setIconColor] = useState(DEFAULT_COLOR);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);

  const closeWindow = useDesktopStore(state => state.closeWindow);
  const createFile = useDesktopStore(state => state.createFile);
  const createFolder = useDesktopStore(state => state.createFolder);

  const handleConfirm = () => {
    if (!name.trim()) return;
    if (mode === 'folder') {
      createFolder(name.trim(), parentId ?? null, iconName, iconColor);
    } else {
      createFile(name.trim(), '', parentId ?? null);
    }
    if (windowId) {
      closeWindow(windowId);
    }
  };

  const handleCancel = () => {
    if (windowId) {
      closeWindow(windowId);
    }
  };

  const PreviewIcon = VscIcons[iconName as keyof typeof VscIcons] as React.ElementType | undefined;

  return (
    <div className={classes.root}>
      <div className={classes.header}>
        <Text fw={600} size="sm">
          {mode === 'folder' ? 'Create new folder' : 'Create new file'} in {currentPath}:
        </Text>
      </div>
      <div className={classes.content}>
        <div className={classes.nameRow}>
          {mode === 'folder' && PreviewIcon && (
            <div className={classes.iconPreview} aria-hidden="true">
              {createElement(PreviewIcon, { size: 40, color: iconColor })}
            </div>
          )}
          <TextInput
            value={name}
            onChange={e => setName(e.currentTarget.value)}
            onKeyDown={e => e.key === 'Enter' && handleConfirm()}
            rightSection={
              name ? (
                <ActionIcon
                  variant="transparent"
                  size="sm"
                  onClick={() => setName('')}
                  aria-label="Clear name"
                >
                  <VscIcons.VscClose size={14} />
                </ActionIcon>
              ) : null
            }
            autoFocus
            className={classes.nameInput}
            aria-label="Item name"
          />
        </div>

        {mode === 'folder' && (
          <>
            <UnstyledButton
              className={classes.collapseToggle}
              onClick={() => setIconPickerOpen(o => !o)}
              aria-expanded={iconPickerOpen}
            >
              <VscIcons.VscChevronDown
                size={14}
                style={{
                  transform: iconPickerOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                  transition: 'transform 0.2s',
                }}
              />
              <Text size="sm" ml={6}>
                Choose custom icon or color
              </Text>
            </UnstyledButton>

            <Collapse in={iconPickerOpen}>
              <div className={classes.pickerWrapper}>
                <IconColorPicker
                  selectedIcon={iconName}
                  selectedColor={iconColor}
                  onIconChange={setIconName}
                  onColorChange={setIconColor}
                />
              </div>
            </Collapse>

            <Text size="xs" c="dimmed" mt={4}>
              You can change the icon later in folder properties.
            </Text>
          </>
        )}

        <Group justify="flex-end" mt="md">
          <Button
            variant="default"
            size="sm"
            onClick={handleCancel}
            leftSection={<VscIcons.VscClose size={14} />}
          >
            Cancel
          </Button>
          <Button size="sm" onClick={handleConfirm} leftSection={<VscIcons.VscCheck size={14} />}>
            OK
          </Button>
        </Group>
      </div>
    </div>
  );
};

export default CreateItemApp;
