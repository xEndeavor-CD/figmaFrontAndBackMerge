/**
 * Custom hook for fetching quests with filtering and sorting
 */
import { useEffect, useState } from 'react';
import { getQuests } from '../../../api/quests';
import type { Quest, QuestCategory } from '../../../api/quests';
import type { SpringPage } from '../../../api/tournaments';

interface UseQuestsOptions {
  tab?: 'all' | 'active' | 'completed' | 'expired';
  sport?: string;
  sortBy?: 'newest' | 'xp' | 'deadline';
}

interface UseQuestsResult {
  quests: Quest[];
  isLoading: boolean;
  error: string | null;
}

export function useQuests(options: UseQuestsOptions = {}): UseQuestsResult {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const { tab = 'all', sport = 'all', sortBy = 'newest' } = options;
  const [isMounted, setIsMounted] = useState<boolean>(true);

  useEffect(() => {
    setIsMounted(true);

    const fetchQuests = async () => {
      if (!isMounted) return;

      try {
        setIsLoading(true);
        setError(null);

        // Build query parameters
        const query: any = {};
        if (sport && sport !== 'all') query.sport = sport;
        // Note: The API doesn't support tab/status filtering directly, so we'll do it client-side
        // In a real app, we'd enhance the API to support these filters

        const response = await getQuests({ size: 50 }); // Get a reasonable number
        let filteredQuests = response.content || [];

        // Filter by tab (status) client-side
        if (tab === 'active') {
          filteredQuests = filteredQuests.filter(q => q.status === 'ACTIVE');
        } else if (tab === 'completed') {
          filteredQuests = filteredQuests.filter(q => q.status === 'COMPLETED');
        } else if (tab === 'expired') {
          filteredQuests = filteredQuests.filter(q => q.status === 'EXPIRED');
        }

        // Sort
        if (sortBy === 'xp') {
          filteredQuests.sort((a, b) => {
            const aPoints = a.pointsReward || 0;
            const bPoints = b.pointsReward || 0;
            return bPoints - aPoints;
          });
        } else if (sortBy === 'deadline') {
          filteredQuests.sort(
            (a, b) => {
              const aDate = a.expiresAt ? new Date(a.expiresAt).getTime() : 0;
              const bDate = b.expiresAt ? new Date(b.expiresAt).getTime() : 0;
              return bDate - aDate; // Soonest first
            }
          );
        } else {
          // newest first (default)
          filteredQuests.sort(
            (a, b) => {
              const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
              const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
              return bDate - aDate; // Newest first
            }
          );
        }

        if (isMounted) {
          setQuests(filteredQuests);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          const message = err instanceof Error
            ? err.message
            : 'Failed to load quests. Please check your connection and try again.';
          setError(message);
          setIsLoading(false);
        }
      }
    };

    fetchQuests();

    return () => {
      setIsMounted(false);
    };
  }, [tab, sport, sortBy]);

  return { quests, isLoading, error };
}