import { describe, it, expect } from 'vitest';
import { sortNodes } from './sortNodes';
import type { FSNode } from '@/Shared/Types/FileSystemTypes';

const makeNode = (id: string, name: string, type: 'file' | 'folder'): FSNode =>
  ({
    id,
    name,
    type,
    parentId: null,
    children: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  }) as FSNode;

describe('sortNodes', () => {
  it('should return folders before files', () => {
    // Arrange
    const nodes: FSNode[] = [
      makeNode('f1', 'notes.txt', 'file'),
      makeNode('d1', 'Documents', 'folder'),
    ];

    // Act
    const result = sortNodes(nodes);

    // Assert
    expect(result[0].type).toBe('folder');
    expect(result[1].type).toBe('file');
  });

  it('should sort folders alphabetically', () => {
    // Arrange
    const nodes: FSNode[] = [
      makeNode('d2', 'Zebra', 'folder'),
      makeNode('d1', 'Alpha', 'folder'),
      makeNode('d3', 'Mango', 'folder'),
    ];

    // Act
    const result = sortNodes(nodes);

    // Assert
    expect(result.map(n => n.name)).toEqual(['Alpha', 'Mango', 'Zebra']);
  });

  it('should sort files alphabetically', () => {
    // Arrange
    const nodes: FSNode[] = [
      makeNode('f3', 'z.txt', 'file'),
      makeNode('f1', 'a.txt', 'file'),
      makeNode('f2', 'm.txt', 'file'),
    ];

    // Act
    const result = sortNodes(nodes);

    // Assert
    expect(result.map(n => n.name)).toEqual(['a.txt', 'm.txt', 'z.txt']);
  });

  it('should return an empty array when given no nodes', () => {
    // Act & Assert
    expect(sortNodes([])).toEqual([]);
  });

  it('should not mutate the original array', () => {
    // Arrange
    const nodes: FSNode[] = [makeNode('f1', 'b.txt', 'file'), makeNode('f2', 'a.txt', 'file')];
    const original = [...nodes];

    // Act
    sortNodes(nodes);

    // Assert
    expect(nodes).toEqual(original);
  });
});
