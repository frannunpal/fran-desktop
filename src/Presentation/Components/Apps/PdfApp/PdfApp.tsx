import type { FC } from 'react';
import classes from './PdfApp.module.css';

const DEFAULT_PDF = 'Desktop/CV_2026_English.pdf';

interface PdfAppProps {
  src?: string;
}

const PdfApp: FC<PdfAppProps> = ({ src = DEFAULT_PDF }) => (
  <iframe src={src} className={classes.frame} title="CV" aria-label="PDF viewer" />
);

export default PdfApp;
