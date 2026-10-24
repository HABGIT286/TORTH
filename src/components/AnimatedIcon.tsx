import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { playHapticSound, createClickRipple } from '../utils/effects';

export type IconSize = number | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AnimatedIconProps {
  icon: LucideIcon;
  className?: string;
  size?: IconSize;
  glowColor?: string;
  badge?: string | number;
  interactive?: boolean;
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
  title?: string;
}

const SIZE_MAP: Record<string, number> = {
  xs: 13,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32
};

export const AnimatedIcon: React.FC<AnimatedIconProps> = ({
  icon: Icon,
  className = 'text-purple-400',
  size,
  glowColor,
  badge,
  interactive = true,
  onClick,
  title
}) => {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive) return;
    createClickRipple(e);
    playHapticSound('tap');
    if (onClick) onClick(e);
  };

  const resolvedSize = typeof size === 'number' ? size : size ? SIZE_MAP[size] || 20 : undefined;

  return (
    <motion.div
      title={title}
      whileHover={interactive ? { scale: 1.14, rotate: 6 } : undefined}
      whileTap={interactive ? { scale: 0.82, rotate: -12 } : undefined}
      transition={{ type: 'spring', stiffness: 450, damping: 20 }}
      onClick={handleClick}
      className={`relative inline-flex items-center justify-center shrink-0 ${interactive ? 'cursor-pointer select-none tap-interactive' : ''}`}
      style={
        glowColor
          ? {
              filter: `drop-shadow(0 0 10px ${glowColor})`
            }
          : undefined
      }
    >
      <Icon className={className} size={resolvedSize} />

      {badge !== undefined && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 px-1 text-[9px] font-black text-slate-950 shadow-md ring-2 ring-slate-950 animate-pulse font-numbers"
        >
          {badge}
        </motion.span>
      )}
    </motion.div>
  );
};
