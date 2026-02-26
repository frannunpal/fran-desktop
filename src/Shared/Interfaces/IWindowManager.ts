import type { WindowInput } from '@domain/Entities/Window';
import type { WindowEntity } from "@/Shared/Interfaces/WindowEntity";

export interface IWindowManager {
  getAll(): WindowEntity[];
  getById(id: string): WindowEntity | undefined;
  open(input: WindowInput): WindowEntity;
  close(id: string): void;
  minimize(id: string): void;
  maximize(id: string): void;
  restore(id: string): void;
  focus(id: string): void;
  move(id: string, x: number, y: number): void;
  resize(id: string, width: number, height: number): void;
}
