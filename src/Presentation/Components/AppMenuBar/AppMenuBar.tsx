import { type FC, useState } from 'react';
import { Menu, Select, Switch, Slider, TextInput } from '@mantine/core';
import type { AppMenuElement, MenuItem } from '@/Shared/Interfaces/IAppMenuElement';
import { useFcIconElement } from '@presentation/Hooks/useFcIcon';
import classes from './AppMenuBar.module.css';

const ICON_PROPS = { size: 14, style: { display: 'block' } };

interface FcIconProps {
  name: string;
}
const FcIcon: FC<FcIconProps> = ({ name }) => useFcIconElement(name, ICON_PROPS);

interface MenuDropdownElementProps {
  label: string;
  icon?: string;
  items: MenuItem[];
}
const MenuDropdownElement: FC<MenuDropdownElementProps> = ({ label, icon, items }) => {
  const [opened, setOpened] = useState(false);
  const TriggerIcon: FC = () => useFcIconElement(icon ?? '', ICON_PROPS);
  return (
    <Menu
      opened={opened}
      onClose={() => setOpened(false)}
      withinPortal
      keepMounted
      closeOnItemClick
      closeOnEscape
      closeOnClickOutside
      position="bottom-start"
    >
      <Menu.Target>
        <button className={classes.menuTrigger} onClick={() => setOpened(o => !o)}>
          {icon && <TriggerIcon />}
          <span>{label}</span>
        </button>
      </Menu.Target>
      <Menu.Dropdown>
        {items.map((item, idx) => {
          if (item.type === 'divider') {
            return <Menu.Divider key={idx} />;
          }
          return (
            <Menu.Item
              key={idx}
              disabled={item.disabled}
              onClick={item.onClick}
              leftSection={item.icon ? <FcIcon name={item.icon} /> : undefined}
            >
              {item.label}
            </Menu.Item>
          );
        })}
      </Menu.Dropdown>
    </Menu>
  );
};

interface AppMenuBarProps {
  elements: AppMenuElement[];
}

const AppMenuBar: FC<AppMenuBarProps> = ({ elements }) => (
  <div className={classes.root} role="menubar" aria-label="Application menu">
    {elements.map((el, idx) => {
      switch (el.type) {
        case 'menu':
          return <MenuDropdownElement key={idx} label={el.label} icon={el.icon} items={el.items} />;
        case 'combobox':
          return (
            <div key={idx} className={classes.element}>
              <Select
                data={el.options}
                value={el.value}
                onChange={v => v && el.onChange(v)}
                placeholder={el.label}
                size="xs"
                className={classes.select}
                comboboxProps={{ withinPortal: true }}
              />
            </div>
          );
        case 'switch':
          return (
            <div key={idx} className={classes.element}>
              <Switch
                label={el.label}
                checked={el.checked}
                onChange={e => el.onChange(e.currentTarget.checked)}
                size="xs"
              />
            </div>
          );
        case 'slider':
          return (
            <div key={idx} className={classes.element}>
              {el.label && <span className={classes.sliderLabel}>{el.label}</span>}
              <Slider
                min={el.min}
                max={el.max}
                value={el.value}
                onChange={el.onChange}
                size="xs"
                className={classes.slider}
              />
            </div>
          );
        case 'text-input':
          return (
            <div key={idx} className={classes.element}>
              <TextInput
                placeholder={el.placeholder}
                value={el.value}
                onChange={e => el.onChange(e.currentTarget.value)}
                size="xs"
                className={classes.textInput}
              />
            </div>
          );
      }
    })}
  </div>
);

export default AppMenuBar;
