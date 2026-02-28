import type { FC } from 'react';
import { Text } from '@mantine/core';
import classes from './ImageViewerApp.module.css';

interface ImageViewerAppProps {
  src?: string;
}

const ImageViewerApp: FC<ImageViewerAppProps> = ({ src }) => {
  if (!src) {
    return (
      <div className={classes.container}>
        <Text className={classes.placeholder}>No image to display</Text>
      </div>
    );
  }

  return (
    <div className={classes.container}>
      <img src={src} alt={src.split('/').pop()} className={classes.image} />
    </div>
  );
};

export default ImageViewerApp;
