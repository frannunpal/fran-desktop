import { type FC, useState, useCallback, useEffect } from 'react';
import type { FileNode } from '@/Shared/Interfaces/FileNode';
import { FilePickerModal } from '@presentation/Components/Shared/FilePickerApp/FilePickerApp';
import AppEmptyState from '@presentation/Components/Shared/AppEmptyState/AppEmptyState';
import type { WindowContentProps } from '@/Shared/Interfaces/IWindowContentProps';
import classes from './ImageViewerApp.module.css';
import { IMAGE_MIME_TYPES } from '@/Shared/Utils/getAppIdForMime';

const ACCEPTED_IMAGE_TYPES = [...IMAGE_MIME_TYPES, 'image/*'];

const ImageViewerApp: FC<WindowContentProps> = ({ window, notifyReady }) => {
  const win = window;
  const initialSrc = win?.contentData?.src as string | undefined;
  const [src, setSrc] = useState(initialSrc);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    notifyReady?.({ ...(win?.contentData ?? {}), setPickerOpen: () => setPickerOpen(true) });
  }, [win, notifyReady]);

  const handleFileSelected = useCallback((node: FileNode) => {
    setSrc(node.url ?? node.name);
    setPickerOpen(false);
  }, []);

  const content = src ? (
    <img src={src} alt={src.split('/').pop()} className={classes.image} />
  ) : (
    <AppEmptyState label="No image to display. Please open one." />
  );

  return (
    <div className={classes.container} data-windowid={win?.id}>
      {content}
      <FilePickerModal
        opened={pickerOpen}
        acceptedMimeTypes={ACCEPTED_IMAGE_TYPES}
        onConfirm={handleFileSelected}
        onCancel={() => setPickerOpen(false)}
      />
    </div>
  );
};

export default ImageViewerApp;
