/**
 * FilterBar - Tab row + sport dropdown + sort selector for filtering quests
 */
import { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { SkeletonLoader } from './SkeletonLoader';

interface FilterBarProps {
  activeTab: 'all' | 'active' | 'completed' | 'expired';
  onTabChange: (tab: 'all' | 'active' | 'completed' | 'expired') => void;
  selectedSport: string;
  onSportChange: (sport: string) => void;
  sortBy: 'newest' | 'xp' | 'deadline';
  onSortChange: (sort: 'newest' | 'xp' | 'deadline') => void;
  availableSports: string[];
  isLoading?: boolean;
}

export function FilterBar({
  activeTab,
  onTabChange,
  selectedSport,
  onSportChange,
  sortBy,
  onSortChange,
  availableSports = [],
  isLoading = false
}: FilterBarProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-3">
        <SkeletonLoader type="filter-bar" />
        <SkeletonLoader type="filter-bar" />
        <SkeletonLoader type="filter-bar" />
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {/* Tab navigation */}
      <div>
        <div className="flex space-x-2">
          {[['all', 'All'], ['active', 'Active'], ['completed', 'Completed'], ['expired', 'Expired']].map(
            ([value, label]) => (
              <motion.button
                key={value}
                onClick={() => onTabChange(value as any)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={activeTab === value
                  ? 'flex-1 px-4 py-2 rounded-full border-2 border-transparent bg-[#2b2b2b] text-[#f3eee1] font-medium transition-all duration-200'
                  : 'flex-1 px-4 py-2 rounded-full border-2 border-transparent bg-[#efe9da]/50 text-[#2b2b2b]/60 hover:bg-[#efe9da]/70 transition-all duration-200'}
              >
                {label}
              </motion.button>
            )
          )}
        </div>
      </div>

      {/* Sport dropdown */}
      <div className="relative">
        <label className="block mb-1 font-['Space_Grotesk'] text-xs font-medium uppercase tracking-wider">
          Sport
        </label>
        <div className="relative">
          <select
            value={selectedSport}
            onChange={(e) => onSportChange(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border-2 border-[#2b2b2b]/30 bg-[#efe9da]/70 focus:border-[#2b2b2b]/50 focus:bg-[#efe9da]/80 transition-all duration-200 appearance-none pr-10"
          >
            <option value="all">All Sports</option>
            {availableSports.map((sport) => (
              <option key={sport} value={sport}>
                {sport}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <ChevronDown className="h-4 w-4 text-[#2b2b2b]/50" />
          </div>
        </div>
      </div>

      {/* Sort selector */}
      <div className="relative">
        <label className="block mb-1 font-['Space_Grotesk'] text-xs font-medium uppercase tracking-wider">
          Sort By
        </label>
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as any)}
            className="w-full px-4 py-2 rounded-lg border-2 border-[#2b2b2b]/30 bg-[#efe9da]/70 focus:border-[#2b2b2b]/50 focus:bg-[#efe9da]/80 transition-all duration-200 appearance-none pr-10"
          >
            <option value="newest">Newest First</option>
            <option value="xp">Highest XP</option>
            <option value="deadline">Soonest Deadline</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <SortIcon className="h-4 w-4 text-[#2b2b2b]/50" />
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple sort icon
function SortIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}
