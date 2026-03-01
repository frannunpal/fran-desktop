import type { FC } from 'react';
import type { WindowContentProps } from '@/Shared/Interfaces/IWindowContentProps';
import classes from './StorybookApp.module.css';

const STORYBOOK_URL = 'https://frannunpal.github.io/fran-desktop/storybook/';

const StorybookApp: FC<WindowContentProps> = () => (
  <iframe
    src={STORYBOOK_URL}
    className={classes.frame}
    title="Storybook"
    aria-label="Storybook component explorer"
  />
);

export default StorybookApp;
