import { type FC, useCallback, useRef, useState } from 'react';
import { Button, TextInput, Stack, Text, Group } from '@mantine/core';
import { useSettingsStore } from '@presentation/Store/settingsStore';
import defaultWallpaperSrc from '/Images/wallpaper.jpg';

const WallpaperSettings: FC = () => {
  const wallpaper = useSettingsStore(state => state.wallpaper);
  const setWallpaper = useSettingsStore(state => state.setWallpaper);
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewSrc = wallpaper ?? defaultWallpaperSrc;

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = evt => {
        const result = evt.target?.result;
        if (typeof result === 'string') setWallpaper(result);
      };
      reader.readAsDataURL(file);
    },
    [setWallpaper],
  );

  const handleUrlApply = useCallback(() => {
    const trimmed = urlInput.trim();
    if (trimmed) setWallpaper(trimmed);
  }, [urlInput, setWallpaper]);

  const handleReset = useCallback(() => {
    setWallpaper(null);
    setUrlInput('');
  }, [setWallpaper]);

  return (
    <Stack gap="md" p="md">
      <Text fw={600} size="lg">
        Wallpaper
      </Text>
      <img
        src={previewSrc}
        alt="Wallpaper preview"
        style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 8 }}
      />
      <Group>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFileChange}
          aria-label="Upload wallpaper file"
        />
        <Button variant="light" onClick={() => fileInputRef.current?.click()}>
          Upload from disk
        </Button>
        <Button variant="subtle" color="red" onClick={handleReset}>
          Reset to default
        </Button>
      </Group>
      <Group align="flex-end">
        <TextInput
          label="Or enter a URL"
          placeholder="https://example.com/image.jpg"
          value={urlInput}
          onChange={e => setUrlInput(e.currentTarget.value)}
          style={{ flex: 1 }}
        />
        <Button onClick={handleUrlApply} disabled={!urlInput.trim()}>
          Apply
        </Button>
      </Group>
    </Stack>
  );
};

export default WallpaperSettings;
