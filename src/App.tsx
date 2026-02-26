import '@mantine/core/styles.css';
import { useEffect } from 'react';
import { MantineProvider } from '@mantine/core';
import { useContextMenu } from 'react-contexify';
import { useDesktopStore } from '@presentation/Store/desktopStore';
import { toMantineTheme } from '@infrastructure/Adapters/MantineThemeAdapter';
import DesktopArea from '@presentation/Components/DesktopArea/DesktopArea';
import Window from '@presentation/Components/Window/Window';
import Taskbar from '@presentation/Components/Taskbar/Taskbar';
import DesktopIcon from '@presentation/Components/DesktopIcon/DesktopIcon';
import ContextMenu, { DESKTOP_CONTEXT_MENU_ID } from '@presentation/Components/ContextMenu/ContextMenu';
import { useSystemTheme } from '@presentation/Hooks/useSystemTheme';
import { APPS } from '@shared/Constants/apps';

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

  const { show: showContextMenu } = useContextMenu({ id: DESKTOP_CONTEXT_MENU_ID });

  // Seed demo data on first mount
  useEffect(() => {
    const notepad = APPS.find(a => a.id === 'notepad')!;
    if (windows.length === 0) {
      openWindow({
        title: notepad.name,
        content: notepad.id,
        x: 120,
        y: 80,
        width: notepad.defaultWidth ?? 600,
        height: notepad.defaultHeight ?? 400,
        minWidth: notepad.minWidth ?? 300,
        minHeight: notepad.minHeight ?? 200,
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
    openWindow({
      title: app?.name ?? appId.charAt(0).toUpperCase() + appId.slice(1),
      content: appId,
      x: 150 + Math.random() * 200,
      y: 80 + Math.random() * 100,
      width: app?.defaultWidth ?? 600,
      height: app?.defaultHeight ?? 400,
      minWidth: app?.minWidth ?? 300,
      minHeight: app?.minHeight ?? 200,
    });
  };

  return (
    <MantineProvider theme={toMantineTheme(theme)} forceColorScheme={theme.mode}>
      <DesktopArea onContextMenu={e => { e.preventDefault(); showContextMenu({ event: e }); }}>
        {icons.map(icon => (
          <DesktopIcon key={icon.id} icon={icon} onDoubleClick={handleOpenApp} />
        ))}
        {windows.map(win => (
          <Window key={win.id} window={win} />
        ))}
      </DesktopArea>
      <Taskbar />
      <ContextMenu onOpenApp={handleOpenApp} onToggleTheme={toggleTheme} />
    </MantineProvider>
  );
}

export default App;
