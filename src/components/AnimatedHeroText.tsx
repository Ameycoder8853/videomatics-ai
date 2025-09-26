
'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AnimatedHeroTextProps {
  text: string;
  highlightedText: string;
  className?: string;
}

export function AnimatedHeroText({ text, highlightedText, className }: AnimatedHeroTextProps) {
  const words = text.split(' ');
  const highlightedWords = highlightedText.split(' ');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.04,
      },
    },
  };

  const childVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        damping: 12,
        stiffness: 100,
      },
    },
  };

  return (
    <motion.h1
      className={cn('flex flex-wrap justify-center', className)}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {words.map((word, index) => {
        const isHighlighted = highlightedWords.includes(word);
        const lineBreakIndex = text.split(' ').indexOf('with');
        
        return (
          <span key={index} className="flex items-center">
            <motion.span
              variants={childVariants}
              className={cn(
                'inline-block',
                isHighlighted && 'bg-gradient-to-r from-primary via-fuchsia-500 to-accent bg-clip-text text-transparent'
              )}
            >
              {word}
            </motion.span>
            {/* Add a space unless it's the last word */}
            {index < words.length -1 && (
                 index === lineBreakIndex - 1 ? <br /> : <span className="inline-block w-4" />
            )}
          </span>
        );
      })}
    </motion.h1>
  );
}
