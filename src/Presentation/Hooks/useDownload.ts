import { useState, useCallback } from 'react';

export type DownloadStatus = 'idle' | 'downloading' | 'done' | 'error';

export interface DownloadState {
  status: DownloadStatus;
  /** Bytes received so far */
  loaded: number;
  /** Total bytes, or null if Content-Length is not available */
  total: number | null;
  /** 0–100, or null when total is unknown */
  percent: number | null;
  error: string | null;
}

export interface UseDownloadReturn extends DownloadState {
  download: (url: string) => Promise<string | null>;
  reset: () => void;
}

const INITIAL_STATE: DownloadState = {
  status: 'idle',
  loaded: 0,
  total: null,
  percent: null,
  error: null,
};

/**
 * Hook for tracking streamed HTTP downloads with real-time progress.
 * Returns a `download(url)` function that resolves with the response text
 * (or null on error) and updates progress state as data arrives.
 */
export const useDownload = (): UseDownloadReturn => {
  const [state, setState] = useState<DownloadState>(INITIAL_STATE);

  const reset = useCallback(() => setState(INITIAL_STATE), []);

  const download = useCallback(async (url: string): Promise<string | null> => {
    setState({ status: 'downloading', loaded: 0, total: null, percent: null, error: null });

    try {
      const response = await fetch(url);

      if (!response.ok) {
        setState(prev => ({
          ...prev,
          status: 'error',
          error: `HTTP ${response.status}: ${response.statusText}`,
        }));
        return null;
      }

      const contentLength = response.headers.get('Content-Length');
      const total = contentLength ? parseInt(contentLength, 10) : null;

      if (!response.body) {
        // Fallback for environments without ReadableStream
        const text = await response.text();
        setState({
          status: 'done',
          loaded: text.length,
          total: text.length,
          percent: 100,
          error: null,
        });
        return text;
      }

      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let loaded = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        loaded += value.byteLength;
        const percent = total ? Math.round((loaded / total) * 100) : null;
        setState({ status: 'downloading', loaded, total, percent, error: null });
      }

      const allChunks = new Uint8Array(loaded);
      let offset = 0;
      for (const chunk of chunks) {
        allChunks.set(chunk, offset);
        offset += chunk.byteLength;
      }
      const text = new TextDecoder().decode(allChunks);

      setState({ status: 'done', loaded, total: total ?? loaded, percent: 100, error: null });
      return text;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setState(prev => ({ ...prev, status: 'error', error: message }));
      return null;
    }
  }, []);

  return { ...state, download, reset };
};
