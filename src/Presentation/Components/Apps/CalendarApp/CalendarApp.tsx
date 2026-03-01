import '@mantine/dates/styles.css';
import type { FC } from 'react';
import { Calendar } from '@mantine/dates';
import type { WindowContentProps } from '@/Shared/Interfaces/IWindowContentProps';
import classes from './CalendarApp.module.css';

const CalendarApp: FC<WindowContentProps> = () => {
  return (
    <div className={classes.root}>
      <Calendar />
    </div>
  );
};

export default CalendarApp;
