import { describe, it, expect } from 'vitest';
import { createFolder, createFile } from './FileSystem';

describe('FileSystem Entities', () => {
  describe('createFolder', () => {
    it('should create a folder with the given name', () => {
      // Arrange & Act
      const folder = createFolder('Documents');

      // Assert
      expect(folder.name).toBe('Documents');
      expect(folder.type).toBe('folder');
    });

    it('should set parentId to null by default', () => {
      // Arrange & Act
      const folder = createFolder('Root');

      // Assert
      expect(folder.parentId).toBeNull();
    });

    it('should accept a parentId', () => {
      // Arrange
      const parent = createFolder('Parent');

      // Act
      const child = createFolder('Child', parent.id);

      // Assert
      expect(child.parentId).toBe(parent.id);
    });

    it('should initialize children as empty array', () => {
      // Arrange & Act
      const folder = createFolder('Empty');

      // Assert
      expect(folder.children).toEqual([]);
    });

    it('should generate a unique id', () => {
      // Arrange & Act
      const folder1 = createFolder('Folder1');
      const folder2 = createFolder('Folder2');

      // Assert
      expect(folder1.id).not.toBe(folder2.id);
    });

    it('should set createdAt and updatedAt as Date instances', () => {
      // Arrange & Act
      const folder = createFolder('Dated');

      // Assert
      expect(folder.createdAt).toBeInstanceOf(Date);
      expect(folder.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('createFile', () => {
    it('should create a file with the given name and content', () => {
      // Arrange & Act
      const file = createFile('readme.txt', 'Hello world');

      // Assert
      expect(file.name).toBe('readme.txt');
      expect(file.content).toBe('Hello world');
      expect(file.type).toBe('file');
    });

    it('should set mimeType to "text/plain" by default', () => {
      // Arrange & Act
      const file = createFile('notes.txt', 'content');

      // Assert
      expect(file.mimeType).toBe('text/plain');
    });

    it('should accept a custom mimeType', () => {
      // Arrange & Act
      const file = createFile('image.png', '', null, 'image/png');

      // Assert
      expect(file.mimeType).toBe('image/png');
    });

    it('should set parentId to null by default', () => {
      // Arrange & Act
      const file = createFile('orphan.txt', '');

      // Assert
      expect(file.parentId).toBeNull();
    });

    it('should accept a parentId', () => {
      // Arrange
      const folder = createFolder('Docs');

      // Act
      const file = createFile('doc.txt', 'content', folder.id);

      // Assert
      expect(file.parentId).toBe(folder.id);
    });

    it('should generate a unique id', () => {
      // Arrange & Act
      const file1 = createFile('a.txt', '');
      const file2 = createFile('b.txt', '');

      // Assert
      expect(file1.id).not.toBe(file2.id);
    });

    it('should set createdAt and updatedAt as Date instances', () => {
      // Arrange & Act
      const file = createFile('dated.txt', '');

      // Assert
      expect(file.createdAt).toBeInstanceOf(Date);
      expect(file.updatedAt).toBeInstanceOf(Date);
    });

    it('should allow empty content', () => {
      // Arrange & Act
      const file = createFile('empty.txt', '');

      // Assert
      expect(file.content).toBe('');
    });
  });

  describe('type discrimination', () => {
    it('folder should have children property', () => {
      // Arrange & Act
      const folder = createFolder('Test');

      // Assert
      expect('children' in folder).toBe(true);
    });

    it('file should have content and mimeType properties', () => {
      // Arrange & Act
      const file = createFile('test.txt', 'data');

      // Assert
      expect('content' in file).toBe(true);
      expect('mimeType' in file).toBe(true);
    });
  });
});
