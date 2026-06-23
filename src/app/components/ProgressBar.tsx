/**
 * ProgressBar - Shows progress towards a goal with label
 * Example: "3 / 5 km" or "12 / 15 quests completed"
 */
import { useState } from 'react';
import { motion } from 'motion/react';

interface ProgressBarProps {
  current: number;
  target: number;
  label: string; // e.g., "km", "quests", "minutes"
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ProgressBar({
  current,
  target,
  label,
  showPercentage = false,
  size = 'md'
}: ProgressBarProps) {
  const [hoverValues, setHoverValues] = useState<{ current: number; target: number } | null>(null);
  const displayCurrent = hoverValues?.current ?? current;
  const displayTarget = hoverValues?.target ?? target;

  // Prevent division by zero
  const progressPercentage = displayTarget > 0 ? Math.min(100, (displayCurrent / displayTarget) * 100) : 0;

  // Size configuration
  const sizeConfig: Record<'sm' | 'md' | 'lg', { height: number; fontSize: string }> = {
    sm: { height: 4, fontSize: 'text-xs' },
    md: { height: 6, fontSize: 'text-sm' },
    lg: { height: 8, fontSize: 'text-base' }
  };

  const { height, fontSize } = sizeConfig[size];

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4"
    >
      <div className="flex items-center justify-between mb-2">
        <span className={`font-['Space_Grotesk'] ${fontSize} font-medium`}>
          {displayCurrent} / {displayTarget} {label}
        </span>
        {showPercentage && (
          <span className={`font-['Bebas_Neue'] ${fontSize} font-medium`}>
            {Math.round(progressPercentage)}%
          </span>
        )}
      </div>

      <div className="relative h-[{height}px] w-full bg-[#efe9da]/50 rounded-full overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(90deg, #2b2b2b ${progressPercentage}%, transparent ${progressPercentage}%)`,
            width: '100%',
            height: '100%',
            transition: 'background-position 0.3s ease'
          }}
        ></div>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className={`${fontSize} font-['Bebas_Neue'] text-[#f3eee1] drop-shadow-[0_0_2px_rgba(0,0,0,0.5)]`}>
            {displayCurrent} {label}
          </span>
        </div>
      </div>
    </motion.div>
  );
}