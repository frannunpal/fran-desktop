export interface SettingsSection {
  id: 'wallpaper' | 'appearance' | 'launcher' | 'font';
  label: string;
  fcIcon: string;
  description: string;
}

export const SETTINGS_SECTIONS: SettingsSection[] = [
  {
    id: 'wallpaper',
    label: 'Wallpaper',
    fcIcon: 'FcPicture',
    description: 'Change the desktop background image.',
  },
  {
    id: 'appearance',
    label: 'Appearance',
    fcIcon: 'FcBinoculars',
    description: 'Switch between light and dark mode.',
  },
  {
    id: 'launcher',
    label: 'Launcher',
    fcIcon: 'FcElectronics',
    description: 'Choose the launcher button icon.',
  },
  {
    id: 'font',
    label: 'Font',
    fcIcon: 'FcEditImage',
    description: 'Select the system font family.',
  },
];
