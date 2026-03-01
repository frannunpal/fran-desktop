import { type FC, useCallback, useState } from 'react';
import { Card, SimpleGrid, Stack, Text } from '@mantine/core';
import AppIcon from '@presentation/Components/Shared/AppIcon/AppIcon';
import type { WindowContentProps } from '@/Shared/Interfaces/IWindowContentProps';
import { SETTINGS_SECTIONS, type SettingsSection } from './sections/sectionRegistry';
import WallpaperSettings from './sections/WallpaperSettings';
import AppearanceSettings from './sections/AppearanceSettings';
import LauncherSettings from './sections/LauncherSettings';
import FontSettings from './sections/FontSettings';
import classes from './SettingsApp.module.css';

type SectionId = SettingsSection['id'];

const SECTION_COMPONENTS: Record<SectionId, FC> = {
  wallpaper: WallpaperSettings,
  appearance: AppearanceSettings,
  launcher: LauncherSettings,
  font: FontSettings,
};

const SettingsApp: FC<WindowContentProps> = () => {
  const [activeSectionId, setActiveSectionId] = useState<SectionId | null>(null);

  const handleSelectSection = useCallback((id: SectionId) => {
    setActiveSectionId(id);
  }, []);

  const handleShowAll = useCallback(() => {
    setActiveSectionId(null);
  }, []);

  const ActiveSection = activeSectionId ? SECTION_COMPONENTS[activeSectionId] : null;

  return (
    <div className={classes.root}>
      <aside className={classes.sidebar}>
        <nav aria-label="Settings sections">
          <button
            className={classes.navItem}
            data-active={activeSectionId === null || undefined}
            onClick={handleShowAll}
            aria-label="All Settings"
            aria-current={activeSectionId === null ? 'page' : undefined}
          >
            <AppIcon fcIcon="FcList" size={16} />
            <Text size="xs" ml={6} truncate>
              All Settings
            </Text>
          </button>
          {SETTINGS_SECTIONS.map(section => (
            <button
              key={section.id}
              className={classes.navItem}
              data-active={activeSectionId === section.id || undefined}
              onClick={() => handleSelectSection(section.id)}
              aria-label={section.label}
              aria-current={activeSectionId === section.id ? 'page' : undefined}
            >
              <AppIcon fcIcon={section.fcIcon} size={16} />
              <Text size="xs" ml={6} truncate>
                {section.label}
              </Text>
            </button>
          ))}
        </nav>
      </aside>

      <main className={classes.content}>
        {ActiveSection ? (
          <ActiveSection />
        ) : (
          <div className={classes.overviewPadding}>
            <Text fw={500} mb="md" size="sm" c="dimmed">
              Settings
            </Text>
            <SimpleGrid cols={2} spacing="sm">
              {SETTINGS_SECTIONS.map(section => (
                <Card
                  key={section.id}
                  withBorder
                  padding="md"
                  radius="md"
                  className={classes.sectionCard}
                  onClick={() => handleSelectSection(section.id)}
                  role="button"
                  aria-label={`Open ${section.label} settings`}
                >
                  <Stack gap={6} align="flex-start">
                    <AppIcon fcIcon={section.fcIcon} size={28} />
                    <Text size="sm" fw={500}>
                      {section.label}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {section.description}
                    </Text>
                  </Stack>
                </Card>
              ))}
            </SimpleGrid>
          </div>
        )}
      </main>
    </div>
  );
};

export default SettingsApp;
