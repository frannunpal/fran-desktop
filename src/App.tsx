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

function App() {
  const theme = useDesktopStore(state => state.theme);
  const windows = useDesktopStore(state => state.windows);
  const icons = useDesktopStore(state => state.icons);
  const openWindow = useDesktopStore(state => state.openWindow);
  const addIcon = useDesktopStore(state => state.addIcon);
  const toggleTheme = useDesktopStore(state => state.toggleTheme);

  const { show: showContextMenu } = useContextMenu({ id: DESKTOP_CONTEXT_MENU_ID });

  // Seed demo data on first mount
  useEffect(() => {
    if (windows.length === 0) {
      openWindow({
        title: 'Notepad',
        content: 'notepad',
        x: 120,
        y: 80,
        width: 600,
        height: 400,
        minWidth: 300,
        minHeight: 200,
      });
    }
    if (icons.length === 0) {
      addIcon({ name: 'Notepad', icon: '📝', x: 20, y: 20, appId: 'notepad' });
      addIcon({ name: 'Terminal', icon: '💻', x: 20, y: 120, appId: 'terminal' });
      addIcon({ name: 'Files', icon: '📁', x: 20, y: 220, appId: 'files' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenApp = (appId: string) => {
    openWindow({
      title: appId.charAt(0).toUpperCase() + appId.slice(1),
      content: appId,
      x: 150 + Math.random() * 200,
      y: 80 + Math.random() * 100,
      width: 600,
      height: 400,
      minWidth: 300,
      minHeight: 200,
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
