import { PRESET_COLORS } from '../Constants/Colors';

export function getFourRandomColors(count: number = 4): string[] {
  const shuffled = [...PRESET_COLORS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
