// @vitest-environment jsdom
import '@/Shared/Testing/__mocks__/jsdom-setup';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderWithMantine as wrapper } from '@/Shared/Testing/Utils/renderWithMantine';
import DownloadProgress from './DownloadProgress';
import type { DownloadState } from '@presentation/Hooks/useDownload';

const idle: DownloadState = { status: 'idle', loaded: 0, total: null, percent: null, error: null };
const downloading: DownloadState = {
  status: 'downloading',
  loaded: 512 * 1024,
  total: 1024 * 1024,
  percent: 50,
  error: null,
};
const downloadingUnknownSize: DownloadState = {
  status: 'downloading',
  loaded: 300 * 1024,
  total: null,
  percent: null,
  error: null,
};
const done: DownloadState = {
  status: 'done',
  loaded: 1024 * 1024,
  total: 1024 * 1024,
  percent: 100,
  error: null,
};

describe('DownloadProgress', () => {
  it('renders no progressbar when status is idle', () => {
    // Act
    render(<DownloadProgress state={idle} />, { wrapper });

    // Assert
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  });

  it('renders a progress bar when downloading with known total', () => {
    // Act
    render(<DownloadProgress state={downloading} />, { wrapper });

    // Assert
    const bar = screen.getByRole('progressbar');
    expect(bar).toBeInTheDocument();
    expect(bar).toHaveAttribute('aria-valuenow', '50');
  });

  it('renders a progress bar when downloading without known total (indeterminate)', () => {
    // Act
    render(<DownloadProgress state={downloadingUnknownSize} />, { wrapper });

    // Assert
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders a progress bar when done', () => {
    // Act
    render(<DownloadProgress state={done} />, { wrapper });

    // Assert
    const bar = screen.getByRole('progressbar');
    expect(bar).toBeInTheDocument();
    expect(bar).toHaveAttribute('aria-valuenow', '100');
  });

  it('progress bar has aria-label "Download progress"', () => {
    // Act
    render(<DownloadProgress state={downloading} />, { wrapper });

    // Assert
    expect(screen.getByLabelText('Download progress')).toBeInTheDocument();
  });

  it('sets aria-valuenow to 100 when percent is null (indeterminate animated)', () => {
    // Act
    render(<DownloadProgress state={downloadingUnknownSize} />, { wrapper });

    // Assert — component passes value=100 when percent is null
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
  });
});
