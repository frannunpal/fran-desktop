import type { FSNode } from '@/Shared/Types/FileSystemTypes';

export type Breadcrumb = { id: string | null; name: string };

/**
 * Builds a breadcrumb trail from the root to the given folder.
 * Always starts with `{ id: null, name: 'Home' }`.
 */
export const buildBreadcrumbs = (
  currentFolderId: string | null,
  fsNodes: FSNode[],
): Breadcrumb[] => {
  const crumbs: Breadcrumb[] = [{ id: null, name: 'Home' }];
  let id: string | null = currentFolderId;
  const trail: Breadcrumb[] = [];
  while (id !== null) {
    const node = fsNodes.find(n => n.id === id);
    if (!node) break;
    trail.unshift({ id: node.id, name: node.name });
    id = node.parentId;
  }
  return [...crumbs, ...trail];
};
