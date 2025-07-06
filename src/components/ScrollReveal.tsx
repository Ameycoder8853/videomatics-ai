'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  yOffset?: number;
  once?: boolean;
}

export const ScrollReveal = ({
  children,
  className,
  delay = 0,
  duration = 0.5,
  yOffset = 40,
  once = false,
}: ScrollRevealProps) => {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: yOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: once, amount: 0.1 }} // Trigger when 10% of the element is in view
      transition={{
        type: 'spring',
        stiffness: 100,
        damping: 20,
        delay,
        duration,
      }}
    >
      {children}
    </motion.div>
  );
};
