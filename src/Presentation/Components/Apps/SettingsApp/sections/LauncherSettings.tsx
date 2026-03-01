import { type FC, useCallback, useDeferredValue, useEffect, useState } from 'react';
import {
  ScrollArea,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Tooltip,
  UnstyledButton,
} from '@mantine/core';
import { useSettingsStore } from '@presentation/Store/settingsStore';
import AppIcon from '@presentation/Components/Shared/AppIcon/AppIcon';

const LauncherSettings: FC = () => {
  const launcherIcon = useSettingsStore(state => state.launcherIcon);
  const setLauncherIcon = useSettingsStore(state => state.setLauncherIcon);
  const [allIconNames, setAllIconNames] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    import('react-icons/fc').then(mod => {
      const names = Object.keys(mod)
        .filter(k => k.startsWith('Fc'))
        .sort();
      setAllIconNames(names);
    });
  }, []);

  const filtered = deferredSearch
    ? allIconNames.filter(n => n.toLowerCase().includes(deferredSearch.toLowerCase()))
    : allIconNames;

  const handleSelect = useCallback(
    (name: string) => {
      setLauncherIcon(name);
    },
    [setLauncherIcon],
  );

  return (
    <Stack gap="md" p="md" style={{ height: '100%' }}>
      <Text fw={600} size="lg">
        Launcher Icon
      </Text>
      <Text size="sm" c="dimmed">
        Selected: <strong>{launcherIcon}</strong>
      </Text>
      <TextInput
        placeholder="Search icons..."
        value={search}
        onChange={e => setSearch(e.currentTarget.value)}
        aria-label="Search icons"
      />
      <ScrollArea style={{ flex: 1 }}>
        <SimpleGrid cols={8} spacing={4}>
          {filtered.map(name => (
            <Tooltip key={name} label={name} withArrow openDelay={400}>
              <UnstyledButton
                onClick={() => handleSelect(name)}
                aria-label={name}
                aria-pressed={name === launcherIcon}
                style={{
                  padding: 6,
                  borderRadius: 6,
                  background:
                    name === launcherIcon ? 'var(--mantine-primary-color-light)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AppIcon fcIcon={name} size={24} />
              </UnstyledButton>
            </Tooltip>
          ))}
        </SimpleGrid>
      </ScrollArea>
    </Stack>
  );
};

export default LauncherSettings;
