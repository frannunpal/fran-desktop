import '@mantine/dates/styles.css';
import type { FC } from 'react';
import { Calendar } from '@mantine/dates';
import classes from './CalendarApp.module.css';

const CalendarApp: FC = () => {
  return (
    <div className={classes.root}>
      <Calendar />
    </div>
  );
};

export default CalendarApp;
