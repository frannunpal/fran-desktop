import { useEffect } from 'react';
import { useSettingsStore } from '@presentation/Store/settingsStore';
import { FONT_STACKS, GOOGLE_FONTS_HREF } from '@/Shared/Constants/Fonts';

export { FONT_STACKS, GOOGLE_FONTS_HREF };

/**
 * Applies the currently selected font stack to the document root.
 * Also re-injects <link> tags for all previously downloaded fonts on mount.
 */
export const useApplyFont = (): void => {
  const font = useSettingsStore(state => state.font);
  const downloadedFonts = useSettingsStore(state => state.downloadedFonts);

  useEffect(() => {
    downloadedFonts.forEach(injectFontLink);
  }, [downloadedFonts]);

  useEffect(() => {
    const stack = FONT_STACKS[font] ?? FONT_STACKS['system-ui'];
    document.documentElement.style.setProperty('font-family', stack);
  }, [font]);
};

/**
 * Injects a Google Fonts <link> tag into the document head for the given font.
 * Safe to call multiple times — deduplicates by data-font attribute.
 */
export const injectFontLink = (font: string): void => {
  const href = GOOGLE_FONTS_HREF[font];
  if (!href) return;
  const existing = document.head.querySelector<HTMLLinkElement>(`link[data-font="${font}"]`);
  if (existing) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.setAttribute('data-font', font);
  document.head.appendChild(link);
};
