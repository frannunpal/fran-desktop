import type { FC } from 'react';
import { ColorInput, UnstyledButton } from '@mantine/core';
import { PRESET_COLORS } from '@/Shared/Constants/Colors';
import classes from './ColorPicker.module.css';

export interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  error?: string;
}

const ColorPicker: FC<ColorPickerProps> = ({ value, onChange, error }) => {
  return (
    <div className={classes.root}>
      <div className={classes.colorRow}>
        {PRESET_COLORS.map(color => (
          <UnstyledButton
            key={color}
            className={classes.colorSwatch}
            data-selected={value === color || undefined}
            style={{ background: color }}
            onClick={() => onChange(color)}
            aria-label={`Color ${color}`}
            aria-pressed={value === color}
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
      />
    </div>
  );
};

export default ColorPicker;
