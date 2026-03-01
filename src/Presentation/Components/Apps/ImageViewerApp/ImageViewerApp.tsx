import { type FC, useState } from 'react';
import type { FileNode } from '@/Shared/Interfaces/FileNode';
import { FilePickerModal } from '@presentation/Components/Shared/FilePickerApp/FilePickerApp';
import AppEmptyState from '@presentation/Components/Shared/AppEmptyState/AppEmptyState';
import classes from './ImageViewerApp.module.css';
import { IMAGE_MIME_TYPES } from '@/Shared/Utils/getAppIdForMime';

const ACCEPTED_IMAGE_TYPES = [...IMAGE_MIME_TYPES, 'image/*'];

export interface ImageViewerAppProps {
  src?: string;
  windowId?: string;
  pickerOpen?: boolean;
  onPickerClose?: () => void;
}

const ImageViewerApp: FC<ImageViewerAppProps> = ({
  src: initialSrc,
  windowId,
  pickerOpen = false,
  onPickerClose,
}) => {
  const [src, setSrc] = useState(initialSrc);

  const handleFileSelected = (node: FileNode) => {
    setSrc(node.url ?? node.name);
    onPickerClose?.();
  };

  const content = src ? (
    <img src={src} alt={src.split('/').pop()} className={classes.image} />
  ) : (
    <AppEmptyState label="No image to display. Please open one." />
  );

  return (
    <div className={classes.container} data-windowid={windowId}>
      {content}
      <FilePickerModal
        opened={pickerOpen}
        acceptedMimeTypes={ACCEPTED_IMAGE_TYPES}
        onConfirm={handleFileSelected}
        onCancel={() => onPickerClose?.()}
      />
    </div>
  );
};

export default ImageViewerApp;
