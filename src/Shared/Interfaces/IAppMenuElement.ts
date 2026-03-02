import type { ReactNode } from 'react';

export interface MenuItemAction {
  type: 'item';
  label: string;
  icon?: string;
  onClick: () => void;
  disabled?: boolean;
}

export interface MenuItemDivider {
  type: 'divider';
}

export type MenuItem = MenuItemAction | MenuItemDivider;

export interface AppMenuDropdown {
  type: 'menu';
  label: string;
  icon?: string;
  items: MenuItem[];
  rightSection?: ReactNode;
}

export interface AppMenuCombobox {
  type: 'combobox';
  label?: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

export interface AppMenuSwitch {
  type: 'switch';
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}

export interface AppMenuSlider {
  type: 'slider';
  label?: string;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
}

export interface AppMenuTextInput {
  type: 'text-input';
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}

export type AppMenuElement =
  | AppMenuDropdown
  | AppMenuCombobox
  | AppMenuSwitch
  | AppMenuSlider
  | AppMenuTextInput;
