import Window from '@presentation/Components/Window/Window';
import { WindowButtonRegistryProvider } from '@presentation/Hooks/useWindowButtonRegistry';
import type { AppMenuElement } from '@/Shared/Interfaces/IAppMenuElement';
import type { makeWindow } from './makeWindow';

export interface AppWithPickerOpenProps {
  win: ReturnType<typeof makeWindow>;
  menuBar: AppMenuElement[];
  children: React.ReactNode;
}

/**
 * Storybook wrapper that renders a child app inside a fully-decorated Window
 * (title bar + window controls + menu bar). Requires `WindowButtonRegistryProvider`
 * and a `position: relative` container — both are provided here.
 */
const AppWithPickerOpen = ({ win, menuBar, children }: AppWithPickerOpenProps) => (
  <WindowButtonRegistryProvider>
    <div style={{ position: 'relative', width: win.width, height: win.height }}>
      <Window window={win} menuBar={menuBar}>
        {children}
      </Window>
    </div>
  </WindowButtonRegistryProvider>
);

export default AppWithPickerOpen;
