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

  describe('mergeSeed', () => {
    it('should create a folder that does not exist yet', () => {
      // Arrange
      const manifest: FsManifest = { folders: ['Desktop'], files: [] };

      // Act
      fs.mergeSeed(manifest);

      // Assert
      const roots = fs.getRootNodes();
      expect(roots.some(n => n.name === 'Desktop')).toBe(true);
    });

    it('should not create a duplicate folder when one with the same name already exists', () => {
      // Arrange
      fs.createFolder('Desktop', null);
      const manifest: FsManifest = { folders: ['Desktop'], files: [] };

      // Act
      fs.mergeSeed(manifest);

      // Assert
      const desktopFolders = fs.getRootNodes().filter(n => n.name === 'Desktop');
      expect(desktopFolders).toHaveLength(1);
    });

    it('should create a file that does not exist yet in its parent folder', () => {
      // Arrange
      const manifest: FsManifest = {
        folders: ['Desktop'],
        files: [
          { name: 'CV.pdf', folder: 'Desktop', mimeType: 'application/pdf', url: 'Desktop/CV.pdf' },
        ],
      };

      // Act
      fs.mergeSeed(manifest);

      // Assert
      const desktop = fs.getRootNodes().find(n => n.name === 'Desktop')!;
      const children = fs.getChildren(desktop.id);
      expect(children.some(n => n.name === 'CV.pdf')).toBe(true);
    });

    it('should not create a duplicate file when one with the same name already exists in the folder', () => {
      // Arrange
      const folder = fs.createFolder('Desktop', null);
      fs.createFile('CV.pdf', '', folder.id);
      const manifest: FsManifest = {
        folders: ['Desktop'],
        files: [
          { name: 'CV.pdf', folder: 'Desktop', mimeType: 'application/pdf', url: 'Desktop/CV.pdf' },
        ],
      };

      // Act
      fs.mergeSeed(manifest);

      // Assert
      const children = fs.getChildren(folder.id);
      expect(children.filter(n => n.name === 'CV.pdf')).toHaveLength(1);
    });

    it('should not delete user-created files outside the manifest', () => {
      // Arrange
      const folder = fs.createFolder('Desktop', null);
      const userFile = fs.createFile('my-notes.txt', 'private', folder.id);
      const manifest: FsManifest = {
        folders: ['Desktop'],
        files: [
          { name: 'CV.pdf', folder: 'Desktop', mimeType: 'application/pdf', url: 'Desktop/CV.pdf' },
        ],
      };

      // Act
      fs.mergeSeed(manifest);

      // Assert
      expect(fs.getNode(userFile.id)).toBeDefined();
    });

    it('should not delete user-created folders outside the manifest', () => {
      // Arrange
      const userFolder = fs.createFolder('MyStuff', null);
      const manifest: FsManifest = { folders: ['Desktop'], files: [] };

      // Act
      fs.mergeSeed(manifest);

      // Assert
      expect(fs.getNode(userFolder.id)).toBeDefined();
    });

    it('should persist to localStorage after merge', () => {
      // Arrange
      vi.clearAllMocks();
      const manifest: FsManifest = { folders: ['Desktop'], files: [] };

      // Act
      fs.mergeSeed(manifest);

      // Assert
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('should work correctly on a completely empty filesystem', () => {
      // Arrange
      const manifest: FsManifest = {
        folders: ['Desktop', 'Documents'],
        files: [
          {
            name: 'readme.txt',
            folder: 'Documents',
            mimeType: 'text/plain',
            url: 'Documents/readme.txt',
          },
        ],
      };

      // Act
      fs.mergeSeed(manifest);

      // Assert
      const roots = fs.getRootNodes();
      expect(roots.map(n => n.name)).toEqual(expect.arrayContaining(['Desktop', 'Documents']));
      const docs = roots.find(n => n.name === 'Documents')!;
      expect(fs.getChildren(docs.id).some(n => n.name === 'readme.txt')).toBe(true);
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

  describe('move', () => {
    it('should move a file to a different folder', () => {
      // Arrange
      const targetFolder = fs.createFolder('Target', null);
      const file = fs.createFile('movable.txt', 'content', null);

      // Act
      const moved = fs.move(file.id, targetFolder.id);

      // Assert
      expect(moved.parentId).toBe(targetFolder.id);
      expect(fs.getChildren(targetFolder.id).some(c => c.id === file.id)).toBe(true);
    });

    it('should move a file to root (null parentId)', () => {
      // Arrange
      const folder = fs.createFolder('Source', null);
      const file = fs.createFile('to-root.txt', 'content', folder.id);

      // Act
      const moved = fs.move(file.id, null);

      // Assert
      expect(moved.parentId).toBeNull();
    });

    it('should remove file from old parent children', () => {
      // Arrange
      const oldFolder = fs.createFolder('OldParent', null);
      const newFolder = fs.createFolder('NewParent', null);
      const file = fs.createFile('move-child.txt', 'content', oldFolder.id);

      // Act
      fs.move(file.id, newFolder.id);

      // Assert
      const oldChildren = fs.getChildren(oldFolder.id);
      const newChildren = fs.getChildren(newFolder.id);
      expect(oldChildren.some(c => c.id === file.id)).toBe(false);
      expect(newChildren.some(c => c.id === file.id)).toBe(true);
    });

    it('should throw for unknown node id', () => {
      // Act & Assert
      expect(() => fs.move('non-existent', null)).toThrow('Node not found: non-existent');
    });

    it('should persist the move to localStorage', () => {
      // Arrange
      const folder = fs.createFolder('Target', null);
      const file = fs.createFile('persist-move.txt', 'content', null);

      // Act
      fs.move(file.id, folder.id);

      // Assert
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });
});
