import '@mantine/core/styles.css';
import { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { MantineProvider } from '@mantine/core';
import { useDesktopStore } from '@presentation/Store/desktopStore';
import { toMantineTheme } from '@infrastructure/Adapters/MantineThemeAdapter';
import DesktopArea from '@presentation/Components/DesktopArea/DesktopArea';
import Window from '@presentation/Components/Window/Window';
import Taskbar from '@presentation/Components/Taskbar/Taskbar';
import DesktopIcon from '@presentation/Components/DesktopIcon/DesktopIcon';
import ContextMenu from '@presentation/Components/ContextMenu/ContextMenu';
import CalendarApp from '@presentation/Components/CalendarApp/CalendarApp';
import PdfApp from '@presentation/Components/PdfApp/PdfApp';
import { useSystemTheme } from '@presentation/Hooks/useSystemTheme';
import { useContextMenu } from '@presentation/Hooks/useContextMenu';
import { WindowButtonRegistryProvider } from '@presentation/Hooks/useWindowButtonRegistry';
import { APPS, DEFAULT_WINDOW_DIMENSIONS } from '@shared/Constants/apps';
import { randomWindowPosition } from '@shared/Constants/Animations';

const DESKTOP_ICON_POSITIONS: Record<string, { x: number; y: number }> = {
  notepad: { x: 20, y: 20 },
  terminal: { x: 20, y: 120 },
  files: { x: 20, y: 220 },
};

function App() {
  const theme = useDesktopStore(state => state.theme);
  const windows = useDesktopStore(state => state.windows);
  const icons = useDesktopStore(state => state.icons);
  const openWindow = useDesktopStore(state => state.openWindow);
  const addIcon = useDesktopStore(state => state.addIcon);
  const toggleTheme = useDesktopStore(state => state.toggleTheme);

  useSystemTheme();

  const desktopMenu = useContextMenu();

  // Seed demo data on first mount
  useEffect(() => {
    const notepad = APPS.find(a => a.id === 'notepad')!;
    if (windows.length === 0) {
      openWindow({
        title: notepad.name,
        content: notepad.id,
        icon: notepad.icon,
        fcIcon: notepad.fcIcon,
        x: 120,
        y: 80,
        width: notepad.defaultWidth ?? DEFAULT_WINDOW_DIMENSIONS.defaultWidth,
        height: notepad.defaultHeight ?? DEFAULT_WINDOW_DIMENSIONS.defaultHeight,
        minWidth: notepad.minWidth ?? DEFAULT_WINDOW_DIMENSIONS.minWidth,
        minHeight: notepad.minHeight ?? DEFAULT_WINDOW_DIMENSIONS.minHeight,
      });
    }
    if (icons.length === 0) {
      APPS.filter(a => DESKTOP_ICON_POSITIONS[a.id]).forEach(a => {
        const pos = DESKTOP_ICON_POSITIONS[a.id];
        addIcon({ name: a.name, icon: a.icon, x: pos.x, y: pos.y, appId: a.id });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenApp = (appId: string) => {
    const app = APPS.find(a => a.id === appId);
    const { x, y } = randomWindowPosition();
    openWindow({
      title: app?.name ?? appId.charAt(0).toUpperCase() + appId.slice(1),
      content: appId,
      icon: app?.icon,
      fcIcon: app?.fcIcon,
      canMaximize: app?.canMaximize,
      x,
      y,
      width: app?.defaultWidth ?? DEFAULT_WINDOW_DIMENSIONS.defaultWidth,
      height: app?.defaultHeight ?? DEFAULT_WINDOW_DIMENSIONS.defaultHeight,
      minWidth: app?.minWidth ?? DEFAULT_WINDOW_DIMENSIONS.minWidth,
      minHeight: app?.minHeight ?? DEFAULT_WINDOW_DIMENSIONS.minHeight,
    });
  };

  return (
    <WindowButtonRegistryProvider>
      <MantineProvider theme={toMantineTheme(theme)} forceColorScheme={theme.mode}>
        <DesktopArea onContextMenu={desktopMenu.open}>
          {icons.map(icon => (
            <DesktopIcon key={icon.id} icon={icon} onDoubleClick={handleOpenApp} />
          ))}
          <AnimatePresence>
            {windows.map(win => (
              <Window key={win.id} window={win}>
                {win.content === 'calendar' && <CalendarApp />}
                {win.content === 'pdf' && <PdfApp />}
              </Window>
            ))}
          </AnimatePresence>
        </DesktopArea>
        <Taskbar />
        <ContextMenu
          opened={desktopMenu.opened}
          position={desktopMenu.position}
          onClose={desktopMenu.close}
          onOpenApp={handleOpenApp}
          onToggleTheme={toggleTheme}
        />
      </MantineProvider>
    </WindowButtonRegistryProvider>
  );
}

export default App;
