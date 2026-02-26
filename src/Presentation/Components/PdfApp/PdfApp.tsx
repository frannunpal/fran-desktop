import type { FC } from 'react';
import classes from './PdfApp.module.css';

const PDF_URL = 'Desktop/CV_2026_English.pdf';

const PdfApp: FC = () => (
  <iframe src={PDF_URL} className={classes.frame} title="CV" aria-label="PDF viewer" />
);

export default PdfApp;
