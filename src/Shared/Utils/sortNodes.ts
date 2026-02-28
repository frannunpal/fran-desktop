import type { FSNode } from '@/Shared/Types/FileSystemTypes';

/**
 * Sorts an array of filesystem nodes: folders first, then files, each group
 * sorted alphabetically by name (locale-aware, case-insensitive).
 */
export const sortNodes = (nodes: FSNode[]): FSNode[] => {
  const folders = nodes.filter(n => n.type === 'folder');
  const files = nodes.filter(n => n.type === 'file');
  const byName = (a: FSNode, b: FSNode) => a.name.localeCompare(b.name);
  return [...folders.sort(byName), ...files.sort(byName)];
};
