import { describe, it, expect } from 'vitest';
import {
  ANIMATION_DURATION,
  EASE_IN,
  EASE_OUT,
  windowVariants,
  panelVariants,
  randomWindowPosition,
} from './Animations';

describe('Animations constants', () => {
  describe('ANIMATION_DURATION', () => {
    it('should be a positive number', () => {
      expect(ANIMATION_DURATION).toBeGreaterThan(0);
    });
  });

  describe('EASE_IN / EASE_OUT', () => {
    it('should use ANIMATION_DURATION', () => {
      expect(EASE_IN.duration).toBe(ANIMATION_DURATION);
      expect(EASE_OUT.duration).toBe(ANIMATION_DURATION);
    });

    it('should have opposite ease directions', () => {
      expect(EASE_IN.ease).toBe('easeIn');
      expect(EASE_OUT.ease).toBe('easeOut');
    });
  });

  describe('windowVariants', () => {
    it('should have hidden, visible and exit states', () => {
      expect(windowVariants).toHaveProperty('hidden');
      expect(windowVariants).toHaveProperty('visible');
      expect(windowVariants).toHaveProperty('exit');
    });

    it('hidden state should be invisible and scaled down', () => {
      expect(windowVariants.hidden).toMatchObject({ opacity: 0, scale: expect.any(Number) });
    });

    it('visible state should use EASE_OUT transition', () => {
      const visible = windowVariants.visible as { transition: { ease: string; duration: number } };
      expect(visible.transition.ease).toBe('easeOut');
      expect(visible.transition.duration).toBe(ANIMATION_DURATION);
    });

    it('exit state should use EASE_IN transition', () => {
      const exit = windowVariants.exit as { transition: { ease: string; duration: number } };
      expect(exit.transition.ease).toBe('easeIn');
      expect(exit.transition.duration).toBe(ANIMATION_DURATION);
    });
  });

  describe('panelVariants', () => {
    it('should have initial, animate and exit states', () => {
      expect(panelVariants).toHaveProperty('initial');
      expect(panelVariants).toHaveProperty('animate');
      expect(panelVariants).toHaveProperty('exit');
    });

    it('initial state should be invisible', () => {
      expect(panelVariants.initial).toMatchObject({ opacity: 0 });
    });

    it('animate state should use EASE_OUT transition', () => {
      expect(panelVariants.animate.transition.ease).toBe('easeOut');
      expect(panelVariants.animate.transition.duration).toBe(ANIMATION_DURATION);
    });

    it('exit state should use EASE_IN transition', () => {
      expect(panelVariants.exit.transition.ease).toBe('easeIn');
      expect(panelVariants.exit.transition.duration).toBe(ANIMATION_DURATION);
    });
  });

  describe('randomWindowPosition', () => {
    it('should return x within expected range', () => {
      for (let i = 0; i < 20; i++) {
        const { x } = randomWindowPosition();
        expect(x).toBeGreaterThanOrEqual(150);
        expect(x).toBeLessThan(350);
      }
    });

    it('should return y within expected range', () => {
      for (let i = 0; i < 20; i++) {
        const { y } = randomWindowPosition();
        expect(y).toBeGreaterThanOrEqual(80);
        expect(y).toBeLessThan(180);
      }
    });

    it('should return different values on successive calls', () => {
      const results = Array.from({ length: 10 }, () => randomWindowPosition());
      const uniqueX = new Set(results.map(r => r.x));
      expect(uniqueX.size).toBeGreaterThan(1);
    });
  });
});
