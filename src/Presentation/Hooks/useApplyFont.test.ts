// @vitest-environment jsdom
import '@/Shared/Testing/__mocks__/jsdom-setup';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { createLocalStorageMock } from '@/Shared/Testing/__mocks__/localStorage.mock';

const localStorageMock = createLocalStorageMock();
vi.stubGlobal('localStorage', localStorageMock);

const { useSettingsStore } = await import('@presentation/Store/settingsStore');
const { useApplyFont, injectFontLink } = await import('./useApplyFont');

describe('useApplyFont', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    useSettingsStore.setState({ font: 'system-ui', downloadedFonts: [] });
    document.documentElement.style.removeProperty('font-family');
    document.documentElement.style.removeProperty('--mantine-font-family');
    document.head.querySelectorAll('link[data-font]').forEach(el => el.remove());
  });

  it('should apply system-ui font stack to :root when font is system-ui', () => {
    // Arrange
    useSettingsStore.setState({ font: 'system-ui' });

    // Act
    renderHook(() => useApplyFont());

    // Assert
    expect(document.documentElement.style.getPropertyValue('font-family')).toContain('system-ui');
    expect(document.documentElement.style.getPropertyValue('--mantine-font-family')).toContain(
      'system-ui',
    );
  });

  it('should fall back to system-ui stack for unknown font value', () => {
    // Arrange
    useSettingsStore.setState({ font: 'UnknownFont' });

    // Act
    renderHook(() => useApplyFont());

    // Assert
    expect(document.documentElement.style.getPropertyValue('font-family')).toContain('system-ui');
  });

  it('should NOT inject any link tag when downloadedFonts is empty', () => {
    // Arrange
    useSettingsStore.setState({ font: 'Source Code Pro', downloadedFonts: [] });

    // Act
    renderHook(() => useApplyFont());

    // Assert
    const link = document.head.querySelector('link[data-font="Source Code Pro"]');
    expect(link).toBeNull();
  });

  it('should re-inject link tags for fonts in downloadedFonts on mount', () => {
    // Arrange
    useSettingsStore.setState({ font: 'system-ui', downloadedFonts: ['Source Code Pro'] });

    // Act
    renderHook(() => useApplyFont());

    // Assert
    const link = document.head.querySelector<HTMLLinkElement>('link[data-font="Source Code Pro"]');
    expect(link).not.toBeNull();
    expect(link?.getAttribute('href')).toContain('Source+Code+Pro');
  });
});

describe('injectFontLink', () => {
  beforeEach(() => {
    document.head.querySelectorAll('link[data-font]').forEach(el => el.remove());
  });

  it('should inject a <link> tag for a known Google Font', () => {
    // Act
    injectFontLink('Open Sans');

    // Assert
    const link = document.head.querySelector<HTMLLinkElement>('link[data-font="Open Sans"]');
    expect(link).not.toBeNull();
    expect(link?.getAttribute('href')).toContain('Open+Sans');
  });

  it('should not inject a duplicate link tag when called twice', () => {
    // Act
    injectFontLink('Source Code Pro');
    injectFontLink('Source Code Pro');

    // Assert
    const links = document.head.querySelectorAll('link[data-font="Source Code Pro"]');
    expect(links.length).toBe(1);
  });

  it('should do nothing for an unknown font (no URL in GOOGLE_FONTS_HREF)', () => {
    // Act
    injectFontLink('UnknownFont');

    // Assert
    const link = document.head.querySelector('link[data-font="UnknownFont"]');
    expect(link).toBeNull();
  });

  it('should do nothing for system-ui (no Google Fonts URL)', () => {
    // Act
    injectFontLink('system-ui');

    // Assert
    const link = document.head.querySelector('link[data-font="system-ui"]');
    expect(link).toBeNull();
  });
});
