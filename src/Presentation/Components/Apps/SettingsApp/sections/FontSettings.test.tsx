// @vitest-environment jsdom
import '@/Shared/Testing/__mocks__/jsdom-setup';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithMantine as wrapper } from '@/Shared/Testing/Utils/renderWithMantine';
import { createLocalStorageMock } from '@/Shared/Testing/__mocks__/localStorage.mock';

const localStorageMock = createLocalStorageMock();
vi.stubGlobal('localStorage', localStorageMock);
vi.stubGlobal('fetch', vi.fn());

vi.mock('@presentation/Components/Shared/DownloadProgress/DownloadProgress', () => ({
  default: ({ state }: { state: { status: string; loaded: number } }) => (
    <div data-testid="download-progress" data-status={state.status} data-loaded={state.loaded} />
  ),
}));

vi.mock('@presentation/Hooks/useApplyFont', () => ({
  injectFontLink: vi.fn(),
}));

const { useSettingsStore } = await import('@presentation/Store/settingsStore');
const { default: FontSettings } = await import('./FontSettings');

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
  if (contentLength !== undefined) headers.set('Content-Length', String(contentLength));
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText,
    headers,
    body,
    text: async () => '',
  } as unknown as Response;
}

describe('FontSettings', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    useSettingsStore.setState({ font: 'system-ui', downloadedFonts: [] });
    document.head.querySelectorAll('link[data-font]').forEach(el => el.remove());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders all preset font entries', () => {
    // Act
    render(<FontSettings />, { wrapper });

    // Assert
    expect(screen.getByRole('radio', { name: 'System Default' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Hack' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Source Code Pro' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Open Sans' })).toBeInTheDocument();
  });

  it('system-ui radio is enabled by default (no download needed)', () => {
    // Act
    render(<FontSettings />, { wrapper });

    // Assert
    expect(screen.getByRole('radio', { name: 'System Default' })).not.toBeDisabled();
  });

  it('Google Font radios are disabled until downloaded', () => {
    // Act
    render(<FontSettings />, { wrapper });

    // Assert — Hack (Courier New) has no Google Font so it's always enabled
    expect(screen.getByRole('radio', { name: 'Hack' })).not.toBeDisabled();
    expect(screen.getByRole('radio', { name: 'Source Code Pro' })).toBeDisabled();
    expect(screen.getByRole('radio', { name: 'Open Sans' })).toBeDisabled();
  });

  it('shows Download button only for fonts with a Google Fonts URL', () => {
    // Act
    render(<FontSettings />, { wrapper });

    // Assert
    expect(screen.queryByRole('button', { name: 'Download Hack' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Download Source Code Pro' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Download Open Sans' })).toBeInTheDocument();
  });

  it('does not show a Download button for System Default', () => {
    // Act
    render(<FontSettings />, { wrapper });

    // Assert
    expect(
      screen.queryByRole('button', { name: 'Download System Default' }),
    ).not.toBeInTheDocument();
  });

  it('font in downloadedFonts shows no Download button and radio is enabled', () => {
    // Arrange
    useSettingsStore.setState({ downloadedFonts: ['Source Code Pro'] });

    // Act
    render(<FontSettings />, { wrapper });

    // Assert
    expect(
      screen.queryByRole('button', { name: 'Download Source Code Pro' }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Source Code Pro' })).not.toBeDisabled();
  });

  it('enables the radio and hides Download button after successful download', async () => {
    // Arrange
    const chunk = new Uint8Array(50);
    vi.mocked(fetch).mockResolvedValue(makeResponse(makeStream([chunk]), { contentLength: 50 }));
    render(<FontSettings />, { wrapper });

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Download Source Code Pro' }));

    // Assert
    await waitFor(() => {
      expect(
        screen.queryByRole('button', { name: 'Download Source Code Pro' }),
      ).not.toBeInTheDocument();
    });
    expect(screen.getByRole('radio', { name: 'Source Code Pro' })).not.toBeDisabled();
  });

  it('calls markFontDownloaded after successful download', async () => {
    // Arrange
    const chunk = new Uint8Array(50);
    vi.mocked(fetch).mockResolvedValue(makeResponse(makeStream([chunk]), { contentLength: 50 }));
    render(<FontSettings />, { wrapper });

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Download Source Code Pro' }));

    // Assert
    await waitFor(() => {
      expect(useSettingsStore.getState().downloadedFonts).toContain('Source Code Pro');
    });
  });

  it('shows error badge when download fails', async () => {
    // Arrange
    vi.mocked(fetch).mockRejectedValue(new Error('Network Error'));
    render(<FontSettings />, { wrapper });

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Download Source Code Pro' }));

    // Assert
    await waitFor(() => {
      expect(screen.getByLabelText(/Download error/)).toBeInTheDocument();
    });
    // Download button should be replaced by error badge
    expect(
      screen.queryByRole('button', { name: 'Download Source Code Pro' }),
    ).not.toBeInTheDocument();
  });

  it('shows error badge on HTTP error', async () => {
    // Arrange
    vi.mocked(fetch).mockResolvedValue(
      makeResponse(null, { status: 404, statusText: 'Not Found' }),
    );
    render(<FontSettings />, { wrapper });

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Download Source Code Pro' }));

    // Assert
    await waitFor(() => {
      expect(screen.getByLabelText(/Download error/)).toBeInTheDocument();
    });
  });

  it('renders custom font download input and button', () => {
    // Act
    render(<FontSettings />, { wrapper });

    // Assert
    expect(screen.getByRole('textbox', { name: 'Custom font name' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Download custom font' })).toBeInTheDocument();
  });

  it('custom download button is disabled when input is empty', () => {
    // Act
    render(<FontSettings />, { wrapper });

    // Assert
    expect(screen.getByRole('button', { name: 'Download custom font' })).toBeDisabled();
  });

  it('custom download button is enabled when input has text', () => {
    // Arrange
    render(<FontSettings />, { wrapper });

    // Act
    fireEvent.change(screen.getByRole('textbox', { name: 'Custom font name' }), {
      target: { value: 'Roboto' },
    });

    // Assert
    expect(screen.getByRole('button', { name: 'Download custom font' })).not.toBeDisabled();
  });

  it('shows success message after custom font downloads successfully', async () => {
    // Arrange
    const chunk = new Uint8Array(20);
    vi.mocked(fetch).mockResolvedValue(makeResponse(makeStream([chunk]), { contentLength: 20 }));
    render(<FontSettings />, { wrapper });
    fireEvent.change(screen.getByRole('textbox', { name: 'Custom font name' }), {
      target: { value: 'Roboto' },
    });

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Download custom font' }));

    // Assert
    await waitFor(() => {
      expect(screen.getByText('Downloaded successfully.')).toBeInTheDocument();
    });
  });

  it('shows error on custom input when custom download fails', async () => {
    // Arrange
    vi.mocked(fetch).mockRejectedValue(new Error('DNS failure'));
    render(<FontSettings />, { wrapper });
    fireEvent.change(screen.getByRole('textbox', { name: 'Custom font name' }), {
      target: { value: 'BadFont' },
    });

    // Act
    fireEvent.click(screen.getByRole('button', { name: 'Download custom font' }));

    // Assert
    await waitFor(() => {
      expect(screen.getByText('DNS failure')).toBeInTheDocument();
    });
  });

  it('clears custom error when user changes the input value', async () => {
    // Arrange
    vi.mocked(fetch).mockRejectedValue(new Error('DNS failure'));
    render(<FontSettings />, { wrapper });
    const input = screen.getByRole('textbox', { name: 'Custom font name' });
    fireEvent.change(input, { target: { value: 'BadFont' } });
    fireEvent.click(screen.getByRole('button', { name: 'Download custom font' }));
    await waitFor(() => expect(screen.getByText('DNS failure')).toBeInTheDocument());

    // Act
    fireEvent.change(input, { target: { value: 'GoodFont' } });

    // Assert
    await waitFor(() => {
      expect(screen.queryByText('DNS failure')).not.toBeInTheDocument();
    });
  });
});
