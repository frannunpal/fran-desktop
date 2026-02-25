import '@mantine/core/styles.css';
import { useEffect } from 'react';
import { MantineProvider } from '@mantine/core';
import { useDesktopStore } from '@presentation/Store/desktopStore';
import { toMantineTheme } from '@infrastructure/Adapters/MantineThemeAdapter';
import DesktopArea from '@presentation/Components/DesktopArea/DesktopArea';
import Window from '@presentation/Components/Window/Window';

function App() {
  const theme = useDesktopStore(state => state.theme);
  const windows = useDesktopStore(state => state.windows);
  const openWindow = useDesktopStore(state => state.openWindow);

  // Seed a demo window on first mount so there's something to see
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <MantineProvider theme={toMantineTheme(theme)} forceColorScheme={theme.mode}>
      <DesktopArea>
        {windows.map(win => (
          <Window key={win.id} window={win} />
        ))}
      </DesktopArea>
    </MantineProvider>
  );
}

export default App;
