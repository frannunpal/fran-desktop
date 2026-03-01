import { type FC, useState, useCallback, useEffect } from 'react';
import { FilePickerModal } from '@presentation/Components/Shared/FilePickerApp/FilePickerApp';
import type { FileNode } from '@/Shared/Interfaces/FileNode';
import type { WindowContentProps } from '@/Shared/Interfaces/IWindowContentProps';
import classes from './PdfApp.module.css';

const DEFAULT_PDF = 'Desktop/CV_2026_English.pdf';

const PdfApp: FC<WindowContentProps> = ({ window, notifyReady }) => {
  const win = window;
  const initialSrc = win?.contentData?.src as string | undefined;
  const [src, setSrc] = useState(initialSrc ?? DEFAULT_PDF);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    notifyReady?.({ ...(win?.contentData ?? {}), setPickerOpen: () => setPickerOpen(true) });
  }, [win, notifyReady]);

  const handleFileSelected = useCallback((node: FileNode) => {
    setSrc(node.url ?? node.name);
    setPickerOpen(false);
  }, []);

  return (
    <div className={classes.container} data-windowid={win?.id}>
      <iframe src={src} className={classes.frame} title="PDF viewer" aria-label="PDF viewer" />
      <FilePickerModal
        opened={pickerOpen}
        acceptedMimeTypes={['application/pdf']}
        onConfirm={handleFileSelected}
        onCancel={() => setPickerOpen(false)}
      />
    </div>
  );
};

export default PdfApp;
