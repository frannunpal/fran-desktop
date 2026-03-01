import { type FC, useCallback, useRef, useState } from 'react';
import { Badge, Button, Group, Paper, Radio, Stack, Text, TextInput } from '@mantine/core';
import { useSettingsStore } from '@presentation/Store/settingsStore';
import { AVAILABLE_FONTS, GOOGLE_FONTS_HREF } from '@/Shared/Constants/Fonts';
import { type DownloadState } from '@presentation/Hooks/useDownload';
import { injectFontLink } from '@presentation/Hooks/useApplyFont';
import DownloadProgress from '@presentation/Components/Shared/DownloadProgress/DownloadProgress';
import { PRESET_COLORS } from '@/Shared/Constants/Colors';

// PRESET_COLORS[1] is #fa5252 (red)
const ERROR_COLOR = PRESET_COLORS[1];

const IDLE_STATE: DownloadState = {
  status: 'idle',
  loaded: 0,
  total: null,
  percent: null,
  error: null,
};

async function streamFontCss(
  href: string,
  onProgress: (state: DownloadState) => void,
): Promise<boolean> {
  onProgress({ status: 'downloading', loaded: 0, total: null, percent: null, error: null });

  let response: Response;
  try {
    response = await fetch(href);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    onProgress({ status: 'error', loaded: 0, total: null, percent: null, error: message });
    return false;
  }

  if (!response.ok) {
    onProgress({
      status: 'error',
      loaded: 0,
      total: null,
      percent: null,
      error: `HTTP ${response.status}: ${response.statusText}`,
    });
    return false;
  }

  const contentLength = response.headers.get('Content-Length');
  const total = contentLength ? parseInt(contentLength, 10) : null;

  if (!response.body) {
    await response.text();
    onProgress({ status: 'done', loaded: 0, total: null, percent: 100, error: null });
    return true;
  }

  const reader = response.body.getReader();
  let loaded = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      loaded += value.byteLength;
      const percent = total ? Math.round((loaded / total) * 100) : null;
      onProgress({ status: 'downloading', loaded, total, percent, error: null });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    onProgress({ status: 'error', loaded, total, percent: null, error: message });
    return false;
  }

  onProgress({ status: 'done', loaded, total: total ?? loaded, percent: 100, error: null });
  return true;
}

const FontDownloadStatus: FC<{
  fontName: string;
  fontLabel: string;
  downloadState: DownloadState;
  onDownload: (fontName: string) => void;
  alreadyDownloaded?: boolean;
}> = ({ fontName, fontLabel, downloadState, onDownload, alreadyDownloaded }) => {
  const { status, error } = downloadState;

  if (alreadyDownloaded || status === 'done') return null;

  if (error) {
    return (
      <Badge color={ERROR_COLOR} variant="filled" size="sm" aria-label={`Download error: ${error}`}>
        error
      </Badge>
    );
  }

  if (status === 'downloading') {
    return <DownloadProgress state={downloadState} />;
  }

  // idle
  return (
    <Button
      size="xs"
      variant="light"
      onClick={() => onDownload(fontName)}
      aria-label={`Download ${fontLabel}`}
    >
      Download
    </Button>
  );
};

const FontSettings: FC = () => {
  const font = useSettingsStore(state => state.font);
  const setFont = useSettingsStore(state => state.setFont);
  const downloadedFonts = useSettingsStore(state => state.downloadedFonts);
  const markFontDownloaded = useSettingsStore(state => state.markFontDownloaded);

  // Per-font download states for the preset fonts
  const [fontDownloads, setFontDownloads] = useState<Record<string, DownloadState>>({});
  const getFontState = (name: string): DownloadState => fontDownloads[name] ?? IDLE_STATE;
  const setFontState = useCallback((name: string, state: DownloadState) => {
    setFontDownloads(prev => ({ ...prev, [name]: state }));
  }, []);

  const handleDownloadFont = useCallback(
    async (fontName: string) => {
      const href = GOOGLE_FONTS_HREF[fontName];
      if (!href) {
        setFontState(fontName, {
          status: 'error',
          loaded: 0,
          total: null,
          percent: null,
          error: 'No download URL available',
        });
        return;
      }
      const ok = await streamFontCss(href, state => setFontState(fontName, state));
      if (ok) {
        injectFontLink(fontName);
        markFontDownloaded(fontName);
      }
    },
    [setFontState, markFontDownloaded],
  );

  // Custom font input
  const [customFontName, setCustomFontName] = useState('');
  const [customState, setCustomState] = useState<DownloadState>(IDLE_STATE);
  const prevCustomName = useRef('');

  const handleCustomNameChange = useCallback(
    (value: string) => {
      setCustomFontName(value);
      // Clear error badge when user types a new name
      if (customState.status === 'error' && value !== prevCustomName.current) {
        setCustomState(IDLE_STATE);
      }
      prevCustomName.current = value;
    },
    [customState.status],
  );

  const handleDownloadCustomFont = useCallback(async () => {
    const name = customFontName.trim();
    if (!name) return;
    const familyParam = name.replace(/\s+/g, '+');
    const href = `https://fonts.googleapis.com/css2?family=${familyParam}&display=swap`;

    const ok = await streamFontCss(href, setCustomState);
    if (ok) {
      const existing = document.head.querySelector<HTMLLinkElement>(`link[data-font="${name}"]`);
      if (!existing) {
        const el = document.createElement('link');
        el.rel = 'stylesheet';
        el.href = href;
        el.setAttribute('data-font', name);
        document.head.appendChild(el);
      }
    }
  }, [customFontName]);

  return (
    <Stack gap="md" p="md">
      <Text fw={600} size="lg">
        Font
      </Text>
      <Text size="sm" c="dimmed">
        Changes the font across the entire desktop interface. Fonts must be downloaded before use.
      </Text>

      <Radio.Group value={font} onChange={setFont} aria-label="Font selection">
        <Stack gap="xs">
          {AVAILABLE_FONTS.map(f => {
            const hasGoogleFont = !!GOOGLE_FONTS_HREF[f.value];
            const isDownloaded = downloadedFonts.includes(f.value);
            const dl = getFontState(f.value);
            const isReady = !hasGoogleFont || isDownloaded || dl.status === 'done';

            return (
              <Paper key={f.value} p="sm" withBorder radius="md">
                <Stack gap="xs">
                  <Group justify="space-between">
                    <Radio
                      value={f.value}
                      label={f.label}
                      aria-label={f.label}
                      disabled={!isReady}
                    />
                    <Group gap="xs" align="center">
                      {isReady && (
                        <Text size="sm" c="dimmed" style={{ fontFamily: f.stack }}>
                          AaBbCcDd
                        </Text>
                      )}
                      {hasGoogleFont && (
                        <FontDownloadStatus
                          fontName={f.value}
                          fontLabel={f.label}
                          downloadState={dl}
                          onDownload={handleDownloadFont}
                          alreadyDownloaded={isDownloaded}
                        />
                      )}
                    </Group>
                  </Group>
                  {hasGoogleFont && dl.status === 'downloading' && <DownloadProgress state={dl} />}
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      </Radio.Group>

      <Paper p="sm" withBorder radius="md">
        <Stack gap="xs">
          <Text size="sm" fw={500}>
            Download a font by name
          </Text>
          <Group gap="xs" align="flex-start">
            <TextInput
              placeholder="e.g. Open Sans"
              value={customFontName}
              onChange={e => handleCustomNameChange(e.currentTarget.value)}
              style={{ flex: 1 }}
              aria-label="Custom font name"
              error={
                customState.status === 'error'
                  ? (customState.error ?? 'Download failed')
                  : undefined
              }
            />
            <Button
              onClick={handleDownloadCustomFont}
              disabled={!customFontName.trim() || customState.status === 'downloading'}
              loading={customState.status === 'downloading'}
              aria-label="Download custom font"
              style={{ marginTop: customState.status === 'error' ? 0 : undefined }}
            >
              Download
            </Button>
          </Group>
          {customState.status === 'downloading' && <DownloadProgress state={customState} />}
          {customState.status === 'done' && (
            <Text size="xs" c="dimmed">
              Downloaded successfully.
            </Text>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
};

export default FontSettings;
