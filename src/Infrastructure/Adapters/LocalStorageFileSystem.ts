import { createFile, createFolder } from '@domain/Entities/FileSystem';
import type { FSNode, FileNode, FolderNode } from '@domain/Entities/FileSystem';
import type { IFileSystem } from '@application/Ports/IFileSystem';

const STORAGE_KEY = 'fran-desktop:filesystem';

export class LocalStorageFileSystem implements IFileSystem {
  private nodes: Map<string, FSNode>;

  constructor() {
    this.nodes = this.load();
  }

  private load(): Map<string, FSNode> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return new Map();
      const entries = JSON.parse(raw) as [string, FSNode][];
      return new Map(entries);
    } catch {
      return new Map();
    }
  }

  private persist(): void {
    const entries = Array.from(this.nodes.entries());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }

  getNode(id: string): FSNode | undefined {
    return this.nodes.get(id);
  }

  getChildren(folderId: string): FSNode[] {
    const folder = this.nodes.get(folderId);
    if (!folder || folder.type !== 'folder') return [];
    return folder.children.map(childId => this.nodes.get(childId)).filter(n => n !== undefined);
  }

  getRootNodes(): FSNode[] {
    return Array.from(this.nodes.values()).filter(n => n.parentId === null);
  }

  createFile(name: string, content: string, parentId: string | null): FileNode {
    const file = createFile(name, content, parentId);
    this.nodes.set(file.id, file);
    if (parentId) this.addChildToFolder(parentId, file.id);
    this.persist();
    return file;
  }

  createFolder(name: string, parentId: string | null): FolderNode {
    const folder = createFolder(name, parentId);
    this.nodes.set(folder.id, folder);
    if (parentId) this.addChildToFolder(parentId, folder.id);
    this.persist();
    return folder;
  }

  updateFile(id: string, content: string): FileNode {
    const node = this.nodes.get(id);
    if (!node || node.type !== 'file') throw new Error(`File not found: ${id}`);
    const updated: FileNode = { ...node, content, updatedAt: new Date() };
    this.nodes.set(id, updated);
    this.persist();
    return updated;
  }

  delete(id: string): void {
    const node = this.nodes.get(id);
    if (!node) return;
    if (node.type === 'folder') this.deleteRecursive(node);
    this.removeChildFromParent(node);
    this.nodes.delete(id);
    this.persist();
  }

  private addChildToFolder(folderId: string, childId: string): void {
    const folder = this.nodes.get(folderId);
    if (!folder || folder.type !== 'folder') return;
    this.nodes.set(folderId, { ...folder, children: [...folder.children, childId] });
  }

  private removeChildFromParent(node: FSNode): void {
    if (!node.parentId) return;
    const parent = this.nodes.get(node.parentId);
    if (!parent || parent.type !== 'folder') return;
    this.nodes.set(node.parentId, {
      ...parent,
      children: parent.children.filter(id => id !== node.id),
    });
  }

  private deleteRecursive(folder: FolderNode): void {
    for (const childId of folder.children) {
      const child = this.nodes.get(childId);
      if (!child) continue;
      if (child.type === 'folder') this.deleteRecursive(child);
      this.nodes.delete(childId);
    }
  }
}
