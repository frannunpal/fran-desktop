import type { FC } from 'react';
import classes from './StorybookApp.module.css';

const STORYBOOK_URL = 'https://frannunpal.github.io/fran-desktop/storybook/';

const StorybookApp: FC = () => (
  <iframe
    src={STORYBOOK_URL}
    className={classes.frame}
    title="Storybook"
    aria-label="Storybook component explorer"
  />
);

export default StorybookApp;
