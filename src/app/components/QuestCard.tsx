/**
 * QuestCard - Individual quest card component
 * Displays quest information with sport icon, XP badge, deadline, progress, and status
 */
import { useState } from 'react';
import { motion } from 'motion/react';
import { Zap, Trophy, RefreshCw, Calendar, PlayCircle, CheckCircle, XCircle } from 'lucide-react';

interface QuestCardProps {
  quest: any;
  progress: number;
  isLoggedIn: boolean;
  onSelect: () => void;
}

export function QuestCard({ quest, progress, isLoggedIn, onSelect }: QuestCardProps) {
  const [hoverProgress, setHoverProgress] = useState<number | null>(null);
  const displayProgress = hoverProgress !== null ? hoverProgress : progress || 0;

  // Determine quest status styling
  const getStatusVariants = () => {
    switch (quest.status) {
      case 'ACTIVE':
        return {
          bg: 'bg-[#d9b45f]/20',
          text: 'text-[#8a6a00]',
          border: 'border-[#d9b45f]/40',
          icon: PlayCircle,
          label: 'ACTIVE'
        };
      case 'COMPLETED':
        return {
          bg: 'bg-green-50 text-green-800',
          text: 'text-green-800',
          border: 'border-[#4ade80]/40',
          icon: CheckCircle,
          label: 'COMPLETED'
        };
      case 'EXPIRED':
        return {
          bg: 'bg-red-50 text-red-800',
          text: 'text-red-800',
          border: 'border-[#f87171]/40',
          icon: XCircle,
          label: 'EXPIRED'
        };
      default:
        return {
          bg: 'bg-[#efe9da]/50',
          text: 'text-[#2b2b2b]/60',
          border: 'border-[#2b2b2b]/20',
          icon: Zap,
          label: quest.status
        };
    }
  };

  const { bg, text, border, icon: StatusIcon, label: statusLabel } = getStatusVariants();

  // Format date
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'TBD';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return 'TBD';
    }
  };

  // Get sport icon based on quest category or title
  const getSportIcon = (): any => {
    // Map quest categories or keywords to sport icons
    const titleLower = quest.title.toLowerCase();
    if (titleLower.includes('run') || titleLower.includes('marathon')) return Zap; // running
    if (titleLower.includes('swim') || titleLower.includes('pool')) return Zap; // swimming
    if (titleLower.includes('cycle') || titleLower.includes('bike')) return Zap; // cycling
    if (titleLower.includes('yoga') || titleLower.includes('stretch')) return Zap; // yoga
    if (titleLower.includes('weight') || titleLower.includes('lift')) return Zap; // weightlifting
    if (titleLower.includes('basketball')) return Zap; // basketball
    if (titleLower.includes('soccer') || titleLower.includes('football')) return Zap; // soccer
    if (titleLower.includes('tennis')) return Zap; // tennis
    return Zap; // default
  };

  return (
    <motion.div
      key={quest.id}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.random() * 0.3 }}
      className={`group relative rounded-3xl border-2 ${border} bg-[#f7f0df] p-6 cursor-pointer transition-all hover:-translate-y-2`}
      onMouseEnter={() => setHoverProgress(Math.min(100, (progress || 0) + 10))}
      onMouseLeave={() => setHoverProgress(null)}
      onClick={onSelect}
    >
      {/* Category badge with sport icon */}
      <div className="flex items-center gap-2 mb-4">
        <div className={`h-8 w-8 flex items-center justify-center rounded-full ${bg} ${text}`}>
          <GetSportIcon />
        </div>
        <span className={`font-['Space_Grotesk'] text-[10px] uppercase tracking-widest ${bg} ${text}`}>
          {quest.category}
        </span>
      </div>

      {/* Quest title */}
      <h3 className="font-['Bebas_Neue'] text-2xl mb-2 line-clamp-2">
        {quest.title}
      </h3>

      {/* Quest description */}
      {quest.description && (
        <p className="font-['Space_Grotesk'] text-xs mb-4 line-clamp-3 opacity-70">
          {quest.description}
        </p>
      )}

      {/* Progress section */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-['Space_Grotesk'] text-xs font-medium">Progress</span>
          <span className="font-['Bebas_Neue'] text-xs">
            {displayProgress}%
            {quest.targetAmount ? `(${quest.currentAmount || 0}/${quest.targetAmount} ${quest.unit || ''})` : ''}
          </span>
        </div>
        <div className="w-full bg-[#efe9da]/50 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-full bg-[#2b2b2b] transition-width duration-300`}
            style={{ width: `${displayProgress}%` }}
          ></div>
        </div>
      </div>

      {/* Rewards and deadline */}
      <div className="grid grid-cols-2 gap-4 text-xs font-['Space_Grotesk']">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4" />
          <span>+{quest.pointsReward} XP</span>
        </div>
        <div className="flex items-center gap-2 justify-end">
          <Calendar className="h-4 w-4" />
          <span>{formatDate(quest.expiresAt)}</span>
        </div>
      </div>

      {/* Status badge */}
      <div className="mt-4">
        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${bg} ${text} border border-[1px] ${border}`}>
          <StatusIcon className={`h-3 w-3`} />
          <span>{statusLabel}</span>
        </span>
      </div>
    </motion.div>
  );
}

// Helper function to get sport icon (simplified for now)
function GetSportIcon() {
  return <Zap className="h-4 w-4" />; // In a real app, this would vary by sport/category
}