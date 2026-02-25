import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { useDesktopStore } from '@presentation/Store/desktopStore';
import { toMantineTheme } from '@infrastructure/Adapters/MantineThemeAdapter';

function App() {
  const theme = useDesktopStore(state => state.theme);

  return (
    <MantineProvider theme={toMantineTheme(theme)} forceColorScheme={theme.mode}>
      {/* Presentation layer components will be mounted here */}
    </MantineProvider>
  );
}

export default App;
