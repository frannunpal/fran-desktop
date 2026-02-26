import { useState, useEffect } from 'react';
import type { IconType } from 'react-icons';

export const useFcIcon = (name: string): IconType | null => {
  const [Icon, setIcon] = useState<IconType | null>(null);

  useEffect(() => {
    if (!name) return;
    import('react-icons/fc').then(mod => {
      setIcon(() => (mod as unknown as Record<string, IconType>)[name] ?? null);
    });
  }, [name]);

  return Icon;
};
