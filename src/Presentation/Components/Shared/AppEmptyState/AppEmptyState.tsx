import { type FC, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import classes from './AppEmptyState.module.css';
import { getFourRandomColors } from '@/Shared/Utils/getFourRandomColors';

const COLORS = getFourRandomColors();

const spring = {
  type: 'spring' as const,
  damping: 20,
  stiffness: 300,
};

function shuffle<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5);
}

interface AppEmptyStateProps {
  label?: string;
}

const AppEmptyState: FC<AppEmptyStateProps> = ({ label = 'Work In Progress' }) => {
  const [order, setOrder] = useState(COLORS);

  useEffect(() => {
    const timeout = setTimeout(() => setOrder(prev => shuffle(prev)), 1000);
    return () => clearTimeout(timeout);
  }, [order]);

  return (
    <div className={classes.root}>
      <ul className={classes.container}>
        {order.map(color => (
          <motion.li
            key={color}
            layout
            transition={spring}
            className={classes.item}
            style={{ backgroundColor: color }}
          />
        ))}
      </ul>
      <p className={classes.label}>{label}</p>
    </div>
  );
};

export default AppEmptyState;
