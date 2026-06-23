/**
 * SkeletonLoader - Placeholder loading states for various components
 */
import { motion } from 'motion/react';

interface SkeletonLoaderProps {
  type: 'quest-card' | 'stat-card' | 'filter-bar' | 'leaderboard-header' | 'detail-header';
  width?: string | number;
  height?: string | number;
  className?: string;
}

export function SkeletonLoader({ type, width, height, className = '' }: SkeletonLoaderProps) {
  // Default sizes for different types
  const sizes: Record<
    | 'quest-card'
    | 'stat-card'
    | 'filter-bar'
    | 'leaderboard-header'
    | 'detail-header',
    { width: string | number; height: string | number }
  > = {
    'quest-card': { width: '100%', height: 200 },
    'stat-card': { width: '100%', height: 100 },
    'filter-bar': { width: '100%', height: 60 },
    'leaderboard-header': { width: '100%', height: 60 },
    'detail-header': { width: '100%', height: 120 }
  };

  const { width: defaultWidth, height: defaultHeight } = sizes[type] || { width: '100%', height: 40 };
  const finalWidth = width !== undefined ? width : defaultWidth;
  const finalHeight = height !== undefined ? height : defaultHeight;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, repeat: Infinity }}
      className={`animate-pulse rounded-lg bg-[#efe9da]/50 ${className}`}
      style={{ width: typeof finalWidth === 'number' ? `${finalWidth}px` : finalWidth, height: typeof finalHeight === 'number' ? `${finalHeight}px` : finalHeight }}
    >
      {/* Gradient shimmer effect */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
          width: '200%',
          height: '100%',
          transform: 'translateX(-100%)',
          animation: 'shimmer 2s infinite'
        }}
      >
        <style jsx>{`
          @keyframes shimmer {
            to { transform: translateX(0); }
          }
        `}</style>
      </div>
    </motion.div>
  );
}