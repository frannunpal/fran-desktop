import { type FC, useState, useEffect, useRef, createElement } from 'react';
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
import { useFcIconElement } from '@presentation/Hooks/useFcIcon';
import IconColorPicker from '../IconColorPicker/IconColorPicker';
import type { WindowContentProps } from '@/Shared/Interfaces/IWindowContentProps';
import classes from './CreateItemApp.module.css';

const CSS_COLOR_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const isValidColor = (color: string) => CSS_COLOR_RE.test(color);

const ICON_PROPS = { size: 14, style: { display: 'block' } };

const CollapseToggleIcon: FC<{ open: boolean }> = ({ open }) =>
  useFcIconElement(open ? 'FcCollapse' : 'FcExpand', ICON_PROPS);

const CancelIcon: FC = () => useFcIconElement('FcCancel', ICON_PROPS);

const CheckIcon: FC = () => useFcIconElement('FcCheckmark', ICON_PROPS);

const DEFAULT_ICON = 'VscFolder';
const DEFAULT_COLOR = '#228be6';
const DEFAULT_FILE_NAME = 'New File';
const DEFAULT_FOLDER_NAME = 'New Folder';
const TITLE_BAR_HEIGHT = 36;

const CreateItemApp: FC<WindowContentProps> = ({ window }) => {
  const win = window;
  const mode = (win?.contentData?.mode as 'file' | 'folder') ?? 'folder';
  const parentId = (win?.contentData?.parentId as string | null) ?? null;
  const currentPath = (win?.contentData?.currentPath as string) ?? '/home';

  const [name, setName] = useState(mode === 'folder' ? DEFAULT_FOLDER_NAME : DEFAULT_FILE_NAME);
  const [iconName, setIconName] = useState(DEFAULT_ICON);
  const [iconColor, setIconColor] = useState(DEFAULT_COLOR);
  const [iconPickerOpen, setIconPickerOpen] = useState(
    (win?.contentData?.iconPickerOpen as boolean | undefined) ?? false,
  );

  const rootRef = useRef<HTMLDivElement>(null);

  const closeWindow = useDesktopStore(state => state.closeWindow);
  const resizeWindow = useDesktopStore(state => state.resizeWindow);
  const createFile = useDesktopStore(state => state.createFile);
  const createFolder = useDesktopStore(state => state.createFolder);
  const fsNodes = useDesktopStore(state => state.fsNodes);
  const windowWidth = useDesktopStore(
    state => state.windows.find(w => w.id === win?.id)?.width ?? 400,
  );

  const duplicateName = fsNodes.some(
    n => n.parentId === parentId && n.type === mode && n.name === name.trim(),
  );
  const colorError = mode === 'folder' && iconPickerOpen && !isValidColor(iconColor);
  const canConfirm = name.trim().length > 0 && !duplicateName && !colorError;

  useEffect(() => {
    if (!win?.id || !rootRef.current) return;
    const el = rootRef.current;
    const observer = new ResizeObserver(() => {
      resizeWindow(win!.id, windowWidth, el.scrollHeight + TITLE_BAR_HEIGHT);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, [win, windowWidth, resizeWindow]);

  const handleConfirm = () => {
    if (!canConfirm) return;
    if (mode === 'folder') {
      createFolder(name.trim(), parentId ?? null, iconName, iconColor);
    } else {
      createFile(name.trim(), '', parentId ?? null);
    }
    closeWindow(win!.id);
  };

  const handleCancel = () => {
    closeWindow(win!.id);
  };

  const PreviewIcon = VscIcons[iconName as keyof typeof VscIcons] as React.ElementType | undefined;

  return (
    <div ref={rootRef} className={classes.root}>
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
            error={duplicateName ? `There is already a ${mode} with that name` : undefined}
            rightSection={
              name ? (
                <ActionIcon
                  variant="transparent"
                  size="sm"
                  onClick={() => setName('')}
                  aria-label="Clear name"
                >
                  <CancelIcon />
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
              <CollapseToggleIcon open={iconPickerOpen} />
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
                  colorError={colorError ? 'Enter a valid hex color (e.g. #ff0000)' : undefined}
                />
              </div>
            </Collapse>

            <Text size="xs" c="dimmed" mt={4}>
              You can change the icon later in folder properties.
            </Text>
          </>
        )}

        <Group justify="flex-end" mt="md">
          <Button variant="default" size="sm" onClick={handleCancel} leftSection={<CancelIcon />}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleConfirm}
            leftSection={<CheckIcon />}
            disabled={!canConfirm}
          >
            OK
          </Button>
        </Group>
      </div>
    </div>
  );
};

export default CreateItemApp;
