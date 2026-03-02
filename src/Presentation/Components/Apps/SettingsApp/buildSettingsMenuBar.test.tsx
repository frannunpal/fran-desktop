// @vitest-environment jsdom
import '@/Shared/Testing/__mocks__/jsdom-setup';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createLocalStorageMock } from '@/Shared/Testing/__mocks__/localStorage.mock';
import { resetDesktopStore } from '@/Shared/Testing/Utils/resetDesktopStore';
import { useDesktopStore } from '@presentation/Store/desktopStore';

const localStorageMock = createLocalStorageMock();
vi.stubGlobal('localStorage', localStorageMock);

const { buildSettingsMenuBar } = await import('./buildSettingsMenuBar');

describe('buildSettingsMenuBar', () => {
  beforeEach(() => {
    localStorageMock.clear();
    resetDesktopStore(useDesktopStore, localStorageMock, () => {});
  });

  it('should build a menu bar with File menu', () => {
    const onDiscard = vi.fn();
    const onExit = vi.fn();
    const isDirty = false;

    const menuBar = buildSettingsMenuBar(onDiscard, onExit, isDirty);

    expect(menuBar).toHaveLength(1);
    expect(menuBar[0].type).toBe('menu');
    if (menuBar[0].type === 'menu') {
      expect(menuBar[0].label).toBe('File');
    }
  });

  it('should include Discard Changes item disabled when not dirty', () => {
    const onDiscard = vi.fn();
    const onExit = vi.fn();
    const isDirty = false;

    const menuBar = buildSettingsMenuBar(onDiscard, onExit, isDirty);
    const fileMenu = menuBar[0];
    const discardItem =
      fileMenu.type === 'menu'
        ? fileMenu.items.find(item => item.type === 'item' && item.label === 'Discard Changes')
        : undefined;

    expect(discardItem).toBeDefined();
    if (discardItem && discardItem.type === 'item') {
      expect(discardItem.disabled).toBe(true);
    }
  });

  it('should include Discard Changes item enabled when dirty', () => {
    const onDiscard = vi.fn();
    const onExit = vi.fn();
    const isDirty = true;

    const menuBar = buildSettingsMenuBar(onDiscard, onExit, isDirty);
    const fileMenu = menuBar[0];
    const discardItem =
      fileMenu.type === 'menu'
        ? fileMenu.items.find(item => item.type === 'item' && item.label === 'Discard Changes')
        : undefined;

    expect(discardItem).toBeDefined();
    if (discardItem && discardItem.type === 'item') {
      expect(discardItem.disabled).toBe(false);
    }
  });

  it('should call onDiscard when Discard Changes is clicked', () => {
    const onDiscard = vi.fn();
    const onExit = vi.fn();
    const isDirty = false;

    const menuBar = buildSettingsMenuBar(onDiscard, onExit, isDirty);
    const fileMenu = menuBar[0];
    const discardItem =
      fileMenu.type === 'menu'
        ? fileMenu.items.find(item => item.type === 'item' && item.label === 'Discard Changes')
        : undefined;

    if (discardItem && discardItem.type === 'item') {
      discardItem.onClick();
    }

    expect(onDiscard).toHaveBeenCalledTimes(1);
  });

  it('should call onExit when Exit is clicked', () => {
    const onDiscard = vi.fn();
    const onExit = vi.fn();
    const isDirty = false;

    const menuBar = buildSettingsMenuBar(onDiscard, onExit, isDirty);
    const fileMenu = menuBar[0];
    const exitItem =
      fileMenu.type === 'menu'
        ? fileMenu.items.find(item => item.type === 'item' && item.label === 'Exit')
        : undefined;

    if (exitItem && exitItem.type === 'item') {
      exitItem.onClick();
    }

    expect(onExit).toHaveBeenCalledTimes(1);
  });

  it('should have divider between Discard and Exit', () => {
    const onDiscard = vi.fn();
    const onExit = vi.fn();
    const isDirty = false;

    const menuBar = buildSettingsMenuBar(onDiscard, onExit, isDirty);
    const fileMenu = menuBar[0];

    if (fileMenu.type === 'menu') {
      expect(fileMenu.items).toHaveLength(3);
      expect(fileMenu.items[0].type).toBe('item');
      if (fileMenu.items[0].type === 'item') {
        expect(fileMenu.items[0].label).toBe('Discard Changes');
      }
      expect(fileMenu.items[1].type).toBe('divider');
      expect(fileMenu.items[2].type).toBe('item');
      if (fileMenu.items[2].type === 'item') {
        expect(fileMenu.items[2].label).toBe('Exit');
      }
    }
  });

  it('should show rightSection icon when isDirty is true', () => {
    const onDiscard = vi.fn();
    const onExit = vi.fn();
    const isDirty = true;

    const menuBar = buildSettingsMenuBar(onDiscard, onExit, isDirty);
    const fileMenu = menuBar[0];

    if (fileMenu.type === 'menu') {
      expect(fileMenu.rightSection).toBeDefined();
      expect(fileMenu.icon).toBeUndefined();
    }
  });

  it('should not show rightSection icon when isDirty is false', () => {
    const onDiscard = vi.fn();
    const onExit = vi.fn();
    const isDirty = false;

    const menuBar = buildSettingsMenuBar(onDiscard, onExit, isDirty);
    const fileMenu = menuBar[0];

    if (fileMenu.type === 'menu') {
      expect(fileMenu.rightSection).toBeUndefined();
      expect(fileMenu.icon).toBeUndefined();
    }
  });
});
