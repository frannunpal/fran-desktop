export const AVAILABLE_FONTS: { value: string; label: string; stack: string }[] = [
  {
    value: 'system-ui',
    label: 'System Default',
    stack: 'system-ui, Avenir, Helvetica, Arial, sans-serif',
  },
  { value: 'Courier New', label: 'Hack', stack: '"Courier New", monospace' },
  { value: 'Source Code Pro', label: 'Source Code Pro', stack: '"Source Code Pro", monospace' },
  { value: 'Open Sans', label: 'Open Sans', stack: '"Open Sans", monospace' },
];

export const FONT_STACKS: Record<string, string> = Object.fromEntries(
  AVAILABLE_FONTS.map(f => [f.value, f.stack]),
);

export const GOOGLE_FONTS_HREF: Record<string, string> = {
  'Source Code Pro': 'https://fonts.googleapis.com/css2?family=Source+Code+Pro&display=swap',
  'Open Sans': 'https://fonts.googleapis.com/css2?family=Open+Sans&display=swap',
};
