import type { FC } from 'react';
import { ColorInput, UnstyledButton } from '@mantine/core';
import { PRESET_COLORS } from '@/Shared/Constants/Colors';
import classes from './ColorPicker.module.css';

export interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  error?: string;
  disabled?: boolean;
}

const ColorPicker: FC<ColorPickerProps> = ({ value, onChange, error, disabled = false }) => {
  return (
    <div className={classes.root}>
      <div className={classes.colorRow}>
        {PRESET_COLORS.map(color => (
          <UnstyledButton
            key={color}
            className={classes.colorSwatch}
            data-selected={value === color || undefined}
            data-disabled={disabled || undefined}
            style={{ background: color }}
            onClick={() => !disabled && onChange(color)}
            aria-label={`Color ${color}`}
            aria-pressed={value === color}
            disabled={disabled}
          />
        ))}
      </div>
      <ColorInput
        value={value}
        onChange={onChange}
        placeholder="Custom color"
        size="xs"
        className={classes.colorInput}
        aria-label="Custom color picker"
        error={error}
        disabled={disabled}
      />
    </div>
  );
};

export default ColorPicker;
