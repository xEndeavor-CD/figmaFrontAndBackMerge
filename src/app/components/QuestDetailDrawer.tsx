/**
 * QuestDetailDrawer - Slide-in panel with full quest details + Start/Claim button
 */
import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Zap, Trophy, RefreshCw, Calendar, PlayCircle, CheckCircle, XCircle, Users, MessageCircle } from 'lucide-react';

interface Quest {
  id: string;
  title: string;
  description?: string;
  category: string;
  pointsReward: number;
  status: 'ACTIVE' | 'COMPLETED' | 'EXPIRED';
  expiresAt?: string;
  createdAt?: string;
  currentAmount?: number;
  targetAmount?: number;
  unit?: string;
}

interface QuestDetailDrawerProps {
  quest: Quest;
  isOpen: boolean;
  onClose: () => void;
  isLoggedIn: boolean;
  user: any; // AuthUser
  onClaim: () => void;
  onStart: () => void;
}

export function QuestDetailDrawer({ quest, isOpen, onClose, isLoggedIn, user, onClaim, onStart }: QuestDetailDrawerProps) {
  if (!isOpen) return null;

  const [isClaiming, setIsClaiming] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  // Format date helper
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'TBD';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'TBD';
    }
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: '0%' }}
      exit={{ x: '100%' }}
      transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
      className="fixed inset-0 z-50 flex items-end"
    >
      <div
        className="relative w-full max-w-md max-h-[90vh] bg-[#f7f0df] border-t-2 border-[#2b2b2b] overflow-y-auto"
      >
        {/* Drawer backdrop - close on click */}
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur"
        />

        {/* Drawer content */}
        <div className="flex flex-col h-full w-full">
          {/* Drawer header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#2b2b2b]/20">
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#2b2b2b] bg-[#efe9da]/70"
              >
                <Zap className="h-5 w-5" />
              </motion.div>
              <div>
                <h2 className="font-['Bebas_Neue'] text-2xl tracking-wider">{quest.title}</h2>
                <p className="font-['Caveat'] text-lg -rotate-1 opacity-70 mt-1">{quest.category} Quest</p>
              </div>
            </div>
            <motion.button
              onClick={onClose}
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.3 }}
              className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#2b2b2b]/30 bg-[#efe9da]/50 hover:bg-[#efe9da]/70"
              aria-label="Close"
            >
              <ArrowLeft className="h-4 w-4" />
            </motion.button>
          </div>

          {/* Quest details */}
          <div className="flex-1 p-6 space-y-6 overflow-auto">
            {/* Description */}
            {quest.description && (
              <div>
                <h3 className="font-['Space_Grotesk'] text-lg font-semibold mb-2">About this Quest</h3>
                <p className="font-['Space_Grotesk'] text-base leading-relaxed opacity-80">
                  {quest.description}
                </p>
              </div>
            )}

            {/* Progress section (if applicable) */}
            {quest.targetAmount && quest.targetAmount > 0 && (
              <div className="space-y-4">
                <h3 className="font-['Space_Grotesk'] text-lg font-semibold mb-2">Progress</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-['Space_Grotesk'] text-sm">Progress</span>
                    <span className="font-['Bebas_Neue'] text-lg font-bold">
                      {quest.currentAmount || 0} / {quest.targetAmount} {quest.unit || ''}
                    </span>
                  </div>
                  <div className="w-full bg-[#efe9da]/50 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full bg-[#2b2b2b] transition-all duration-500`}
                      style={{
                        width: `${Math.min(100, ((quest.currentAmount || 0) / (quest.targetAmount || 1)) * 100)}%`
                      }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-xs font-['Space_Grotesk']">
                    <span>Completion: </span>
                    <span className="font-['Bebas_Neue']">
                      {Math.min(100, ((quest.currentAmount || 0) / (quest.targetAmount || 1)) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Rewards and details */}
            <div className="grid gap-4">
              <div className="flex items-center gap-3 p-4 rounded-lg border-2 border-[#2b2b2b]/30 bg-[#efe9da]/50">
                <Trophy className="h-5 w-5" />
                <div>
                  <p className="font-['Space_Grotesk'] text-xs uppercase tracking-wider opacity-60">XP REWARD</p>
                  <p className="font-['Bebas_Neue'] text-2xl font-bold">+{quest.pointsReward} XP</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-lg border-2 border-[#2b2b2b]/30 bg-[#efe9da]/50">
                <Calendar className="h-5 w-5" />
                <div>
                  <p className="font-['Space_Grotesk'] text-xs uppercase tracking-wider opacity-60">AVAILABLE UNTIL</p>
                  <p className="font-['Bebas_Neue'] text-lg font-bold">{formatDate(quest.expiresAt)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-lg border-2 border-[#2b2b2b]/30 bg-[#efe9da]/50">
                <Users className="h-5 w-5" />
                <div>
                  <p className="font-['Space_Grotesk'] text-xs uppercase tracking-wider opacity-60">PARTICIPANTS</p>
                  <p className="font-['Bebas_Neue'] text-lg font-bold">{Math.floor(Math.random() * 124) + 56}</p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-6 pt-4 border-t border-[#2b2b2b]/20">
              {!isLoggedIn ? (
                <div className="text-center">
                  <p className="font-['Space_Grotesk'] text-sm opacity-60">
                    — sign in to start or claim this quest —
                  </p>
                  <button
                    onClick={() => {/* Handle login - would be passed from parent */}}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-full border-2 border-[#2b2b2b] bg-[#2b2b2b] font-['Space_Grotesk'] text-sm font-bold text-[#f3eee1] shadow-[3px_3px_0_rgba(43,43,43,0.3)] hover:bg-[#2b2b2b]/80 transition-all duration-200"
                  >
                    Sign In
                  </button>
                </div>
              ) : (
                <>
                  {/* Start/Continue button */}
                  <button
                    onClick={async () => {
                      setIsStarting(true);
                      try {
                        await onStart();
                      } finally {
                        setIsStarting(false);
                      }
                    }}
                    disabled={isStarting}
                    className="w-full mb-3 flex items-center justify-between gap-3 px-5 py-3 rounded-full border-2 border-[#2b2b2b] bg-[#efe9da] font-['Space_Grotesk'] text-sm font-bold transition-all duration-200 hover:bg-[#efe9da]/70 disabled:opacity-50"
                  >
                    <span>{isStarting ? 'Starting...' : 'Start Quest'}</span>
                    <span>→</span>
                  </button>

                  {/* Claim button (only for completed quests) */}
                  {quest.status === 'COMPLETED' && (
                    <button
                      onClick={async () => {
                        setIsClaiming(true);
                        try {
                          await onClaim();
                        } finally {
                          setIsClaiming(false);
                        }
                      }}
                      disabled={isClaiming}
                      className="w-full flex items-center justify-between gap-3 px-5 py-3 rounded-full border-2 border-[#2b2b2b] bg-[#2b2b2b] font-['Space_Grotesk'] text-sm font-bold text-[#f3eee1] shadow-[3px_3px_0_rgba(43,43,43,0.3)] hover:bg-[#2b2b2b]/80 transition-all duration-200 disabled:opacity-50"
                    >
                      <span>{isClaiming ? 'Claiming...' : 'Claim Reward'}</span>
                      <span>→</span>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}