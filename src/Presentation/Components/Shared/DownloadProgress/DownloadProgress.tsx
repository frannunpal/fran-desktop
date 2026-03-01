import { type FC } from 'react';
import { Progress } from '@mantine/core';
import { ANIMATION_DURATION } from '@/Shared/Constants/Animations';
import type { DownloadState } from '@presentation/Hooks/useDownload';

interface DownloadProgressProps {
  state: DownloadState;
}

const formatKb = (bytes: number): string => (bytes / 1024).toFixed(1);

const DownloadProgress: FC<DownloadProgressProps> = ({ state }) => {
  const { status, loaded, total, percent } = state;

  if (status === 'idle') return null;

  const isIndeterminate = percent === null;
  const label =
    status === 'done'
      ? `${formatKb(loaded)} KB`
      : total !== null
        ? `${formatKb(loaded)} / ${formatKb(total)} KB`
        : `${formatKb(loaded)} KB`;

  return (
    <Progress
      value={percent ?? 100}
      animated={isIndeterminate || status === 'downloading'}
      striped={isIndeterminate}
      size="sm"
      transitionDuration={ANIMATION_DURATION * 1000}
      aria-label="Download progress"
    >
      <Progress.Label>{label}</Progress.Label>
    </Progress>
  );
};

export default DownloadProgress;
