import type { FC } from 'react';
import { createElement } from 'react';
import { ColorInput, SimpleGrid, Tooltip, UnstyledButton } from '@mantine/core';
import * as VscIcons from 'react-icons/vsc';
import classes from './IconColorPicker.module.css';
import { PRESET_ICONS } from '@/Shared/Constants/Icons';
import { PRESET_COLORS } from '@/Shared/Constants/Colors';

export interface IconColorPickerProps {
  selectedIcon: string;
  selectedColor: string;
  onIconChange: (icon: string) => void;
  onColorChange: (color: string) => void;
  colorError?: string;
}

const IconColorPicker: FC<IconColorPickerProps> = ({
  selectedIcon,
  selectedColor,
  onIconChange,
  onColorChange,
  colorError,
}) => {
  return (
    <div className={classes.root}>
      <SimpleGrid cols={8} spacing={4} className={classes.iconGrid}>
        {PRESET_ICONS.map(name => {
          const Icon = VscIcons[name as keyof typeof VscIcons] as React.ElementType | undefined;
          if (!Icon) return null;
          const isSelected = selectedIcon === name;
          return (
            <Tooltip key={name} label={name} openDelay={500}>
              <UnstyledButton
                className={classes.iconButton}
                data-selected={isSelected || undefined}
                onClick={() => onIconChange(name)}
                aria-label={name}
                aria-pressed={isSelected}
              >
                {createElement(Icon, { size: 20, color: selectedColor })}
              </UnstyledButton>
            </Tooltip>
          );
        })}
      </SimpleGrid>

      <div className={classes.colorRow}>
        {PRESET_COLORS.map(color => (
          <UnstyledButton
            key={color}
            className={classes.colorSwatch}
            data-selected={selectedColor === color || undefined}
            style={{ background: color }}
            onClick={() => onColorChange(color)}
            aria-label={`Color ${color}`}
            aria-pressed={selectedColor === color}
          />
        ))}
      </div>

      <ColorInput
        value={selectedColor}
        onChange={onColorChange}
        placeholder="Custom color"
        size="xs"
        className={classes.colorInput}
        aria-label="Custom color picker"
        error={colorError}
      />
    </div>
  );
};

export default IconColorPicker;
