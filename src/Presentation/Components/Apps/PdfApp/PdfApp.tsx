import { type FC, useState } from 'react';
import { FilePickerModal } from '@presentation/Components/Shared/FilePickerApp/FilePickerApp';
import type { FileNode } from '@/Shared/Interfaces/FileNode';
import classes from './PdfApp.module.css';

const DEFAULT_PDF = 'Desktop/CV_2026_English.pdf';

export interface PdfAppProps {
  src?: string;
  windowId?: string;
  pickerOpen?: boolean;
  onPickerClose?: () => void;
}

const PdfApp: FC<PdfAppProps> = ({
  src: initialSrc = DEFAULT_PDF,
  windowId,
  pickerOpen = false,
  onPickerClose,
}) => {
  const [src, setSrc] = useState(initialSrc);

  const handleFileSelected = (node: FileNode) => {
    setSrc(node.url ?? node.name);
    onPickerClose?.();
  };

  return (
    <div className={classes.container} data-windowid={windowId}>
      <iframe src={src} className={classes.frame} title="PDF viewer" aria-label="PDF viewer" />
      <FilePickerModal
        opened={pickerOpen}
        acceptedMimeTypes={['application/pdf']}
        onConfirm={handleFileSelected}
        onCancel={() => onPickerClose?.()}
      />
    </div>
  );
};

export default PdfApp;
