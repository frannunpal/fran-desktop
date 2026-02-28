import { useState, useEffect, createElement } from 'react';
import type { ReactElement } from 'react';
import type { IconType, IconBaseProps } from 'react-icons';

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

export const useFcIconElement = (name: string, props?: IconBaseProps): ReactElement | null => {
  const Icon = useFcIcon(name);
  if (!Icon) return null;
  return createElement(Icon, props);
};
