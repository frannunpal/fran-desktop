import { type FC, useState, createElement } from 'react';
import {
  Modal,
  Text,
  TextInput,
  Button,
  Group,
  Collapse,
  UnstyledButton,
  ActionIcon,
} from '@mantine/core';
import * as VscIcons from 'react-icons/vsc';
import IconColorPicker from '../IconColorPicker/IconColorPicker';
import classes from './CreateItemModal.module.css';

export interface CreateItemModalProps {
  opened: boolean;
  mode: 'file' | 'folder';
  currentPath: string;
  onClose: () => void;
  onConfirm: (name: string, iconName?: string, iconColor?: string) => void;
}

const DEFAULT_ICON = 'VscFolder';
const DEFAULT_COLOR = '#228be6';
const DEFAULT_FILE_NAME = 'New File';
const DEFAULT_FOLDER_NAME = 'New Folder';

const CreateItemModal: FC<CreateItemModalProps> = ({
  opened,
  mode,
  currentPath,
  onClose,
  onConfirm,
}) => {
  const [name, setName] = useState(mode === 'folder' ? DEFAULT_FOLDER_NAME : DEFAULT_FILE_NAME);
  const [iconName, setIconName] = useState(DEFAULT_ICON);
  const [iconColor, setIconColor] = useState(DEFAULT_COLOR);
  const [iconPickerOpen, setIconPickerOpen] = useState(false);

  const handleOpen = (o: boolean) => {
    if (o) {
      setName(mode === 'folder' ? DEFAULT_FOLDER_NAME : DEFAULT_FILE_NAME);
      setIconName(DEFAULT_ICON);
      setIconColor(DEFAULT_COLOR);
      setIconPickerOpen(false);
    }
  };

  const handleConfirm = () => {
    if (!name.trim()) return;
    onConfirm(
      name.trim(),
      mode === 'folder' ? iconName : undefined,
      mode === 'folder' ? iconColor : undefined,
    );
    onClose();
  };

  const PreviewIcon = VscIcons[iconName as keyof typeof VscIcons] as React.ElementType | undefined;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text fw={600} size="sm">
          {mode === 'folder' ? 'Create new folder' : 'Create new file'} in {currentPath}:
        </Text>
      }
      size="md"
      centered
      onTransitionEnd={() => handleOpen(opened)}
    >
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
            onClick={onClose}
            leftSection={<VscIcons.VscClose size={14} />}
          >
            Cancel
          </Button>
          <Button size="sm" onClick={handleConfirm} leftSection={<VscIcons.VscCheck size={14} />}>
            OK
          </Button>
        </Group>
      </div>
    </Modal>
  );
};

export default CreateItemModal;
