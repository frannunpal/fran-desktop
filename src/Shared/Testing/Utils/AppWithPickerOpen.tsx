import { useEffect } from 'react';
import Window from '@presentation/Components/Window/Window';
import { WindowButtonRegistryProvider } from '@presentation/Hooks/useWindowButtonRegistry';
import { useDesktopStore } from '@presentation/Store/desktopStore';
import type { WindowEntity } from '@/Shared/Interfaces/WindowEntity';
import type { FSNode } from '@/Shared/Types/FileSystemTypes';

export interface AppWithPickerOpenProps {
  win: WindowEntity;
  fsNodes?: FSNode[];
}

/**
 * Storybook wrapper that renders an app inside a fully-decorated Window
 * (title bar + window controls + menu bar via AppRegistry).
 * Seeds the store with the provided window and optional fs nodes.
 */
const AppWithPickerOpen = ({ win, fsNodes = [] }: AppWithPickerOpenProps) => {
  useEffect(() => {
    useDesktopStore.setState({ windows: [win], fsNodes });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <WindowButtonRegistryProvider>
      <div style={{ position: 'relative', width: win.width, height: win.height }}>
        <Window window={win} />
      </div>
    </WindowButtonRegistryProvider>
  );
};

export default AppWithPickerOpen;
