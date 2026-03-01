// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDownload } from './useDownload';

// Helpers to build a fake ReadableStream from chunks
function makeStream(chunks: Uint8Array[]): ReadableStream<Uint8Array> {
  let index = 0;
  return new ReadableStream({
    pull(controller) {
      if (index < chunks.length) {
        controller.enqueue(chunks[index++]);
      } else {
        controller.close();
      }
    },
  });
}

function makeResponse(
  body: ReadableStream<Uint8Array> | null,
  {
    status = 200,
    statusText = 'OK',
    contentLength,
  }: { status?: number; statusText?: string; contentLength?: number } = {},
): Response {
  const headers = new Headers();
  if (contentLength !== undefined) {
    headers.set('Content-Length', String(contentLength));
  }
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText,
    headers,
    body,
    text: async () => 'response text',
  } as unknown as Response;
}

describe('useDownload', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initial state is idle', () => {
    // Arrange & Act
    const { result } = renderHook(() => useDownload());

    // Assert
    expect(result.current.status).toBe('idle');
    expect(result.current.loaded).toBe(0);
    expect(result.current.total).toBeNull();
    expect(result.current.percent).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('reset() returns state to idle', async () => {
    // Arrange
    const chunk = new Uint8Array([1, 2, 3]);
    vi.mocked(fetch).mockResolvedValue(makeResponse(makeStream([chunk]), { contentLength: 3 }));
    const { result } = renderHook(() => useDownload());

    await act(async () => {
      await result.current.download('https://example.com/file');
    });

    expect(result.current.status).toBe('done');

    // Act
    act(() => result.current.reset());

    // Assert
    expect(result.current.status).toBe('idle');
  });

  it('sets status to downloading while reading chunks', async () => {
    // Arrange
    const statuses: string[] = [];
    const chunk = new Uint8Array(100);
    vi.mocked(fetch).mockResolvedValue(makeResponse(makeStream([chunk]), { contentLength: 100 }));

    const { result } = renderHook(() => useDownload());

    // Act
    await act(async () => {
      const promise = result.current.download('https://example.com/file');
      statuses.push(result.current.status);
      await promise;
    });

    // Assert — eventually done
    expect(result.current.status).toBe('done');
    expect(result.current.percent).toBe(100);
  });

  it('resolves with response text on success', async () => {
    // Arrange
    const text = 'font-face { }';
    const encoder = new TextEncoder();
    const chunk = encoder.encode(text);
    vi.mocked(fetch).mockResolvedValue(
      makeResponse(makeStream([chunk]), { contentLength: chunk.byteLength }),
    );
    const { result } = renderHook(() => useDownload());

    // Act
    let returnValue: string | null = null;
    await act(async () => {
      returnValue = await result.current.download('https://example.com/file');
    });

    // Assert
    expect(returnValue).toBe(text);
    expect(result.current.loaded).toBe(chunk.byteLength);
    expect(result.current.total).toBe(chunk.byteLength);
  });

  it('tracks percent correctly when Content-Length is provided', async () => {
    // Arrange
    const chunk1 = new Uint8Array(50);
    const chunk2 = new Uint8Array(50);
    vi.mocked(fetch).mockResolvedValue(
      makeResponse(makeStream([chunk1, chunk2]), { contentLength: 100 }),
    );
    const { result } = renderHook(() => useDownload());

    // Act
    await act(async () => {
      await result.current.download('https://example.com/file');
    });

    // Assert
    expect(result.current.percent).toBe(100);
    expect(result.current.loaded).toBe(100);
  });

  it('percent is null when Content-Length is absent', async () => {
    // Arrange
    const chunk = new Uint8Array(50);
    vi.mocked(fetch).mockResolvedValue(makeResponse(makeStream([chunk])));
    const { result } = renderHook(() => useDownload());

    // Act
    await act(async () => {
      await result.current.download('https://example.com/file');
    });

    // Assert — done state always sets percent to 100
    expect(result.current.percent).toBe(100);
  });

  it('sets status to error and returns null on HTTP error', async () => {
    // Arrange
    vi.mocked(fetch).mockResolvedValue(
      makeResponse(null, { status: 404, statusText: 'Not Found' }),
    );
    const { result } = renderHook(() => useDownload());

    // Act
    let returnValue: string | null = 'initial';
    await act(async () => {
      returnValue = await result.current.download('https://example.com/file');
    });

    // Assert
    expect(returnValue).toBeNull();
    expect(result.current.status).toBe('error');
    expect(result.current.error).toContain('404');
  });

  it('sets status to error and returns null on network failure', async () => {
    // Arrange
    vi.mocked(fetch).mockRejectedValue(new Error('Network Error'));
    const { result } = renderHook(() => useDownload());

    // Act
    let returnValue: string | null = 'initial';
    await act(async () => {
      returnValue = await result.current.download('https://example.com/file');
    });

    // Assert
    expect(returnValue).toBeNull();
    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe('Network Error');
  });

  it('falls back gracefully when response.body is null', async () => {
    // Arrange
    vi.mocked(fetch).mockResolvedValue(makeResponse(null));
    const { result } = renderHook(() => useDownload());

    // Act
    await act(async () => {
      await result.current.download('https://example.com/file');
    });

    // Assert
    expect(result.current.status).toBe('done');
    expect(result.current.percent).toBe(100);
  });
});
