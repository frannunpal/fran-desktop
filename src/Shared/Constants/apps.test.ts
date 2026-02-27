import { describe, it, expect } from 'vitest';
import { APPS } from './apps';

describe('APPS constant', () => {
  it('should contain all required apps', () => {
    const ids = APPS.map(a => a.id);
    expect(ids).toContain('notepad');
    expect(ids).toContain('terminal');
    expect(ids).toContain('files');
    expect(ids).toContain('settings');
    expect(ids).toContain('calendar');
    expect(ids).toContain('pdf');
    expect(ids).toContain('createItem');
    expect(ids).toHaveLength(7);
  });

  it('should have unique ids', () => {
    const ids = APPS.map(a => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every app should have a non-empty name and icon', () => {
    for (const app of APPS) {
      expect(app.name.length).toBeGreaterThan(0);
      expect(app.icon.length).toBeGreaterThan(0);
    }
  });

  it('every app should have positive default dimensions when specified', () => {
    for (const app of APPS) {
      if (app.defaultWidth !== undefined) expect(app.defaultWidth).toBeGreaterThan(0);
      if (app.defaultHeight !== undefined) expect(app.defaultHeight).toBeGreaterThan(0);
      if (app.minWidth !== undefined) expect(app.minWidth).toBeGreaterThan(0);
      if (app.minHeight !== undefined) expect(app.minHeight).toBeGreaterThan(0);
    }
  });

  it('min dimensions should not exceed default dimensions', () => {
    for (const app of APPS) {
      if (app.defaultWidth !== undefined && app.minWidth !== undefined) {
        expect(app.minWidth).toBeLessThanOrEqual(app.defaultWidth);
      }
      if (app.defaultHeight !== undefined && app.minHeight !== undefined) {
        expect(app.minHeight).toBeLessThanOrEqual(app.defaultHeight);
      }
    }
  });
});
