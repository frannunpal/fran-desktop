import type { ReactNode } from 'react';
import { MantineProvider } from '@mantine/core';

export const renderWithMantine = ({ children }: { children: ReactNode }) => (
  <MantineProvider>{children}</MantineProvider>
);
