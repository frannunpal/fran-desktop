import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LocalStorageFileSystem } from './LocalStorageFileSystem';
import type { FsManifest } from './LocalStorageFileSystem';
import { createLocalStorageMock } from '@/Shared/Testing/__mocks__/localStorage.mock';

const localStorageMock = createLocalStorageMock();

vi.stubGlobal('localStorage', localStorageMock);

describe('LocalStorageFileSystem', () => {
  let fs: LocalStorageFileSystem;

  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
    fs = new LocalStorageFileSystem();
  });

  describe('createFile', () => {
    it('should create a file and return it', () => {
      // Act
      const file = fs.createFile('readme.txt', 'Hello', null);

      // Assert
      expect(file.name).toBe('readme.txt');
      expect(file.content).toBe('Hello');
      expect(file.type).toBe('file');
    });

    it('should make the file retrievable by id', () => {
      // Arrange
      const file = fs.createFile('notes.txt', '', null);

      // Act
      const found = fs.getNode(file.id);

      // Assert
      expect(found).toBeDefined();
      expect(found?.id).toBe(file.id);
    });

    it('should register the file as child of its parent folder', () => {
      // Arrange
      const folder = fs.createFolder('Docs', null);

      // Act
      const file = fs.createFile('doc.txt', 'content', folder.id);

      // Assert
      const children = fs.getChildren(folder.id);
      expect(children.some(c => c.id === file.id)).toBe(true);
    });

    it('should persist to localStorage', () => {
      // Act
      fs.createFile('persisted.txt', '', null);

      // Assert
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });

  describe('createFolder', () => {
    it('should create a folder and return it', () => {
      // Act
      const folder = fs.createFolder('Documents', null);

      // Assert
      expect(folder.name).toBe('Documents');
      expect(folder.type).toBe('folder');
      expect(folder.children).toEqual([]);
    });

    it('should register the folder as child of its parent', () => {
      // Arrange
      const parent = fs.createFolder('Root', null);

      // Act
      const child = fs.createFolder('Sub', parent.id);

      // Assert
      const children = fs.getChildren(parent.id);
      expect(children.some(c => c.id === child.id)).toBe(true);
    });
  });

  describe('getChildren', () => {
    it('should return empty array for folder with no children', () => {
      // Arrange
      const folder = fs.createFolder('Empty', null);

      // Assert
      expect(fs.getChildren(folder.id)).toEqual([]);
    });

    it('should return empty array for unknown id', () => {
      // Assert
      expect(fs.getChildren('non-existent')).toEqual([]);
    });

    it('should return empty array for a file id', () => {
      // Arrange
      const file = fs.createFile('test.txt', '', null);

      // Assert
      expect(fs.getChildren(file.id)).toEqual([]);
    });
  });

  describe('getRootNodes', () => {
    it('should return only nodes with no parent', () => {
      // Arrange
      const root = fs.createFolder('Root', null);
      fs.createFolder('Child', root.id);

      // Act
      const roots = fs.getRootNodes();

      // Assert
      expect(roots).toHaveLength(1);
      expect(roots[0].id).toBe(root.id);
    });
  });

  describe('updateFile', () => {
    it('should update the file content', () => {
      // Arrange
      const file = fs.createFile('edit.txt', 'original', null);

      // Act
      const updated = fs.updateFile(file.id, 'updated content');

      // Assert
      expect(updated.content).toBe('updated content');
    });

    it('should update the updatedAt timestamp', () => {
      // Arrange
      const file = fs.createFile('dated.txt', '', null);
      const before = file.updatedAt;

      // Act
      const updated = fs.updateFile(file.id, 'new');

      // Assert
      expect(updated.updatedAt >= before).toBe(true);
    });

    it('should throw for unknown id', () => {
      // Act & Assert
      expect(() => fs.updateFile('non-existent', 'content')).toThrow(
        'File not found: non-existent',
      );
    });

    it('should throw when trying to update a folder', () => {
      // Arrange
      const folder = fs.createFolder('Docs', null);

      // Act & Assert
      expect(() => fs.updateFile(folder.id, 'content')).toThrow();
    });
  });

  describe('delete', () => {
    it('should remove a file', () => {
      // Arrange
      const file = fs.createFile('delete-me.txt', '', null);

      // Act
      fs.delete(file.id);

      // Assert
      expect(fs.getNode(file.id)).toBeUndefined();
    });

    it('should remove the file from its parent folder children', () => {
      // Arrange
      const folder = fs.createFolder('Docs', null);
      const file = fs.createFile('doc.txt', '', folder.id);

      // Act
      fs.delete(file.id);

      // Assert
      const children = fs.getChildren(folder.id);
      expect(children.some(c => c.id === file.id)).toBe(false);
    });

    it('should recursively delete folder contents', () => {
      // Arrange
      const folder = fs.createFolder('Parent', null);
      const child = fs.createFile('child.txt', '', folder.id);

      // Act
      fs.delete(folder.id);

      // Assert
      expect(fs.getNode(folder.id)).toBeUndefined();
      expect(fs.getNode(child.id)).toBeUndefined();
    });

    it('should do nothing for unknown id', () => {
      // Act & Assert (no throw)
      expect(() => fs.delete('non-existent')).not.toThrow();
    });
  });

  describe('persistence', () => {
    it('should restore state from localStorage on construction', () => {
      // Arrange — create data with first instance
      const file = fs.createFile('persisted.txt', 'data', null);

      // Act — create a new instance (simulates reload)
      const fs2 = new LocalStorageFileSystem();

      // Assert
      expect(fs2.getNode(file.id)).toBeDefined();
      expect((fs2.getNode(file.id) as { content: string }).content).toBe('data');
    });

    it('should start empty when localStorage has no data', () => {
      // Assert
      expect(fs.getRootNodes()).toEqual([]);
    });
  });

  describe('isEmpty', () => {
    it('should return true when no nodes exist', () => {
      // Assert
      expect(fs.isEmpty()).toBe(true);
    });

    it('should return false after creating a folder', () => {
      // Act
      fs.createFolder('Desktop', null);

      // Assert
      expect(fs.isEmpty()).toBe(false);
    });
  });

  describe('seed', () => {
    it('should create folders from manifest', () => {
      // Arrange
      const manifest: FsManifest = {
        folders: ['Desktop', 'Documents'],
        files: [],
      };

      // Act
      fs.seed(manifest);

      // Assert
      const roots = fs.getRootNodes();
      expect(roots).toHaveLength(2);
      expect(roots.map(n => n.name)).toEqual(expect.arrayContaining(['Desktop', 'Documents']));
    });

    it('should create files inside the correct folder', () => {
      // Arrange
      const manifest: FsManifest = {
        folders: ['Desktop'],
        files: [
          { name: 'CV.pdf', folder: 'Desktop', mimeType: 'application/pdf', url: 'Desktop/CV.pdf' },
        ],
      };

      // Act
      fs.seed(manifest);

      // Assert
      const desktopFolder = fs.getRootNodes().find(n => n.name === 'Desktop')!;
      const children = fs.getChildren(desktopFolder.id);
      expect(children).toHaveLength(1);
      expect(children[0].name).toBe('CV.pdf');
    });

    it('should set url and mimeType on seeded files', () => {
      // Arrange
      const manifest: FsManifest = {
        folders: ['Desktop'],
        files: [
          { name: 'CV.pdf', folder: 'Desktop', mimeType: 'application/pdf', url: 'Desktop/CV.pdf' },
        ],
      };

      // Act
      fs.seed(manifest);

      // Assert
      const desktopFolder = fs.getRootNodes().find(n => n.name === 'Desktop')!;
      const file = fs.getChildren(desktopFolder.id)[0];
      expect(file.type).toBe('file');
      if (file.type === 'file') {
        expect(file.url).toBe('Desktop/CV.pdf');
        expect(file.mimeType).toBe('application/pdf');
      }
    });
  });

  describe('createFolder with icon options', () => {
    it('should store iconName and iconColor when provided', () => {
      // Act
      const folder = fs.createFolder('MyFolder', null, 'VscHome', '#ff6b6b');

      // Assert
      expect(folder.iconName).toBe('VscHome');
      expect(folder.iconColor).toBe('#ff6b6b');
    });

    it('should create folder without icon options when not provided', () => {
      // Act
      const folder = fs.createFolder('PlainFolder', null);

      // Assert
      expect(folder.iconName).toBeUndefined();
      expect(folder.iconColor).toBeUndefined();
    });
  });
});
