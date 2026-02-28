import type { FC } from 'react';
import { useFcIconElement } from '@presentation/Hooks/useFcIcon';

interface AppIconProps {
  /** Flat Color icon name (e.g. "FcEditImage"). Rendered async; falls back to `fallback`. */
  fcIcon?: string;
  /** Emoji / text shown while the FC icon loads or when fcIcon is absent. */
  fallback?: string;
  size?: number;
}

/**
 * Renders a Flat Color icon when available, falling back to an emoji/text span.
 * Used wherever an app icon with an optional emoji fallback is needed.
 */
const AppIcon: FC<AppIconProps> = ({ fcIcon, fallback, size = 20 }) => {
  const fcElement = useFcIconElement(fcIcon ?? '', { size });
  if (fcElement) return fcElement;
  if (fallback) return <span aria-hidden="true">{fallback}</span>;
  return null;
};

export default AppIcon;
